// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var Pos = CodeMirror.Pos;

  function matches(hint, typed, matchInMiddle) {
    if (matchInMiddle) return hint.indexOf(typed) >= 0;
    else return hint.lastIndexOf(typed, 0) == 0;
  }

  function getHints(cm, options) {
    var tags = options && options.schemaInfo;
    var quote = (options && options.quoteChar) || '"';
    var matchInMiddle = options && options.matchInMiddle;
    if (!tags || !cm) return;
    var cur = cm.getCursor();
    if (!cur) return;
    var token = cm.getTokenAt(cur);
    if (!token) return;
    if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var lineText = cm.getLine(cur.line);
    if (typeof lineText !== 'string') return;
    var beforeCursor = lineText.slice(0, cur.ch);
    var openMatch = beforeCursor.match(/<([a-zA-Z0-9_\-:]*)$/);
    var closeMatch = beforeCursor.match(/<\/([a-zA-Z0-9_\-:]*)$/);

    var result = [], replaceToken = false, prefix, tagStart, tagType;

    // Αν πληκτρολογούμε μετά από < ή </
    if (openMatch || closeMatch) {
      tagType = closeMatch ? "close" : "open";
      prefix = closeMatch ? closeMatch[1].toLowerCase() : openMatch[1].toLowerCase();
      tagStart = Math.max(0, cur.ch - prefix.length - (tagType == "close" ? 2 : 1));
      replaceToken = true;

      var innerMode = CodeMirror.innerMode(cm.getMode(), token.state);
      var context = (innerMode.mode && innerMode.mode.xmlCurrentContext) ? innerMode.mode.xmlCurrentContext(innerMode.state) : [];
      var currentInner = context.length && context[context.length - 1];

      if (tagType == "close") {
        if (currentInner && (!prefix || matches(currentInner, prefix, matchInMiddle))) {
          result.push({
            text: "</" + currentInner + ">",
            displayText: "/" + currentInner
          });
        }
      } else {
        var VOID_TAGS = {
          'area': true, 'base': true, 'br': true, 'col': true, 'embed': true,
          'hr': true, 'img': true, 'input': true, 'link': true, 'meta': true,
          'param': true, 'source': true, 'track': true, 'wbr': true
        };

        // Ελέγχουμε αν υπάρχει ήδη '>' αμέσως μετά τον κέρσορα
        var afterCursor = lineText.slice(cur.ch);
        var hasGT = afterCursor.charAt(0) === '>';
        var replaceEndCh = hasGT ? (cur.ch + 1) : cur.ch;

        var allTagNames = Object.keys(tags).filter(function(k) {
          return k !== "!top" && k !== "!attrs";
        });
        allTagNames.sort();
        for (var i = 0; i < allTagNames.length; i++) {
          var name = allTagNames[i];
          if (!prefix || matches(name, prefix, matchInMiddle)) {
            var isVoid = !!VOID_TAGS[name];
            var insertFull = isVoid ? ("<" + name + ">") : ("<" + name + "></" + name + ">");
            var cursorOffset = name.length + 2; // τοποθετεί τον κέρσορα ακριβώς μετά το <tag>

            (function(tagName, fullText, offset, endCh) {
              result.push({
                text: fullText,
                displayText: tagName,
                hint: function(editor, data, curHint) {
                  var from = data.from;
                  var curLineContent = editor.getLine(from.line) || "";
                  var safeEndCh = Math.min(curLineContent.length, Math.max(from.ch, endCh));
                  var to = Pos(from.line, safeEndCh);
                  editor.replaceRange(fullText, from, to);
                  // Τοποθέτηση του κέρσορα ανάμεσα στο <tag> και </tag>
                  editor.setCursor({
                    line: from.line,
                    ch: Math.min(curLineContent.length + fullText.length, from.ch + offset)
                  });
                }
              });
            })(name, insertFull, cursorOffset, replaceEndCh);
          }
        }
      }

      return {
        list: result,
        from: Pos(cur.line, tagStart),
        to: Pos(cur.line, cur.ch)
      };
    }

    var inner = CodeMirror.innerMode(cm.getMode(), token.state);
    var tagInfo = inner.mode.xmlCurrentTag ? inner.mode.xmlCurrentTag(inner.state) : null;

    if (!tagInfo) {
      return;
    } else {
      // Attribute completion
      var curTag = tagInfo && tags[tagInfo.name], attrs = curTag && curTag.attrs;
      var globalAttrs = tags["!attrs"];
      if (!attrs && !globalAttrs) return;
      if (!attrs) {
        attrs = globalAttrs;
      } else if (globalAttrs) { // Combine tag-local and global attributes
        var set = {};
        for (var nm in globalAttrs) if (globalAttrs.hasOwnProperty(nm)) set[nm] = globalAttrs[nm];
        for (var nm in attrs) if (attrs.hasOwnProperty(nm)) set[nm] = attrs[nm];
        attrs = set;
      }
      if (token.type == "string" || token.string == "=") { // A value
        var before = cm.getRange(Pos(cur.line, Math.max(0, cur.ch - 60)),
                                 Pos(cur.line, token.type == "string" ? token.start : token.end));
        var atName = before.match(/([^\s\u00a0=<>\"\']+)=$/), atValues;
        if (!atName || !attrs.hasOwnProperty(atName[1]) || !(atValues = attrs[atName[1]])) return;
        if (typeof atValues == 'function') atValues = atValues.call(this, cm); // Functions can be used to supply values for autocomplete widget
        if (token.type == "string") {
          prefix = token.string;
          var n = 0;
          if (/['"]/.test(token.string.charAt(0))) {
            quote = token.string.charAt(0);
            prefix = token.string.slice(1);
            n++;
          }
          var len = token.string.length;
          if (/['"]/.test(token.string.charAt(len - 1))) {
            quote = token.string.charAt(len - 1);
            prefix = token.string.substr(n, len - 2);
          }
          if (n) { // an opening quote
            var line = cm.getLine(cur.line);
            if (line.length > token.end && line.charAt(token.end) == quote) token.end++; // include a closing quote
          }
          replaceToken = true;
        }
        var returnHintsFromAtValues = function(atValues) {
          if (atValues)
            for (var i = 0; i < atValues.length; ++i) if (!prefix || matches(atValues[i], prefix, matchInMiddle))
              result.push(quote + atValues[i] + quote);
          return returnHints();
        };
        if (atValues && atValues.then) return atValues.then(returnHintsFromAtValues);
        return returnHintsFromAtValues(atValues);
      } else { // An attribute name
        if (token.type == "attribute") {
          prefix = token.string;
          replaceToken = true;
        }
        for (var attr in attrs) if (attrs.hasOwnProperty(attr) && (!prefix || matches(attr, prefix, matchInMiddle)))
          result.push(attr);
      }
    }
    function returnHints() {
      return {
        list: result,
        from: replaceToken ? Pos(cur.line, tagStart == null ? token.start : tagStart) : cur,
        to: replaceToken ? Pos(cur.line, token.end) : cur
      };
    }
    return returnHints();
  }

  CodeMirror.registerHelper("hint", "xml", getHints);
});
