// EduHTML Studio - Κύριος κώδικας εφαρμογής

let currentMode = 'beginner'; // 'beginner' (ενιαίο) ή 'advanced' (multi-tab)
let activeTab = 'html'; // 'html' ή 'css'
let editor = null;
let htmlDoc = null; // το έγγραφο της ενεργής (ή της τελευταίας ενεργής) καρτέλας HTML
let cssDoc = null;  // το έγγραφο της ενεργής (ή της τελευταίας ενεργής) καρτέλας CSS

// Ανοιχτά αρχεία σε καρτέλες: { id, kind: 'html' | 'css', doc, path, saved }
// Η προεπισκόπηση δείχνει την καρτέλα HTML που έχει το focus (ή την τελευταία, όταν το focus είναι σε CSS).
let fileTabs = [];
let activeTabId = null;
let lastTabId = { html: null, css: null };
let nextTabId = 1;
let autoRefresh = true;
let refreshTimer = null;
let currentFontSize = 14;
let activeCategory = 'all';

// Καθαρός σκελετός HTML5 για νέο έγγραφο και αρχική εκκίνηση
const cleanNewSkeleton = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Νέα Ιστοσελίδα</title>
</head>
<body>

</body>
</html>`;

// Αρχικό περιεχόμενο εκκίνησης
const defaultBeginnerCode = cleanNewSkeleton;

const defaultAdvancedHTML = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Μαθητικό Portal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Εργαστήριο Πληροφορικής ΕΠΑΛ / ΓΕΛ</h1>
  </header>

  <main>
    <div class="card">
      <h2>Ανάπτυξη Ιστοσελίδων με HTML5 & CSS3</h2>
      <p>Στη λειτουργία «Προχωρημένος», ο κώδικας HTML και το αρχείο CSS είναι διαχωρισμένα σε καρτέλες για καλύτερη οργάνωση!</p>
    </div>
  </main>
</body>
</html>`;

const defaultAdvancedCSS = `/* style.css - Στυλ της ιστοσελίδας */
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f1f5f9;
  color: #334155;
}

header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 25px 20px;
  text-align: center;
}

main {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #2563eb;
}

h2 {
  color: #1e3a8a;
  margin-top: 0;
}`;

// Ρυθμίσεις εφαρμογής
let appSettings = {
  saveDirectory: '',
  browser: 'msedge',
  hideBeginnerControls: false,
  autoUpdateCheck: true,  // έλεγχος για νέα έκδοση κατά την εκκίνηση
  theme: 'dark',          // ένα από τα θέματα του js/themes.js
  headerColor: 'theme',   // χρώμα κεφαλίδας: 'theme' (ίδιο με το θέμα), προκαθορισμένο ή #rrggbb
  headerColor2: '',       // δεύτερο χρώμα της διαβάθμισης· κενό = ένα χρώμα
  headerDir: 'right'      // κατεύθυνση της διαβάθμισης: right, left, down, diag
};

// Παρακολούθηση τρέχοντος αποθηκευμένου/ανοιγμένου αρχείου
let currentHtmlFilePath = null;
let currentCssFilePath = null;

// Το όνομα ενός αρχείου από τη διαδρομή του (C:\…\askisi.html → askisi.html)
function fileNameOf(filePath) {
  return filePath ? String(filePath).split(/[\\/]/).pop() : '';
}

// Η διαδρομή όπως τη δείχνει ένας browser, συντομευμένη ώστε να φαίνεται πάντα το όνομα του αρχείου:
// C:\Users\x\Documents\mywebpages\askisi.html → file:///C:/…/mywebpages/askisi.html
function displayFileUrl(filePath) {
  const isNetwork = /^(\\\\|\/\/)/.test(filePath);
  const parts = String(filePath).split(/[\\/]/).filter(Boolean);
  const shown = parts.length > 4 ? [parts[0], '…', ...parts.slice(-2)] : parts;
  return (isNetwork ? 'file://' : 'file:///') + shown.join('/');
}

// Ορίζει το αρχείο που είναι ανοιχτό (kind: 'html' | 'css'· null = νέο, χωρίς αποθήκευση) και ενημερώνει την εμφάνιση
function setCurrentFile(kind, filePath) {
  if (kind === 'css') currentCssFilePath = filePath || null;
  else currentHtmlFilePath = filePath || null;
  const tab = fileTabs.find((t) => t.id === lastTabId[kind === 'css' ? 'css' : 'html']);
  if (tab) tab.path = filePath || null;
  updateFileUI();
}

// Οι καρτέλες, ο τίτλος του παραθύρου και η μπάρα της προεπισκόπησης δείχνουν το πραγματικό αρχείο
function updateFileUI() {
  const htmlTab = fileTabs.find((t) => t.id === lastTabId.html);
  const htmlName = htmlTab ? tabDisplayName(htmlTab) : (fileNameOf(currentHtmlFilePath) || 'Ανώνυμη');
  const notSaved = 'Νέο αρχείο: δεν έχει αποθηκευτεί ακόμα';

  renderTabs();

  const address = document.getElementById('preview-address');
  if (address) {
    address.textContent = currentHtmlFilePath ? displayFileUrl(currentHtmlFilePath) : 'Νέο αρχείο (δεν έχει αποθηκευτεί ακόμα)';
    address.title = currentHtmlFilePath || notSaved;
  }
  document.title = `${htmlName} — EduHTML Studio`;
}

// Βοηθητικές συναρτήσεις διαδρομών & φακέλου εργασίας (Working Directory)
function getDirectoryFromPath(filePath) {
  if (!filePath) return '';
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
  if (lastSlash !== -1) {
    return filePath.substring(0, lastSlash);
  }
  return '';
}

function getCurrentWorkingDir() {
  if (currentHtmlFilePath) {
    const dir = getDirectoryFromPath(currentHtmlFilePath);
    if (dir) return dir;
  }
  return appSettings.saveDirectory || '';
}

function getBaseHref(workingDir) {
  if (!workingDir) return '';
  let normalized = workingDir.replace(/\\/g, '/');
  if (!normalized.endsWith('/')) {
    normalized += '/';
  }
  // Κωδικοποίηση ειδικών χαρακτήρων (κενά, ελληνικά, #, %, ?) ώστε η διαδρομή να είναι έγκυρο URL
  normalized = encodeURI(normalized).replace(/#/g, '%23').replace(/\?/g, '%3F');
  if (!normalized.startsWith('file:')) {
    if (normalized.startsWith('//')) {
      normalized = 'file:' + normalized; // Διαδρομή δικτύου (UNC): \\server\share
    } else if (normalized.startsWith('/')) {
      normalized = 'file://' + normalized;
    } else {
      normalized = 'file:///' + normalized;
    }
  }
  return normalized;
}

// Το <base href> αλλάζει τη σημασία των συνδέσμων της μορφής href="#ενότητα" (θα οδηγούσαν έξω από τη σελίδα).
// Το μικρό αυτό script τους κρατά μέσα στη σελίδα (κύλιση στο στοιχείο με το αντίστοιχο id).
const BASE_FRAGMENT_FIX_SCRIPT =
  '<script>document.addEventListener("click",function(e){' +
  'var a=e.target&&e.target.closest?e.target.closest(\'a[href^="#"]\'):null;' +
  'if(!a||e.defaultPrevented)return;' +
  'var id=a.getAttribute("href").slice(1);try{id=decodeURIComponent(id);}catch(x){}' +
  'var t=id?(document.getElementById(id)||document.getElementsByName(id)[0]):null;' +
  'e.preventDefault();' +
  'if(t){t.scrollIntoView();}else if(!id||id.toLowerCase()==="top"){window.scrollTo(0,0);}' +
  '});<\/script>';

const BROWSER_NAMES = {
  msedge: 'Edge',
  chrome: 'Chrome',
  firefox: 'Firefox',
  brave: 'Brave',
  default: 'Browser'
};

function getBrowserName(key) {
  return BROWSER_NAMES[key] || 'Edge';
}

// Εκκίνηση της εφαρμογής όταν φορτώσει το DOM
document.addEventListener('DOMContentLoaded', () => {
  try { initSplashBanner(); } catch (e) { console.error('Splash init:', e); }
  try { initEditor(); } catch (e) { console.error('Editor init:', e); }
  try { initGuide(); } catch (e) { console.error('Guide init:', e); }
  try { initTemplatesModal(); } catch (e) { console.error('Templates init:', e); }
  try { initSettings(); } catch (e) { console.error('Settings init:', e); }
  try { updateFileUI(); } catch (e) { console.error('File UI init:', e); }
  try { initUpdater(); } catch (e) { console.error('Updater init:', e); }
  try { setupEventListeners(); } catch (e) { console.error('Listeners init:', e); }
  try { setupElectronMenuBridge(); } catch (e) { console.error('Menu bridge:', e); }
  try { initAppVersion(); } catch (e) { console.error('Version init:', e); }
  try { initContextMenu(); } catch (e) { console.error('ContextMenu init:', e); }
  try { updateLivePreview(); } catch (e) { console.error('Preview update:', e); }
  try { validateHtmlCode(); } catch (e) { console.error('Validation:', e); }

  // Αθόρυβος έλεγχος ενημερώσεων στο background λίγο μετά την εκκίνηση
  setTimeout(() => {
    if (appSettings.autoUpdateCheck === false) return;
    try { checkAppUpdates(true); } catch(e) { console.warn('Auto update check error:', e); }
  }, 3500);
});

// Δυναμική φόρτωση και ενημέρωση της έκδοσης (status bar & about modal)
async function initAppVersion() {
  let appVersion = '1.9.0';
  if (window.electronAPI && window.electronAPI.getVersion) {
    try {
      const v = await window.electronAPI.getVersion();
      if (v) appVersion = v;
    } catch (err) {
      console.warn('Could not fetch app version from electron:', err);
    }
  }

  const statusVersionEl = document.getElementById('status-version');
  if (statusVersionEl) {
    statusVersionEl.innerHTML = `<span>🌐</span> EduHTML v${appVersion}`;
  }

  const aboutVersionEls = document.querySelectorAll('.about-app-version');
  aboutVersionEls.forEach(el => {
    el.textContent = `v${appVersion}`;
  });
}

// Διαχείριση Banner Καλωσορίσματος / Splash Screen
let splashTimer = null;
function initSplashBanner() {
  const overlay = document.getElementById('splash-overlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('splash-close-btn');
  const startBtn = document.getElementById('splash-start-btn');

  const dismissSplash = () => {
    if (splashTimer) {
      clearTimeout(splashTimer);
      splashTimer = null;
    }
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      if (editor) editor.focus();
    }, 400);
  };

  if (closeBtn) closeBtn.onclick = dismissSplash;
  if (startBtn) startBtn.onclick = dismissSplash;

  // Αυτόματο κλείσιμο μετά από 3.5 δευτερόλεπτα
  splashTimer = setTimeout(dismissSplash, 3500);
}

// Αρχικοποίηση του CodeMirror
function initEditor() {
  const editorTextarea = document.getElementById('code-editor');

  const firstHtml = addFileTab('html', defaultBeginnerCode, null);
  const firstCss = addFileTab('css', defaultAdvancedCSS, null);
  htmlDoc = firstHtml.doc;
  cssDoc = firstCss.doc;
  activeTabId = firstHtml.id;

  editor = CodeMirror.fromTextArea(editorTextarea, {
    lineNumbers: true,
    theme: 'eduhtml',
    // Αυτόματο κλείσιμο ετικετών. Σε νέα γραμμή κλείνουν μόνο οι ετικέτες που περιέχουν άλλα στοιχεία (div, ul, table…)·
    // οι ετικέτες μίας γραμμής (h1–h6, p, a, li, title, button…) κλείνουν στην ίδια γραμμή, με τον κέρσορα ανάμεσα
    autoCloseTags: {
      whenClosing: true,
      whenOpening: true,
      indentTags: ['html', 'head', 'body', 'div', 'ul', 'ol', 'dl', 'table', 'thead', 'tbody', 'tfoot', 'tr',
        'form', 'fieldset', 'select', 'blockquote', 'section', 'article', 'nav', 'header', 'footer', 'main',
        'aside', 'figure', 'details', 'frameset', 'object']
    },
    autoCloseBrackets: true,
    matchTags: { bothTags: true },
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Alt-Space': 'autocomplete'
    }
  });

  editor.swapDoc(htmlDoc);

  let autocompleteTimer = null;

  // Αυτόματη εμφάνιση προτάσεων (Autocomplete) καθώς ο μαθητής ανοίγει tag ή πληκτρολογεί
  editor.on('inputRead', (cm, change) => {
    if (change.origin === '+input' || change.origin === 'paste') {
      const text = change.text ? change.text[0] : '';
      if (!text || text === ' ' || text === '\n' || text === '\t') return;
      
      if (autocompleteTimer) clearTimeout(autocompleteTimer);
      autocompleteTimer = setTimeout(() => {
        triggerAutocomplete(cm);
      }, 40);
    }
  });

  editor.on('change', (cm, change) => {
    // Σε περίπτωση διαγραφής (delete, cut κλπ.), ακυρώνουμε τυχόν εκκρεμές autocomplete και κλείνουμε ανοιχτές προτάσεις
    if (change && (change.origin === '+delete' || change.origin === 'cut' || !change.text || change.text.join('') === '')) {
      if (autocompleteTimer) {
        clearTimeout(autocompleteTimer);
        autocompleteTimer = null;
      }
      if (cm.state && cm.state.completionActive) {
        try { cm.state.completionActive.close(); } catch (e) {}
      }
    }
    onCodeChanged();
  });

  editor.on('cursorActivity', () => {
    updateCursorInfo();
  });

  // Δεξί κλικ στον CodeMirror editor
  editor.on('contextmenu', (cm, e) => {
    e.preventDefault();
    handleEditorContextMenu(cm, e);
  });
}

// Εκτέλεση προτάσεων HTML / CSS ανάλογα με την ενεργή καρτέλα
function triggerAutocomplete(cm) {
  if (!cm || (cm.state && cm.state.completionActive)) return; // Ήδη ενεργό παράθυρο προτάσεων

  try {
    const cursor = cm.getCursor();
    if (!cursor) return;
    const line = cm.getLine(cursor.line);
    if (typeof line !== 'string') return;
    const beforeCursor = line.slice(0, cursor.ch);

    if (activeTab === 'html') {
      // Εμφάνιση προτάσεων μόνο αν βρισκόμαστε σε tag ή πληκτρολογούμε μετά από < ή μέσα σε όνομα tag/attribute
      const isInsideTag = /<[a-zA-Z0-9_\-:]*$/.test(beforeCursor) || /<\/?[a-zA-Z0-9_\-:]*$/.test(beforeCursor);
      const token = cm.getTokenAt(cursor);
      const isInTagToken = token && (token.type === 'tag' || token.type === 'attribute' || token.type === 'string' || isInsideTag);

      if (isInTagToken || beforeCursor.endsWith('<')) {
        cm.showHint({
          hint: (CodeMirror.hint && (CodeMirror.hint.html || CodeMirror.hint.xml)) || (CodeMirror.hints && CodeMirror.hints.html),
          completeSingle: false
        });
      }
    } else if (activeTab === 'css') {
      cm.showHint({
        hint: (CodeMirror.hint && (CodeMirror.hint.css)) || (CodeMirror.hints && CodeMirror.hints.css),
        completeSingle: false
      });
    }
  } catch (err) {
    console.warn('Autocomplete error:', err);
  }
}

// Σημειώνει αν η καρτέλα έχει μη αποθηκευμένες αλλαγές (τελεία στην καρτέλα· η γραμμή κατάστασης δείχνει την ενεργή)
function markTabSaved(tab, saved) {
  if (!tab) return;
  const changed = tab.saved !== saved;
  tab.saved = saved;
  if (tab.id === activeTabId) {
    const saveEl = document.getElementById('status-save');
    if (saveEl) saveEl.textContent = saved ? '✔ Αποθηκευμένο' : '● Μη αποθηκευμένο';
  }
  if (changed) renderTabs();
}

// Η κατάσταση αποθήκευσης της καρτέλας που φαίνεται στον editor
function setSavedState(saved) {
  markTabSaved(getActiveTab(), saved);
}

// ---------------------------------------------------------------- καρτέλες αρχείων
function getActiveTab() {
  return fileTabs.find((t) => t.id === activeTabId) || null;
}

function tabOfDoc(doc) {
  return fileTabs.find((t) => t.doc === doc) || null;
}

function tabOfPath(filePath) {
  if (!filePath) return null;
  const p = String(filePath).toLowerCase();
  return fileTabs.find((t) => t.path && String(t.path).toLowerCase() === p) || null;
}

// Ένα αρχείο που δεν έχει αποθηκευτεί ακόμα λέγεται «Ανώνυμη N» (CSS: «Ανώνυμο CSS N»), ώστε ο μαθητής να βλέπει
// ότι πρέπει να το αποθηκεύσει· μετά την αποθήκευση η καρτέλα παίρνει το όνομα του αρχείου
let untitledCounter = { html: 0, css: 0 };
function tabDisplayName(tab) {
  if (tab.path) return fileNameOf(tab.path);
  return (tab.kind === 'css' ? 'Ανώνυμο CSS ' : 'Ανώνυμη ') + tab.untitledNo;
}

// Νέα καρτέλα (χωρίς να γίνει ενεργή)
function addFileTab(kind, content, filePath) {
  const tab = {
    id: nextTabId++,
    kind,
    doc: CodeMirror.Doc(content || '', kind === 'css' ? 'css' : 'htmlmixed'),
    path: filePath || null,
    saved: true,
    untitledNo: ++untitledCounter[kind] // αρίθμηση των ανώνυμων καρτελών (Ανώνυμη 1, Ανώνυμη 2…)
  };
  fileTabs.push(tab);
  if (!lastTabId[kind]) lastTabId[kind] = tab.id;
  return tab;
}

// Καρτέλα που μπορεί να αντικατασταθεί από ένα αρχείο που ανοίγει: νέα, χωρίς αλλαγές (π.χ. η αρχική)
function isPristineTab(tab) {
  return !!tab && !tab.path && tab.saved;
}

// Κάνει ενεργή μια καρτέλα: τη δείχνει ο editor και (αν είναι HTML) η προεπισκόπηση
function activateTab(id) {
  const tab = fileTabs.find((t) => t.id === id);
  if (!tab) return;
  if (tab.kind === 'css' && currentMode === 'beginner') setMode('advanced');
  activeTabId = tab.id;
  activeTab = tab.kind;
  lastTabId[tab.kind] = tab.id;
  if (tab.kind === 'css') {
    cssDoc = tab.doc;
    currentCssFilePath = tab.path;
  } else {
    htmlDoc = tab.doc;
    currentHtmlFilePath = tab.path;
  }
  if (editor && editor.getDoc() !== tab.doc) editor.swapDoc(tab.doc);
  const saveEl = document.getElementById('status-save');
  if (saveEl) saveEl.textContent = tab.saved ? '✔ Αποθηκευμένο' : '● Μη αποθηκευμένο';
  updateFileUI();
  if (editor) {
    editor.focus();
    updateCursorInfo();
  }
  try { updateLivePreview(); } catch (e) { console.error('Preview error:', e); }
  try { validateHtmlCode(); } catch (e) { console.error('Validation error:', e); }
}

// Ανοίγει περιεχόμενο σε καρτέλα: αν το αρχείο είναι ήδη ανοιχτό, πηγαίνει σε αυτό· μια νέα, άθικτη καρτέλα του ίδιου
// είδους αντικαθίσταται (π.χ. η αρχική κενή σελίδα)· αλλιώς ανοίγει νέα καρτέλα
function openInTab(kind, content, filePath) {
  const existing = tabOfPath(filePath);
  if (existing) {
    activateTab(existing.id);
    return existing;
  }
  const current = fileTabs.find((t) => t.id === lastTabId[kind]);
  let tab;
  if (isPristineTab(current)) {
    tab = current;
    tab.doc.setValue(content);
    tab.doc.clearHistory();
    tab.path = filePath || null;
  } else {
    tab = addFileTab(kind, content, filePath);
  }
  tab.saved = true;
  activateTab(tab.id);
  return tab;
}

// Κλείνει μια καρτέλα (ρωτά αν έχει μη αποθηκευμένες αλλαγές). Μένει πάντα τουλάχιστον μία καρτέλα HTML.
function closeFileTab(id) {
  const tab = fileTabs.find((t) => t.id === id);
  if (!tab) return;
  const name = tabDisplayName(tab);
  if (!tab.saved && !confirm(`Το αρχείο «${name}» έχει μη αποθηκευμένες αλλαγές που θα χαθούν.\n\nΝα κλείσει χωρίς αποθήκευση;`)) return;

  const index = fileTabs.indexOf(tab);
  fileTabs.splice(index, 1);
  if (!fileTabs.some((t) => t.kind === 'html')) addFileTab('html', cleanNewSkeleton, null);
  if (!fileTabs.some((t) => t.kind === 'css')) addFileTab('css', defaultAdvancedCSS, null);
  for (const kind of ['html', 'css']) {
    if (lastTabId[kind] === id) {
      const same = fileTabs.filter((t) => t.kind === kind);
      lastTabId[kind] = (same[Math.min(index, same.length - 1)] || same[0]).id;
    }
  }
  if (activeTabId === id) {
    const visible = visibleTabs();
    const next = visible[Math.min(index, visible.length - 1)] || visible[0];
    activateTab(next.id);
  } else {
    renderTabs();
  }
}

// Στη λειτουργία «Αρχάριος» φαίνονται μόνο οι καρτέλες HTML
function visibleTabs() {
  return fileTabs.filter((t) => currentMode === 'advanced' || t.kind === 'html');
}

function renderTabs() {
  const group = document.getElementById('tabs-group');
  if (!group) return;
  group.innerHTML = '';
  for (const tab of visibleTabs()) {
    const name = tabDisplayName(tab);
    const el = document.createElement('div');
    el.className = 'tab' + (tab.id === activeTabId ? ' active' : '') + (tab.saved ? '' : ' is-dirty');
    el.dataset.kind = tab.kind;
    el.dataset.tabId = tab.id;
    el.setAttribute('role', 'tab');
    el.setAttribute('aria-selected', tab.id === activeTabId ? 'true' : 'false');
    el.title = (tab.path || 'Νέο αρχείο: δεν έχει αποθηκευτεί ακόμα') + (tab.saved ? '' : '\n● Μη αποθηκευμένες αλλαγές');

    const icon = document.createElement('span');
    icon.className = 'tab-icon';
    const label = document.createElement('span');
    label.className = 'tab-name';
    label.textContent = name;
    const close = document.createElement('button');
    close.className = 'tab-close';
    close.type = 'button';
    close.textContent = '✕';
    close.title = 'Κλείσιμο (Ctrl+W)';
    close.onclick = (e) => { e.stopPropagation(); closeFileTab(tab.id); };

    el.append(icon, label, close);
    el.onclick = () => { if (tab.id !== activeTabId) activateTab(tab.id); };
    el.onauxclick = (e) => { if (e.button === 1) { e.preventDefault(); closeFileTab(tab.id); } }; // μεσαίο κλικ
    group.appendChild(el);
    if (tab.id === activeTabId) setTimeout(() => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }), 0);
  }
}

// Ctrl+Tab / Ctrl+Shift+Tab: επόμενη / προηγούμενη καρτέλα
function cycleTabs(step) {
  const visible = visibleTabs();
  if (visible.length < 2) return;
  const i = visible.findIndex((t) => t.id === activeTabId);
  activateTab(visible[(i + step + visible.length) % visible.length].id);
}

function onCodeChanged() {
  setSavedState(false);
  
  if (autoRefresh) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      try { updateLivePreview(); } catch (e) { console.error('Preview error:', e); }
      try { validateHtmlCode(); } catch (e) { console.error('Validation error:', e); }
    }, 350);
  }
}

function updateCursorInfo() {
  if (!editor) return;
  try {
    const cursor = editor.getCursor();
    const cursorEl = document.getElementById('status-cursor');
    if (cursorEl && cursor) {
      cursorEl.textContent = `Γραμμή ${cursor.line + 1}, Στήλη ${cursor.ch + 1}`;
    }
  } catch (e) {}
}

// Εναλλαγή μεταξύ Λειτουργίας Αρχάριος / Προχωρημένος
function setMode(mode) {
  if (currentMode === mode) return;

  const btnBeginner = document.getElementById('btn-mode-beginner');
  const btnAdvanced = document.getElementById('btn-mode-advanced');

  if (mode === 'beginner') {
    currentMode = 'beginner';
    btnBeginner.classList.add('active');
    btnAdvanced.classList.remove('active');
    switchTab('html');
    renderTabs();
    showToast('Λειτουργία «Αρχάριος»: Ενιαίο αρχείο HTML με εσωτερικό CSS');
  } else {
    currentMode = 'advanced';
    btnAdvanced.classList.add('active');
    btnBeginner.classList.remove('active');
    renderTabs();
    showToast('Λειτουργία «Προχωρημένος»: Ξεχωριστά Tabs HTML και CSS');
  }

  applyModeVisibility();
  renderGuideCategories();
  filterGuideItems(document.getElementById('guide-search-input') ? document.getElementById('guide-search-input').value.trim().toLowerCase() : '');
  initTemplatesModal();
  updateLivePreview();
  validateHtmlCode();
}

// Μετάβαση στην (τελευταία ενεργή) καρτέλα HTML ή CSS
function switchTab(kind) {
  if (activeTab === kind && getActiveTab() && getActiveTab().kind === kind) return;
  let tab = fileTabs.find((t) => t.id === lastTabId[kind]) || fileTabs.find((t) => t.kind === kind);
  if (!tab) tab = addFileTab(kind, kind === 'css' ? defaultAdvancedCSS : cleanNewSkeleton, null);
  activateTab(tab.id);
}

// --- ΣΥΝΔΕΣΗ HTML ↔ CSS (λειτουργία «Προχωρημένος») ---

// Τα <link rel="stylesheet" href="…"> της σελίδας (εκτός σχολίων): { index, length, href, local }
function stylesheetLinks(html) {
  const code = String(html).replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length)); // τα σχόλια αγνοούνται, οι θέσεις μένουν
  const out = [];
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(code))) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?[^"'>]*\bstylesheet\b/i.test(tag)) continue;
    const h = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(tag);
    const href = h ? (h[1] !== undefined ? h[1] : (h[2] !== undefined ? h[2] : h[3])) : '';
    out.push({ index: m.index, length: tag.length, href, local: !!href && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href) });
  }
  return out;
}

function normPath(p) {
  return String(p).split('\\').join('/').toLowerCase();
}

// Η διαδρομή ενός href (π.χ. css/style.css, ../koino.css) ως προς τον φάκελο της σελίδας
function resolveHref(htmlPath, href) {
  let clean = String(href).split(/[?#]/)[0];
  try { clean = decodeURIComponent(clean); } catch (_) { /* μένει όπως είναι */ }
  const parts = getDirectoryFromPath(htmlPath).split(/[\\/]/).filter((s, i) => s || i === 0);
  for (const seg of clean.split(/[\\/]/)) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

// Η ανοιχτή καρτέλα CSS που αντιστοιχεί σε ένα href της σελίδας (ή null)
function cssTabForHref(href) {
  const clean = String(href).split(/[?#]/)[0].replace(/^\.\//, '');
  const base = fileNameOf(clean).toLowerCase();
  const cssTabs = fileTabs.filter((t) => t.kind === 'css');
  let found = null;
  if (currentHtmlFilePath && /[\\/]/.test(currentHtmlFilePath)) {
    const target = normPath(resolveHref(currentHtmlFilePath, clean));
    found = cssTabs.find((t) => t.path && normPath(t.path) === target);
  } else {
    found = cssTabs.find((t) => t.path && fileNameOf(t.path).toLowerCase() === base);
  }
  if (found) return found;
  // Ένα ανώνυμο CSS θα αποθηκευτεί ως style.css δίπλα στη σελίδα: το <link href="style.css"> το βρίσκει ήδη.
  // Για μια αποθηκευμένη σελίδα μετρά μόνο αν ο μαθητής έχει γράψει σε αυτό· αλλιώς ισχύει το style.css του δίσκου.
  if (base === 'style.css' && !/[\\/]/.test(clean)) {
    const pageSaved = !!currentHtmlFilePath && /[\\/]/.test(currentHtmlFilePath);
    const usable = (t) => !t.path && (!pageSaved || !t.saved);
    const last = cssTabs.find((t) => t.id === lastTabId.css);
    return (last && usable(last)) ? last : (cssTabs.find(usable) || null);
  }
  return null;
}

// --- ΑΡΧΕΙΑ ΠΟΥ ΑΝΑΦΕΡΕΙ Η ΣΕΛΙΔΑ ΑΛΛΑ ΔΕΝ ΥΠΑΡΧΟΥΝ ---
// Εικόνες, CSS, JavaScript, σελίδες (<a href>), βίντεο/ήχος, iframe: ελέγχονται στον δίσκο, ως προς τον φάκελο της
// σελίδας (ή τον φάκελο εργασίας, αν δεν έχει αποθηκευτεί), και εμφανίζονται στις παρατηρήσεις της μπάρας ελέγχου.
const REF_LABELS = {
  img: 'εικόνα', source: 'πολυμέσα', video: 'βίντεο', audio: 'ήχος', track: 'υπότιτλοι', script: 'JavaScript',
  link: 'CSS', a: 'σύνδεσμος σε σελίδα', iframe: 'σελίδα σε iframe', embed: 'αρχείο', object: 'αρχείο'
};

// Τα τοπικά αρχεία που αναφέρει η σελίδα: [{ tag, href }] (όχι διευθύνσεις internet, #άγκυρες, mailto: κ.λπ.)
function localReferences(html) {
  const code = String(html).replace(/<!--[\s\S]*?-->/g, '');
  const refs = [];
  const re = /<(img|source|video|audio|track|script|link|a|iframe|embed|object)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(code))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    if (tag === 'link' && !/\brel\s*=\s*["']?[^"'>]*\bstylesheet\b/i.test(attrs)) continue; // από τα <link> μόνο τα CSS
    const attr = (tag === 'a' || tag === 'link') ? 'href' : (tag === 'object' ? 'data' : 'src');
    const am = new RegExp('(?:^|\\s)' + attr + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s"\'>]+))', 'i').exec(attrs);
    if (!am) continue;
    const value = (am[1] !== undefined ? am[1] : (am[2] !== undefined ? am[2] : am[3] || '')).trim();
    if (!value || value.startsWith('#')) continue;
    if (/^(https?:)?\/\//i.test(value) || /^(data|mailto|tel|javascript|about|blob|sms):/i.test(value)) continue;
    refs.push({ tag, href: value });
  }
  return refs;
}

// Η διαδρομή στον δίσκο ενός href/src (σχετικό ως προς τον φάκελο, ή file:///…), ή null αν δεν ελέγχεται
function refToPath(baseDir, href) {
  let clean = String(href).split(/[?#]/)[0];
  try { clean = decodeURIComponent(clean); } catch (_) { /* μένει όπως είναι */ }
  if (/^file:/i.test(clean)) {
    const rest = clean.replace(/^file:\/*/i, '');
    return /^[a-z]:/i.test(rest) ? rest : '//' + rest; // file:///C:/… ή file://server/share/…
  }
  if (/^[a-z]:[\\/]/i.test(clean) || /^\\\\/.test(clean)) return clean;
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith('/') || !baseDir) return null;
  const parts = baseDir.split(/[\\/]/).filter((s, i) => s || i === 0);
  for (const seg of clean.split(/[\\/]/)) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

let missingFiles = [];       // [{ tag, href }] που δεν βρέθηκαν
let unsavedLinkedCss = [];   // href ανώνυμων CSS που χρησιμοποιεί η σελίδα αλλά δεν έχουν αποθηκευτεί
let fileCheckToken = 0;

// Ελέγχει στον δίσκο τα αρχεία που αναφέρει η σελίδα· αν αλλάξει το αποτέλεσμα, ενημερώνει τη μπάρα ελέγχου
async function checkReferencedFiles(code) {
  if (!window.electronAPI || !window.electronAPI.checkFilesExist) return;
  const token = ++fileCheckToken;
  const baseDir = getCurrentWorkingDir();
  const pageSaved = !!currentHtmlFilePath && /[\\/]/.test(currentHtmlFilePath);
  const seen = new Set();
  const refs = [];
  const unsaved = [];
  for (const ref of localReferences(code)) {
    if (seen.has(ref.tag + '|' + ref.href)) continue;
    seen.add(ref.tag + '|' + ref.href);
    // Στον «Προχωρημένο» ένα CSS ανοιχτό σε καρτέλα δίνει το περιεχόμενό του στην προεπισκόπηση
    if (ref.tag === 'link' && currentMode === 'advanced') {
      const tab = cssTabForHref(ref.href);
      if (tab && !tab.path) {
        if (pageSaved) unsaved.push(ref.href);
        continue;
      }
    }
    refs.push(ref);
  }
  const paths = refs.map((r) => refToPath(baseDir, r.href));
  const toCheck = paths.filter(Boolean);
  let exists = [];
  try {
    exists = toCheck.length ? await window.electronAPI.checkFilesExist(toCheck) : [];
  } catch (_) {
    return;
  }
  if (token !== fileCheckToken) return; // στο μεταξύ ο κώδικας άλλαξε: ισχύει ο νεότερος έλεγχος
  const existsByPath = new Map(toCheck.map((p, i) => [p, !!exists[i]]));
  const missing = refs.filter((r, i) => paths[i] && !existsByPath.get(paths[i]));
  const key = (list) => JSON.stringify(list);
  if (key(missing) !== key(missingFiles) || key(unsaved) !== key(unsavedLinkedCss)) {
    missingFiles = missing;
    unsavedLinkedCss = unsaved;
    validateHtmlCode(true);
  }
}

// Προσθέτει <link rel="stylesheet" href="…"> μέσα στο <head> της σελίδας (κουμπί «Σύνδεση με CSS»)
function insertCssLink() {
  if (currentMode !== 'advanced') setMode('advanced');
  if (activeTab !== 'html') switchTab('html');

  // το CSS της τελευταίας καρτέλας CSS, με διαδρομή ως προς τη σελίδα· αλλιώς style.css
  let href = 'style.css';
  const css = fileTabs.find((t) => t.id === lastTabId.css);
  if (css && css.path) {
    const dir = normPath(getDirectoryFromPath(currentHtmlFilePath || ''));
    const cssPath = String(css.path).split('\\').join('/');
    href = (dir && normPath(cssPath).startsWith(dir + '/')) ? cssPath.slice(dir.length + 1) : fileNameOf(css.path);
  }
  const line = `<link rel="stylesheet" href="${href}">`;

  const text = htmlDoc.getValue();
  const headClose = text.search(/<\/head\s*>/i);
  let at;
  let insert;
  if (headClose >= 0) {
    const lineStart = text.lastIndexOf('\n', headClose - 1) + 1;
    const before = text.slice(lineStart, headClose);
    if (/^\s*$/.test(before)) {
      // το </head> είναι μόνο του στη γραμμή: νέα γραμμή από πάνω, με την εσοχή του head + 2 κενά
      at = lineStart;
      insert = before + '  ' + line + '\n';
    } else {
      at = headClose;
      insert = line;
    }
  } else {
    const htmlOpen = /<html\b[^>]*>/i.exec(text);
    at = htmlOpen ? htmlOpen.index + htmlOpen[0].length : 0;
    insert = (htmlOpen ? '\n' : '') + '<head>\n  ' + line + '\n</head>' + (htmlOpen ? '' : '\n');
  }
  htmlDoc.replaceRange(insert, htmlDoc.posFromIndex(at));
  const lineIndex = at + insert.indexOf(line);
  htmlDoc.setSelection(htmlDoc.posFromIndex(lineIndex), htmlDoc.posFromIndex(lineIndex + line.length));
  editor.focus();
  showToast(`Η σελίδα συνδέθηκε με το «${href}».`);
}

// Σύνθεση τελικού κώδικα HTML για προεπισκόπηση και εξωτερικό browser
function getCompiledHTML(includeBase = true) {
  let htmlContent = htmlDoc.getValue();

  if (currentMode !== 'beginner') {
    // Προχωρημένος: το CSS εφαρμόζεται ΜΟΝΟ μέσω των <link rel="stylesheet"> της σελίδας, όπως σε έναν browser.
    // Ένα <link> προς αρχείο που είναι ανοιχτό σε καρτέλα παίρνει το περιεχόμενο της καρτέλας (μαζί με τις αλλαγές που
    // δεν έχουν αποθηκευτεί)· τα υπόλοιπα φορτώνονται από τον δίσκο μέσω του <base href>.
    const links = stylesheetLinks(htmlContent);
    for (let i = links.length - 1; i >= 0; i--) {
      const link = links[i];
      const tab = link.local ? cssTabForHref(link.href) : null;
      if (!tab) continue;
      const style = `<style data-href="${link.href.replace(/"/g, '&quot;')}">\n${tab.doc.getValue()}\n</style>`;
      htmlContent = htmlContent.slice(0, link.index) + style + htmlContent.slice(link.index + link.length);
    }
  }

  // Εισαγωγή <base href="..."> για σωστή ανάλυση σχετικών διαδρομών εικόνων στον φάκελο εργασίας
  if (includeBase) {
    const workingDir = getCurrentWorkingDir();
    if (workingDir && !htmlContent.includes('<base ') && !htmlContent.includes('<base>')) {
      const baseHref = getBaseHref(workingDir);
      const baseTag = `<base href="${baseHref}">\n  ${BASE_FRAGMENT_FIX_SCRIPT}`;

      // Χρήση συνάρτησης στο replace ώστε χαρακτήρες όπως "$" στη διαδρομή να μην ερμηνευτούν ως ειδικά μοτίβα
      if (/<head\b[^>]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<head\b[^>]*>/i, (m) => `${m}\n  ${baseTag}`);
      } else if (/<html\b[^>]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<html\b[^>]*>/i, (m) => `${m}\n<head>\n  ${baseTag}\n</head>`);
      } else {
        htmlContent = `<head>\n  ${baseTag}\n</head>\n${htmlContent}`;
      }
    }
  }

  return htmlContent;
}

// Ενημέρωση του ενσωματωμένου browser preview
function updateLivePreview() {
  try {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;
    let compiled = getCompiledHTML();
    
    // Αποτροπή κλοπής focus από autofocus στοιχεία του μαθητή στο ενσωματωμένο preview
    if (compiled) {
      compiled = compiled.replace(/\bautofocus\b/gi, 'data-autofocus');
    }

    // Υποστήριξη δεξιού κλικ μέσα στο ενσωματωμένο preview
    const previewCtxScript = `\n<script>
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  var sel = window.getSelection() ? window.getSelection().toString() : '';
  window.parent.postMessage({
    type: 'preview-contextmenu',
    clientX: e.clientX,
    clientY: e.clientY,
    selection: sel
  }, '*');
});
<\/script>`;

    if (compiled.includes('</body>')) {
      compiled = compiled.replace('</body>', `${previewCtxScript}\n</body>`);
    } else {
      compiled += previewCtxScript;
    }
    
    previewFrame.srcdoc = compiled;
  } catch (err) {
    console.warn('Update preview error:', err);
  }
}

// Άνοιγμα στον Επιλεγμένο Browser / Άνοιγμα URL
/**
 * Η «Προβολή στον browser» ανοίγει το ΙΔΙΟ το αρχείο της σελίδας (π.χ. askisi.html), όχι προσωρινό αντίγραφο.
 * Πρώτα αποθηκεύεται, όπως με το Ctrl+S· μια σελίδα που δεν έχει αποθηκευτεί ακόμα ζητά όνομα. Στη λειτουργία
 * «Προχωρημένος» αποθηκεύεται και το CSS (ένα νέο CSS προτείνεται ως style.css δίπλα στη σελίδα, όπως το συνδέει το HTML).
 * Επιστρέφει τη διαδρομή της σελίδας ή null αν ο χρήστης ακύρωσε την αποθήκευση.
 */
async function saveForBrowserView() {
  if (!currentHtmlFilePath || !/[\\/]/.test(currentHtmlFilePath)) {
    showToast('Αποθηκεύστε τη σελίδα για να ανοίξει στον browser.');
    if (!(await saveDoc('html', { saveAs: true, quiet: true }))) return null;
  } else if (!(await saveDoc('html', { quiet: true }))) {
    return null;
  }
  if (currentMode === 'advanced') {
    await saveDoc('css', { saveAs: !currentCssFilePath, quiet: true });
  }
  return currentHtmlFilePath;
}

async function openInExternalBrowser(options = {}) {
  const browser = (options && options.browser) ? options.browser : (appSettings.browser || 'msedge');
  const isUrl = !!(options && options.isUrl && options.url);
  const targetUrl = isUrl ? options.url : '';
  const browserLabel = getBrowserName(browser);

  const payload = {
    browser: browser,
    isUrl: isUrl,
    url: targetUrl
  };

  let viewedFile = null;
  if (!isUrl && window.electronAPI && window.electronAPI.openInExternalBrowser) {
    viewedFile = await saveForBrowserView();
    if (viewedFile) {
      payload.filePath = viewedFile;
    } else {
      // Ο χρήστης δεν αποθήκευσε: ο browser δείχνει προσωρινό αντίγραφο της σελίδας
      payload.content = getCompiledHTML();
    }
  }

  if (window.electronAPI && window.electronAPI.openInExternalBrowser) {
    const res = await window.electronAPI.openInExternalBrowser(payload);
    if (res.success) {
      if (isUrl) {
        showToast(`Άνοιγμα του ${targetUrl} στον ${browserLabel}...`);
      } else if (viewedFile) {
        showToast(`Αποθηκεύτηκε και άνοιξε στον ${browserLabel}: ${fileNameOf(viewedFile)}`);
      } else {
        showToast(`Η σελίδα δεν αποθηκεύτηκε· ο ${browserLabel} δείχνει προσωρινό αντίγραφο.`, 4500);
      }
    } else {
      showToast('Σφάλμα κατά το άνοιγμα του browser: ' + res.error);
    }
  } else {
    // Fallback για browser περιβάλλον
    const target = isUrl ? targetUrl : URL.createObjectURL(new Blob([getCompiledHTML()], { type: 'text/html' }));
    window.open(target, '_blank');
    showToast('Άνοιγμα σε νέα καρτέλα!');
  }
}

// Σύνδεση με το Πανελλήνιο Σχολικό Δίκτυο (eclass.sch.gr)
function openEclass() {
  openInExternalBrowser({ isUrl: true, url: 'https://eclass.sch.gr' });
}

// Διαδραστικός Οδηγός Εντολών
function initGuide() {
  renderGuideCategories();
  renderGuideItems();

  const searchInput = document.getElementById('guide-search-input');
  const clearBtn = document.getElementById('guide-search-clear');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    clearBtn.style.display = query ? 'block' : 'none';
    filterGuideItems(query);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    filterGuideItems('');
  });
}

function renderGuideCategories() {
  const container = document.getElementById('guide-categories');
  container.innerHTML = '';

  const visibleCategories = GUIDE_CATEGORIES.filter(cat => {
    if (cat.requiresMode === 'advanced' && currentMode === 'beginner') {
      return false;
    }
    return true;
  });

  // Αν η επιλεγμένη κατηγορία έγινε κρυφή (π.χ. μετάβαση σε beginner), επιστροφή στο 'all'
  if (activeCategory !== 'all' && !visibleCategories.some(c => c.id === activeCategory)) {
    activeCategory = 'all';
  }

  visibleCategories.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = `cat-pill ${cat.id === activeCategory ? 'active' : ''}`;
    pill.textContent = `${cat.icon} ${cat.title}`;
    pill.onclick = () => {
      activeCategory = cat.id;
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const searchVal = document.getElementById('guide-search-input').value.trim().toLowerCase();
      filterGuideItems(searchVal);
    };
    container.appendChild(pill);
  });
}

function renderGuideItems(filteredItems = GUIDE_ITEMS) {
  const container = document.getElementById('guide-content');
  container.innerHTML = '';

  // Φιλτράρισμα βάσει λειτουργίας (Απόκρυψη JavaScript σε Αρχάριο)
  let itemsToRender = filteredItems.filter(item => {
    if (item.requiresMode === 'advanced' && currentMode === 'beginner') {
      return false;
    }
    return true;
  });

  if (itemsToRender.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 13px;">
      Δεν βρέθηκαν εντολές που να ταιριάζουν στην αναζήτησή σας.
    </div>`;
    return;
  }

  itemsToRender.forEach(item => {
    const card = document.createElement('div');
    card.className = 'guide-card';

    card.innerHTML = `
      <div class="guide-card-header">
        <span class="guide-tag-name">${escapeHtml(item.name)}</span>
        <span class="guide-level-badge">${item.level}</span>
      </div>
      <div class="guide-card-summary">${item.summary}</div>
      <div class="guide-card-desc">${item.description}</div>
      <div class="guide-card-example">${escapeHtml(item.example)}</div>
      <div class="guide-card-actions">
        <button class="btn-insert" data-target="${item.target}">
          <span>↵</span> Εισαγωγή στον Editor
        </button>
        ${item.pickFile === 'image' ? '<button class="btn-insert btn-insert-file"><span>🖼️</span> Εικόνα από αρχείο…</button>' : ''}
      </div>
    `;

    const insertBtn = card.querySelector('.btn-insert');
    insertBtn.onclick = () => {
      insertCodeToEditor(item.insertCode, item.target);
    };
    const insertFileBtn = card.querySelector('.btn-insert-file');
    if (insertFileBtn) insertFileBtn.onclick = insertImageFromFile;

    container.appendChild(card);
  });
}

function filterGuideItems(query) {
  let filtered = GUIDE_ITEMS.filter(item => {
    if (item.requiresMode === 'advanced' && currentMode === 'beginner') {
      return false;
    }
    return true;
  });

  if (activeCategory !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory);
  }

  if (query) {
    filtered = filtered.filter(item => {
      return item.name.toLowerCase().includes(query) ||
             item.summary.toLowerCase().includes(query) ||
             item.description.toLowerCase().includes(query) ||
             item.example.toLowerCase().includes(query);
    });
  }

  renderGuideItems(filtered);
}

// Εισαγωγή κώδικα στο σημείο του κέρσορα
function insertCodeToEditor(code, targetDocType) {
  // Αν το στοιχείο αφορά CSS και είμαστε σε multi-tab λειτουργία
  if (currentMode === 'advanced' && targetDocType === 'css' && activeTab !== 'css') {
    switchTab('css');
  } else if (currentMode === 'advanced' && targetDocType === 'html' && activeTab !== 'html') {
    switchTab('html');
  }

  editor.replaceSelection(code);
  editor.focus();
  showToast('Ο κώδικας εισήχθη επιτυχώς!');
}

// --- ΕΙΣΑΓΩΓΗ ΕΙΚΟΝΑΣ (<img src="">) ---
// Ο χρήστης επιλέγει το αρχείο από τον διάλογο των Windows και η διαδρομή μπαίνει μέσα στα "" του src (δες imagePath.js):
// ίδιος φάκελος με τη σελίδα → μόνο το όνομα, υποφάκελος → σχετική διαδρομή (images/foto.jpg), αλλού → ολόκληρη η διαδρομή.
// Αν ο κέρσορας είναι μέσα σε ένα <img>, συμπληρώνεται το src του· αλλιώς μπαίνει ολόκληρη η ετικέτα (δες image-insert.js).
async function insertImageFromFile() {
  if (window.electronAPI && window.electronAPI.pickImage) {
    let picked;
    try {
      picked = await window.electronAPI.pickImage(getCurrentWorkingDir());
    } catch (err) {
      console.error('Image picker error:', err);
      showToast('Δεν ήταν δυνατή η επιλογή εικόνας.');
      return;
    }
    if (picked) applyImageSrc(picked.src, picked.where);
    return;
  }

  // Εκτός Electron ο browser δίνει μόνο το όνομα του αρχείου
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (file) applyImageSrc(file.name, 'same');
  };
  input.click();
}

function applyImageSrc(src, where) {
  // Η εικόνα μπαίνει πάντα στο HTML, όχι στο CSS
  if (currentMode === 'advanced' && activeTab !== 'html') switchTab('html');

  const text = htmlDoc.getValue();
  const plan = ImageInsert.planImageInsert(
    text,
    htmlDoc.indexFromPos(htmlDoc.getCursor('from')),
    htmlDoc.indexFromPos(htmlDoc.getCursor('to')),
    src
  );
  htmlDoc.replaceRange(plan.insert, htmlDoc.posFromIndex(plan.from), htmlDoc.posFromIndex(plan.to));
  const cursor = htmlDoc.posFromIndex(plan.cursor);
  htmlDoc.setCursor(cursor);
  editor.scrollIntoView(cursor, 80);
  editor.focus();

  if (where === 'outside') {
    showToast('Η εικόνα είναι εκτός του φακέλου της σελίδας, οπότε κρατήθηκε ολόκληρη η διαδρομή. Για να φαίνεται και σε άλλον υπολογιστή, αντιγράψτε την στον φάκελο της σελίδας.', 6500);
  } else if (where === 'sub') {
    showToast(`Εισήχθη η εικόνα με σχετική διαδρομή «${src}».`, 4000);
  } else {
    showToast(`Εισήχθη η εικόνα «${src}» (ίδιος φάκελος με τη σελίδα).`);
  }
}

// Έγκυρες πρότυπες ετικέτες HTML5 (για ανίχνευση ορθογραφικών λαθών)
const VALID_HTML5_TAGS = new Set([
  'html', 'head', 'title', 'base', 'link', 'meta', 'style', 'script', 'noscript',
  'body', 'section', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'footer', 'address', 'main', 'p', 'hr', 'pre', 'blockquote', 'ol', 'ul',
  'menu', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'div', 'a', 'em', 'strong',
  'small', 's', 'cite', 'q', 'dfn', 'abbr', 'ruby', 'rt', 'rp', 'data', 'time',
  'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'bdi', 'bdo',
  'span', 'br', 'wbr', 'ins', 'del', 'picture', 'source', 'img', 'iframe', 'embed',
  'object', 'video', 'audio', 'track', 'map', 'area', 'table', 'caption', 'colgroup',
  'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'form', 'label', 'input',
  'button', 'select', 'datalist', 'optgroup', 'option', 'textarea', 'output',
  'progress', 'meter', 'fieldset', 'legend', 'details', 'summary', 'dialog', 'svg'
]);

// Εκπαιδευτικός Έλεγχος & Βοηθός Σφαλμάτων για Μαθητές
function validateHtmlCode(fromFileCheck = false) {
  const statusEl = document.getElementById('validation-status');
  const tipEl = document.getElementById('validation-tip');
  if (!statusEl || !tipEl || !htmlDoc) return;

  try {
    const code = htmlDoc.getValue() || '';
    const warnings = [];

    // 1. Έλεγχος DOCTYPE
    if (!code.toLowerCase().includes('<!doctype html>')) {
      warnings.push('Λείπει η δήλωση <!DOCTYPE html> στην αρχή του εγγράφου.');
    }

    // 2. Έλεγχος βασικών ετικετών <html>
    if (!code.includes('<html') || !code.includes('</html>')) {
      warnings.push('Βεβαιωθείτε ότι υπάρχει το ζεύγος ετικετών <html> και </html>.');
    }

    // 3. Έλεγχος για άγνωστες / ανορθόγραφες ετικέτες ή ετικέτες με ελληνικούς χαρακτήρες
    const cleanedCode = code.replace(/<!--[\s\S]*?-->/g, ''); // Αγνοούμε σχόλια HTML
    const allTagMatches = cleanedCode.matchAll(/<\/?([^\s>\/!][^\s>\/]*)/gu);
    const unknownTagsFound = new Set();
    const greekTagsFound = new Set();

    for (const m of allTagMatches) {
      const rawTag = m[1];
      const tagName = rawTag.toLowerCase();

      // Έλεγχος αν η ετικέτα περιέχει ελληνικούς χαρακτήρες (συχνό λάθος μαθητών)
      if (/[\u0370-\u03ff\u1f00-\u1fff]/i.test(rawTag)) {
        greekTagsFound.add(rawTag);
      } else if (!VALID_HTML5_TAGS.has(tagName) && !tagName.startsWith('!') && !tagName.startsWith('?')) {
        unknownTagsFound.add(rawTag);
      }
    }

    if (greekTagsFound.size > 0) {
      const greekList = Array.from(greekTagsFound).map(t => `<${t}>`).join(', ');
      warnings.push(`Λάθος γλώσσα ετικέτας: Οι ετικέτες HTML γράφονται μόνο με λατινικούς χαρακτήρες (βρέθηκαν: ${greekList}).`);
    }

    if (unknownTagsFound.size > 0) {
      const list = Array.from(unknownTagsFound).map(t => `<${t}>`).join(', ');
      warnings.push(`Εντοπίστηκαν μη έγκυρες ή ανορθόγραφες ετικέτες: ${list}`);
    }

    // 4. Έλεγχος σωστής σειράς και ιεραρχίας βασικών τμημάτων (<head>, <body>, <html>)
    const lower = code.toLowerCase();
    const htmlOpen = lower.indexOf('<html');
    const htmlClose = lower.indexOf('</html>');
    const headOpen = lower.indexOf('<head');
    const headClose = lower.indexOf('</head>');
    const bodyOpen = lower.indexOf('<body');
    const bodyClose = lower.indexOf('</body>');

    if (htmlClose !== -1) {
      // Έλεγχος αν γράφτηκε κώδικας έξω ή μετά το </html>
      const afterHtml = code.slice(htmlClose + 7).trim();
      if (afterHtml.length > 0 && afterHtml.includes('<')) {
        warnings.push('Εντοπίστηκε κώδικας μετά το κλείσιμο </html>. Όλα τα στοιχεία πρέπει να βρίσκονται μέσα στο <html>...</html>.');
      }
    }

    if (headOpen !== -1 && bodyOpen !== -1 && headOpen > bodyOpen) {
      warnings.push('Λάθος ιεραρχία: Το τμήμα <head> πρέπει να προηγείται του τμήματος <body>.');
    }

    if (headOpen !== -1 && headClose !== -1 && headOpen > headClose) {
      warnings.push('Λάθος ιεραρχία: Η ετικέτα </head> προηγείται του ανοίγματος <head>.');
    }

    if (bodyOpen !== -1 && bodyClose !== -1 && bodyOpen > bodyClose) {
      warnings.push('Λάθος ιεραρχία: Η ετικέτα </body> προηγείται του ανοίγματος <body>.');
    }

    // 5. Έλεγχος μη κλεισμένων ετικετών για κοινές δομές
    const tagsToCheck = ['table', 'ul', 'ol', 'form', 'div', 'p', 'head', 'body', 'title', 'h1', 'h2', 'h3'];
    for (const tag of tagsToCheck) {
      const openCount = (code.match(new RegExp(`<${tag}(\\s|>|$)`, 'gi')) || []).length;
      const closeCount = (code.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
      if (openCount > closeCount) {
        warnings.push(`Προσοχή: Βρέθηκαν ${openCount} ανοιγμένες ετικέτες <${tag}> αλλά μόνο ${closeCount} ετικέτες κλεισίματος </${tag}>.`);
        break;
      } else if (closeCount > openCount) {
        warnings.push(`Προσοχή: Βρέθηκαν ${closeCount} ετικέτες κλεισίματος </${tag}> αλλά μόνο ${openCount} ανοίγματα <${tag}>.`);
        break;
      }
    }

    // 6. Έλεγχος εικόνων χωρίς alt
    const imgMatches = code.match(/<img[^>]*>/gi) || [];
    for (const img of imgMatches) {
      if (!img.toLowerCase().includes('alt=')) {
        warnings.push('Εντοπίστηκε εικόνα <img> χωρίς περιγραφή alt="" (σημαντικό για προσβασιμότητα).');
        break;
      }
    }

    // 7. Έλεγχος συνδέσμων χωρίς href
    const aMatches = code.match(/<a[^>]*>/gi) || [];
    for (const a of aMatches) {
      if (!a.toLowerCase().includes('href=')) {
        warnings.push('Εντοπίστηκε σύνδεσμος <a> χωρίς προορισμό href="...".');
        break;
      }
    }

    // 8. Προχωρημένος: σύνδεση με το CSS (εμφανίζεται πρώτο, είναι το πιο σημαντικό)
    let needsCssLink = false;
    const notes = []; // παρατηρήσεις που δεν είναι λάθη (εμφανίζονται με πορτοκαλί, όχι με κόκκινο)
    if (currentMode === 'advanced') {
      const links = stylesheetLinks(code);
      if (links.length === 0) {
        needsCssLink = true;
        notes.push('Η σελίδα δεν συνδέεται με αρχείο CSS: πρόσθεσε <link rel="stylesheet" href="style.css"> μέσα στο <head> (κουμπί «Σύνδεση με CSS»).');
      }
    }
    // Αρχεία που αναφέρει η σελίδα αλλά δεν υπάρχουν (ή CSS που δεν έχει αποθηκευτεί ακόμα)
    for (const href of unsavedLinkedCss) {
      notes.push(`Το «${href}» δεν έχει αποθηκευτεί ακόμα: αποθήκευσέ το (Ctrl+S στην καρτέλα CSS) στον φάκελο της σελίδας.`);
    }
    const MAX_LISTED = 6;
    for (const ref of missingFiles.slice(0, MAX_LISTED)) {
      notes.push(`Δεν βρέθηκε το αρχείο «${ref.href}» (${REF_LABELS[ref.tag] || 'αρχείο'}): έλεγξε το όνομα και τον φάκελο.`);
    }
    if (missingFiles.length > MAX_LISTED) {
      notes.push(`…και άλλα ${missingFiles.length - MAX_LISTED} αρχεία που δεν βρέθηκαν.`);
    }
    const fixBtn = document.getElementById('btn-fix-css-link');
    if (fixBtn) fixBtn.hidden = !needsCssLink;
    if (!fromFileCheck) checkReferencedFiles(code); // ασύγχρονα: ενημερώνει ξανά τη μπάρα αν βρει κάτι

    // Εμφάνιση αποτελέσματος
    if (warnings.length === 0 && notes.length > 0) {
      // Μόνο παρατηρήσεις (π.χ. η σελίδα δεν συνδέεται με CSS): σκούρο πορτοκαλί, ώστε να μη μοιάζουν με λάθος
      statusEl.innerHTML = `<span class="status-note">💡 ${notes.length} ${notes.length === 1 ? 'Παρατήρηση' : 'Παρατηρήσεις'}</span>`;
      const noteTooltip = notes.map((w, idx) => `${idx + 1}. ${w}`).join('\n');
      statusEl.title = noteTooltip;
      tipEl.textContent = notes.join('  •  ');
      tipEl.title = noteTooltip;
    } else if (warnings.length === 0) {
      statusEl.innerHTML = '<span class="status-ok">🟢 Όλα εντάξει!</span>';
      statusEl.title = 'Δεν εντοπίστηκαν συντακτικά σφάλματα στον κώδικα.';
      tipEl.textContent = 'Ο κώδικάς σας είναι καθαρός και έτοιμος.';
      tipEl.title = 'Ο κώδικάς σας είναι καθαρός και έτοιμος.';
    } else {
      warnings.push(...notes);
      statusEl.innerHTML = `<span class="status-warning" style="color: #ef4444; font-weight: 700;">⚠️ ${warnings.length} ${warnings.length === 1 ? 'Σφάλμα / Παρατήρηση' : 'Σφάλματα / Παρατηρήσεις'}</span>`;
      const fullTooltip = warnings.map((w, idx) => `${idx + 1}. ${w}`).join('\n');
      statusEl.title = fullTooltip;
      tipEl.textContent = warnings.join('  •  ');
      tipEl.title = fullTooltip;
    }
  } catch (err) {
    console.warn('Validate HTML error:', err);
  }
}

// Εκπαιδευτικά Πρότυπα (Templates Modal)
function initTemplatesModal() {
  const grid = document.getElementById('templates-grid');
  grid.innerHTML = '';

  const visibleTemplates = STARTER_TEMPLATES.filter(tpl => {
    if (tpl.requiresMode === 'advanced' && currentMode === 'beginner') {
      return false;
    }
    return true;
  });

  visibleTemplates.forEach(tpl => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <span class="template-card-badge">${tpl.level}</span>
      <div class="template-card-title">${tpl.title}</div>
      <div class="template-card-desc">${tpl.description}</div>
    `;

    card.onclick = () => {
      loadTemplate(tpl);
      closeModal('templates-modal');
    };

    grid.appendChild(card);
  });
}

function loadTemplate(tpl) {
  if (confirm(`Θέλετε να φορτώσετε το πρότυπο «${tpl.title}»;\nΤυχόν μη αποθηκευμένες αλλαγές θα αντικατασταθούν.`)) {
    // Το πρότυπο είναι νέο έγγραφο: η επόμενη αποθήκευση πρέπει να ζητήσει όνομα και όχι να γράψει πάνω στο αρχείο που ήταν ανοιχτό
    setCurrentFile('html', null);
    setCurrentFile('css', null);
    if (currentMode === 'beginner') {
      htmlDoc.setValue(tpl.singleFile);
    } else {
      htmlDoc.setValue(tpl.multiFile.html);
      cssDoc.setValue(tpl.multiFile.css);
    }
    updateLivePreview();
    validateHtmlCode();
    showToast(`Φορτώθηκε το πρότυπο: ${tpl.title}`);
  }
}

// Εξαγωγή σε ZIP για παράδοση εργασίας στον καθηγητή
// --- ΕΞΑΓΩΓΗ ΣΕ ZIP ---
// Τρεις επιλογές: το τρέχον αρχείο, όλα τα ανοιχτά αρχεία ή ολόκληρος ο φάκελος της εργασίας (δες zipExport.js).
// Τα αρχεία που δεν έχουν αποθηκευτεί δεν μπαίνουν· όσα έχουν μη αποθηκευμένες αλλαγές μπορούν να αποθηκευτούν πρώτα.
let zipChoice = null;

function isSavedPath(p) {
  return !!p && /[\\/]/.test(p);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace('.', ',') + ' KB';
  return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}

async function exportZip() {
  if (!window.electronAPI || !window.electronAPI.createZip) {
    exportZipInBrowser();
    return;
  }
  const active = getActiveTab();
  const tabs = visibleTabs();
  const saved = tabs.filter((t) => isSavedPath(t.path));
  const unsaved = tabs.filter((t) => !isSavedPath(t.path));
  // όταν το focus είναι σε CSS ή σε ανώνυμη καρτέλα, «τρέχον» είναι το αρχείο της καρτέλας αν έχει αποθηκευτεί
  const current = active && isSavedPath(active.path) ? active : null;
  const folderTab = current || saved.find((t) => t.kind === 'html') || saved[0] || null;
  const folder = folderTab ? getDirectoryFromPath(folderTab.path) : '';
  zipChoice = { current, saved, folder };

  const setOption = (mode, enabled, desc) => {
    const option = document.getElementById('zip-option-' + mode);
    const radio = option.querySelector('input');
    radio.disabled = !enabled;
    option.classList.toggle('is-disabled', !enabled);
    document.getElementById('zip-desc-' + mode).textContent = desc;
  };
  const unsavedNote = unsaved.length
    ? ` · δεν μπαίνουν (δεν έχουν αποθηκευτεί): ${unsaved.map(tabDisplayName).join(', ')}`
    : '';

  setOption('current', !!current, current
    ? fileNameOf(current.path)
    : `Το «${active ? tabDisplayName(active) : ''}» δεν έχει αποθηκευτεί ακόμα: αποθήκευσέ το πρώτα.`);
  setOption('tabs', saved.length > 0, saved.length
    ? `${saved.length} ${saved.length === 1 ? 'αρχείο' : 'αρχεία'}: ${saved.map((t) => fileNameOf(t.path)).join(', ')}${unsavedNote}`
    : 'Κανένα ανοιχτό αρχείο δεν έχει αποθηκευτεί ακόμα.' + unsavedNote);
  setOption('folder', !!folder, folder ? `«${fileNameOf(folder)}»: μέτρηση αρχείων…` : 'Αποθήκευσε πρώτα ένα αρχείο για να υπάρχει φάκελος εργασίας.');

  // προεπιλογή: όλα τα ανοιχτά αρχεία αν είναι περισσότερα από ένα, αλλιώς το τρέχον
  const preferred = saved.length > 1 ? 'tabs' : (current ? 'current' : (saved.length ? 'tabs' : 'folder'));
  for (const radio of document.querySelectorAll('input[name="zip-mode"]')) {
    radio.checked = radio.value === preferred && !radio.disabled;
    radio.onchange = updateZipSaveFirst;
  }
  updateZipSaveFirst();
  document.getElementById('btn-zip-create').disabled = !current && !saved.length && !folder;
  openModal('zip-modal');

  if (folder) {
    const info = await window.electronAPI.scanFolderForZip(folder);
    if (zipChoice && zipChoice.folder === folder) {
      document.getElementById('zip-desc-folder').textContent = info.ok
        ? `«${fileNameOf(folder)}»: ${info.count} ${info.count === 1 ? 'αρχείο' : 'αρχεία'}, ${formatBytes(info.bytes)} (μαζί με τους υποφακέλους) — ${folder}`
        : `«${fileNameOf(folder)}»: ${info.error}`;
      if (!info.ok) setOption('folder', false, `«${fileNameOf(folder)}»: ${info.error}`);
    }
  }
}

// Οι καρτέλες που θα μπουν στο ZIP με την επιλογή που είναι τσεκαρισμένη
function zipTabsForMode(mode) {
  if (!zipChoice) return [];
  if (mode === 'current') return zipChoice.current ? [zipChoice.current] : [];
  if (mode === 'tabs') return zipChoice.saved;
  const dir = normPath(zipChoice.folder) + '/';
  return zipChoice.saved.filter((t) => normPath(t.path).startsWith(dir));
}

// «Αποθήκευση των αλλαγών πριν…»: φαίνεται μόνο όταν κάποιο από τα αρχεία του ZIP έχει μη αποθηκευμένες αλλαγές
function updateZipSaveFirst() {
  const checked = document.querySelector('input[name="zip-mode"]:checked');
  const dirty = checked ? zipTabsForMode(checked.value).filter((t) => !t.saved) : [];
  document.getElementById('zip-save-first-row').hidden = dirty.length === 0;
  document.getElementById('zip-save-first-text').textContent =
    `Αποθήκευση των αλλαγών πριν τη δημιουργία του ZIP (${dirty.map((t) => fileNameOf(t.path)).join(', ')})· αλλιώς μπαίνουν όπως είναι αποθηκευμένα.`;
}

async function createZipFromDialog() {
  const checked = document.querySelector('input[name="zip-mode"]:checked');
  if (!checked || !zipChoice) return;
  const mode = checked.value;

  if (document.getElementById('zip-save-first').checked) {
    for (const tab of zipTabsForMode(mode).filter((t) => !t.saved)) {
      const res = await window.electronAPI.saveFileDirect({ filePath: tab.path, content: tab.doc.getValue() });
      if (res && res.success) markTabSaved(tab, true);
    }
  }

  let request;
  if (mode === 'folder') {
    request = { mode: 'folder', folder: zipChoice.folder, suggestedName: fileNameOf(zipChoice.folder) };
  } else {
    const tabs = zipTabsForMode(mode);
    const name = mode === 'current'
      ? fileNameOf(tabs[0].path).replace(/\.[^.]+$/, '')
      : (fileNameOf(getDirectoryFromPath(tabs[0].path)) || 'ergasia');
    request = { mode: 'files', files: tabs.map((t) => t.path), suggestedName: name };
  }

  const res = await window.electronAPI.createZip(request);
  if (res && res.ok) {
    closeModal('zip-modal');
    showToast(`Δημιουργήθηκε το «${fileNameOf(res.filePath)}» (${res.count} ${res.count === 1 ? 'αρχείο' : 'αρχεία'}, ${formatBytes(res.bytes)}).`, 4500);
  } else if (res && !res.canceled) {
    showToast('Δεν δημιουργήθηκε το ZIP: ' + res.error, 5000);
  }
}

// Εκτός Electron (browser): το ZIP φτιάχνεται από τα περιεχόμενα του editor
async function exportZipInBrowser() {
  if (typeof JSZip === 'undefined') {
    showToast('Η βιβλιοθήκη JSZip δεν είναι διαθέσιμη.');
    return;
  }
  const zip = new JSZip();
  for (const tab of visibleTabs()) zip.file(fileNameOf(tab.path) || (tabDisplayName(tab) + (tab.kind === 'css' ? '.css' : '.html')), tab.doc.getValue());
  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = 'Mathitiki-Ergasia.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Το αρχείο ZIP δημιουργήθηκε και ξεκίνησε η λήψη!');
}

// Αποθήκευση του εγγράφου που φαίνεται στον editor (Ctrl+S, κουμπί «Αποθήκευση»· isSaveAs: «Αποθήκευση ως»)
async function saveCurrentFile(isSaveAs = false) {
  return saveDoc(activeTab === 'css' ? 'css' : 'html', { saveAs: isSaveAs });
}

/**
 * Αποθηκεύει το HTML ή το CSS στο αρχείο του. Αν δεν έχει αρχείο ή ζητήθηκε «Αποθήκευση ως», ανοίγει διάλογο· μετά το
 * έγγραφο δουλεύει πάνω στο νέο αρχείο (όνομα στην καρτέλα, προεπισκόπηση). quiet: χωρίς μήνυμα. Επιστρέφει true αν αποθηκεύτηκε.
 */
async function saveDoc(kind, { saveAs = false, quiet = false } = {}) {
  const isHtml = kind !== 'css';
  const content = isHtml ? htmlDoc.getValue() : cssDoc.getValue();
  const ext = isHtml ? 'html' : 'css';
  const currentPath = isHtml ? currentHtmlFilePath : currentCssFilePath;

  if (!window.electronAPI) {
    // Εκτός Electron: λήψη του αρχείου από τον browser
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileNameOf(currentPath) || (isHtml ? 'index.html' : 'style.css');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSavedState(true);
    if (!quiet) showToast('Το αρχείο λήφθηκε επιτυχώς!');
    return true;
  }

  // Αρχείο που υπάρχει ήδη: απευθείας αποθήκευση, χωρίς διάλογο
  if (!saveAs && currentPath && window.electronAPI.saveFileDirect) {
    const res = await window.electronAPI.saveFileDirect({ filePath: currentPath, content });
    if (res.success) {
      markTabSaved(tabOfDoc(isHtml ? htmlDoc : cssDoc), true);
      if (!quiet) showToast(`Αποθηκεύτηκε: ${fileNameOf(currentPath)}`);
      updateLivePreview();
      return true;
    }
  }

  // Νέο αρχείο ή «Αποθήκευση ως»: διάλογος. Ένα νέο CSS προτείνεται δίπλα στη σελίδα ως style.css (όπως το συνδέει το HTML)
  let defaultPath = currentPath || (isHtml ? 'index.html' : 'style.css');
  if (!isHtml && !currentPath && currentHtmlFilePath) {
    const dir = getDirectoryFromPath(currentHtmlFilePath);
    if (dir) defaultPath = dir + (currentHtmlFilePath.includes('\\') ? '\\' : '/') + 'style.css';
  }
  if (!window.electronAPI.saveFile) return false;
  const res = await window.electronAPI.saveFile({
    defaultPath,
    content,
    filters: [{ name: `${ext.toUpperCase()} File`, extensions: [ext] }]
  });
  if (!res || !res.success || !res.filePath) return false;

  // ένα άλλο ανοιχτό αντίγραφο του ίδιου αρχείου κλείνει (η καρτέλα αυτή είναι πλέον το αρχείο)
  const duplicate = tabOfPath(res.filePath);
  const thisTab = tabOfDoc(isHtml ? htmlDoc : cssDoc);
  if (duplicate && duplicate !== thisTab) {
    fileTabs.splice(fileTabs.indexOf(duplicate), 1);
  }
  setCurrentFile(isHtml ? 'html' : 'css', res.filePath);
  markTabSaved(thisTab, true);
  if (!quiet) showToast(`Αποθηκεύτηκε: ${fileNameOf(res.filePath)}`);
  updateLivePreview();
  return true;
}

// Άνοιγμα αρχείου
async function openFile() {
  if (window.electronAPI && window.electronAPI.openFile) {
    const res = await window.electronAPI.openFile();
    if (res) {
      const kind = /\.css$/i.test(res.filePath) ? 'css' : 'html';
      if (kind === 'css' && currentMode === 'beginner') setMode('advanced');
      openInTab(kind, res.content, res.filePath);
      showToast(`Ανοίχθηκε το αρχείο: ${res.filePath}`);
    }
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,.css,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const kind = /\.css$/i.test(file.name) ? 'css' : 'html';
          if (kind === 'css' && currentMode === 'beginner') setMode('advanced');
          openInTab(kind, evt.target.result, file.name);
          showToast(`Ανοίχθηκε: ${file.name}`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Δημιουργία Νέου Αρχείου (Μόνο οι βασικές εντολές <!DOCTYPE html>, <html>, <head>, <title>, <body>)
function createNewFile() {
  const tab = addFileTab('html', cleanNewSkeleton, null);
  activateTab(tab.id);
  showToast('Νέο αρχείο σε νέα καρτέλα.');
}

// Μορφοποίηση κώδικα (Simple Beautifier)
function formatCode() {
  const currentDoc = (activeTab === 'html') ? htmlDoc : cssDoc;
  const content = currentDoc.getValue();
  
  // Απλός εκπαιδευτικός μορφοποιητής HTML/CSS με 2 κενά εσοχής
  let formatted = '';
  let pad = 0;
  const lines = content.split('\n');

  lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) {
      formatted += '\n';
      return;
    }

    if (trimmed.startsWith('</') || trimmed.startsWith('}') || trimmed === '</html>' || trimmed === '</body>') {
      pad = Math.max(0, pad - 1);
    }

    formatted += '  '.repeat(pad) + trimmed + '\n';

    if ((trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.startsWith('<!') && !trimmed.startsWith('<meta') && !trimmed.startsWith('<link') && !trimmed.startsWith('<img') && !trimmed.startsWith('<br') && !trimmed.startsWith('<hr') && !trimmed.includes('</')) || trimmed.endsWith('{')) {
      pad++;
    }
  });

  currentDoc.setValue(formatted.trim() + '\n');
  showToast('Ο κώδικας μορφοποιήθηκε!');
}

// Ρυθμίσεις Μεγέθους Γραμματοσειράς & Θέματος
function adjustFontSize(delta) {
  currentFontSize = Math.min(26, Math.max(11, currentFontSize + delta));
  const cmEl = document.querySelector('.CodeMirror');
  if (cmEl) {
    cmEl.style.fontSize = `${currentFontSize}px`;
    editor.refresh();
  }
  showToast(`Μέγεθος γραμματοσειράς: ${currentFontSize}px`);
}

// --- ΕΜΦΑΝΙΣΗ: ΘΕΜΑ ΚΑΙ ΧΡΩΜΑ ΚΕΦΑΛΙΔΑΣ (όπως στο myGlossa) ---

// Εφαρμόζει ένα θέμα: κλάσεις στο <body> (τα χρώματα είναι μεταβλητές CSS), παράθυρο των Windows και κεφαλίδα
function applyTheme(themeId) {
  const theme = Themes.get(themeId);
  appSettings.theme = theme.id;
  Themes.applyToBody(document.body, theme.id);
  if (editor) editor.refresh();
  if (window.electronAPI && window.electronAPI.setTheme) {
    window.electronAPI.setTheme(theme.id);
  }
  syncAppearanceControls();
  applyHeader();
}

// Αλλαγή θέματος ή χρώματος κεφαλίδας: εφαρμόζεται και αποθηκεύεται αμέσως
function updateAppearance(patch) {
  Object.assign(appSettings, patch);
  if ('theme' in patch) {
    applyTheme(appSettings.theme); // εφαρμόζει και την κεφαλίδα
  } else {
    applyHeader();
  }
  if (window.electronAPI && window.electronAPI.saveSettings) {
    window.electronAPI.saveSettings(patch);
  }
}

// Εναλλαγή φωτεινό ↔ σκοτεινό: κάθε θέμα έχει το ζεύγος του (π.χ. Darcula ↔ IntelliJ Light)
function toggleTheme() {
  const next = Themes.get(Themes.get(appSettings.theme).pair);
  updateAppearance({ theme: next.id });
  showToast(`Θέμα εμφάνισης: ${next.label}`);
}

/**
 * Χρώμα της κεφαλίδας (γραμμή τίτλου + καρτέλες + ribbon) από τις Ρυθμίσεις: ένα χρώμα ή διαβάθμιση από το πρώτο
 * στο δεύτερο. Χωρίς επιλογή ισχύει το χρώμα του θέματος. Ορίζει τις μεταβλητές --hdr-* και στέλνει στην κύρια
 * διεργασία τα χρώματα των κουμπιών του παραθύρου (ελαχιστοποίηση, κλείσιμο) πάνω στη γραμμή τίτλου.
 */
function applyHeader() {
  const top = document.querySelector('.app-top');
  if (!top) return;
  const style = document.body.style;
  const names = ['--hdr-bg', '--hdr-fg', '--hdr-muted', '--hdr-hover', '--hdr-active', '--hdr-sep', '--hdr-menu',
    '--hdr-image', '--hdr-accent', '--hdr-on-accent'];
  for (const n of names) style.removeProperty(n);

  const toHex = (css) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css);
    return m ? '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('') : null;
  };
  const themeColor = toHex(getComputedStyle(top).backgroundColor) || '#2b2d30'; // το χρώμα του θέματος
  const c1 = Themes.headerColorOf(appSettings.headerColor);
  const c2 = Themes.headerColorOf(appSettings.headerColor2);
  const dir = appSettings.headerDir;

  let edge = themeColor;
  if (c1 || c2) {
    const s = Themes.headerStyle(c1 || themeColor, c2 || null);
    const vars = {
      '--hdr-bg': s.bg, '--hdr-menu': s.menu, '--hdr-fg': s.fg, '--hdr-muted': s.muted, '--hdr-hover': s.hover,
      '--hdr-active': s.active, '--hdr-sep': s.sep, '--hdr-accent': s.fg, '--hdr-on-accent': s.onAccent
    };
    if (c2) vars['--hdr-image'] = Themes.headerImage(s.bg, s.bg2, dir); // s.bg2 = c2, μαλακωμένο αν δεν διαβάζονταν τα γράμματα
    for (const [k, v] of Object.entries(vars)) style.setProperty(k, v);
    edge = c2 ? Themes.headerEdgeColor(s.bg, s.bg2, dir) : s.bg;
  }

  // Τα κουμπιά του παραθύρου πάνω στη γραμμή τίτλου παίρνουν το χρώμα της άκρης της κεφαλίδας
  if (document.documentElement.classList.contains('custom-header') && window.electronAPI && window.electronAPI.setTitlebarOverlay) {
    const fg = toHex(getComputedStyle(top).color);
    if (edge && fg) window.electronAPI.setTitlebarOverlay(edge, fg);
  }
}

// Γεμίζει τους επιλογείς θέματος (ribbon και Ρυθμίσεις) και χρώματος κεφαλίδας (Ρυθμίσεις)
function initAppearanceControls() {
  for (const id of ['ribbon-theme-select', 'setting-theme-select']) {
    const sel = document.getElementById(id);
    if (!sel) continue;
    for (const g of Object.keys(Themes.GROUPS)) {
      const og = document.createElement('optgroup');
      og.label = Themes.GROUPS[g];
      for (const t of Themes.LIST.filter((x) => x.group === g)) og.appendChild(new Option(t.label, t.id));
      sel.appendChild(og);
    }
  }

  const sel1 = document.getElementById('setting-header-select');
  const color1 = document.getElementById('setting-header-color');
  const sel2 = document.getElementById('setting-header2-select');
  const color2 = document.getElementById('setting-header2-color');
  const dirSel = document.getElementById('setting-header-dir');
  const dirRow = document.getElementById('setting-header-dir-row');
  if (!sel1 || !sel2) return;

  for (const c of Themes.HEADER_COLORS) sel1.appendChild(new Option(c.label, c.id));
  sel2.appendChild(new Option('Κανένα (ένα χρώμα)', 'none'));
  for (const c of Themes.HEADER_COLORS) if (c.id !== 'theme') sel2.appendChild(new Option(c.label, c.id));
  for (const d of Themes.HEADER_DIRECTIONS) dirSel.appendChild(new Option(d.label, d.id));

  sel1.addEventListener('change', () => { color1.hidden = sel1.value !== 'custom'; });
  sel2.addEventListener('change', () => {
    color2.hidden = sel2.value !== 'custom';
    dirRow.hidden = sel2.value === 'none';
  });
}

// Δείχνει στους επιλογείς το τρέχον θέμα
function syncAppearanceControls() {
  for (const id of ['ribbon-theme-select', 'setting-theme-select']) {
    const sel = document.getElementById(id);
    if (sel) sel.value = Themes.get(appSettings.theme).id;
  }
}

// --- ΔΙΑΧΕΙΡΙΣΗ ΡΥΘΜΙΣΕΩΝ (SETTINGS) ---
async function initSettings() {
  // Windows και Linux: η κεφαλίδα της εφαρμογής παίρνει τη θέση της γραμμής τίτλου του συστήματος
  const platform = window.electronAPI && window.electronAPI.platform;
  document.documentElement.classList.toggle('custom-header', platform === 'win32' || platform === 'linux');

  initAppearanceControls();
  if (window.electronAPI && window.electronAPI.getSettings) {
    try {
      const fetched = await window.electronAPI.getSettings();
      if (fetched) appSettings = { ...appSettings, ...fetched };
    } catch (err) {
      console.error('Σφάλμα φόρτωσης ρυθμίσεων:', err);
    }
  }
  applyTheme(appSettings.theme);
  updateBrowserButton();
  applyModeVisibility();
  populateSettingsUI();
}

function updateBrowserButton() {
  const textEl = document.getElementById('open-browser-text');
  if (textEl) {
    textEl.textContent = `Προβολή στον ${getBrowserName(appSettings.browser)}`;
  }
}

// «Απόκρυψη των κουμπιών Αρχάριος/Προχωρημένος και Πρότυπα»: εφαρμόζεται αμέσως με το κλικ και αποθηκεύεται.
// Η επιλογή κρατά τους μαθητές στον «Αρχάριο», οπότε αν η εφαρμογή είναι σε «Προχωρημένο» γυρίζει πρώτα σε «Αρχάριο».
function setHideModeControls(hide) {
  appSettings.hideBeginnerControls = !!hide;
  if (hide && currentMode !== 'beginner') setMode('beginner');
  applyModeVisibility();
  if (window.electronAPI && window.electronAPI.saveSettings) {
    window.electronAPI.saveSettings({ hideBeginnerControls: !!hide });
  }
}

function applyModeVisibility() {
  const modeSelector = document.querySelector('.mode-selector');
  const templatesGroup = document.getElementById('ribbon-group-templates');
  if (currentMode === 'beginner' && appSettings.hideBeginnerControls) {
    if (modeSelector) modeSelector.style.display = 'none';
    if (templatesGroup) templatesGroup.style.display = 'none';
  } else {
    if (modeSelector) modeSelector.style.display = 'flex';
    if (templatesGroup) templatesGroup.style.display = 'flex';
  }
}

function populateSettingsUI() {
  const browserSelect = document.getElementById('setting-browser-select');
  const folderInput = document.getElementById('setting-folder-input');
  const hideCheckbox = document.getElementById('setting-hide-beginner-controls');

  syncAppearanceControls();
  if (browserSelect) browserSelect.value = appSettings.browser || 'msedge';
  if (folderInput) folderInput.value = appSettings.saveDirectory || '';
  if (hideCheckbox) {
    hideCheckbox.checked = !!appSettings.hideBeginnerControls;
    hideCheckbox.onchange = () => setHideModeControls(hideCheckbox.checked);
  }
  const autoUpdateCheckbox = document.getElementById('setting-auto-update-check');
  if (autoUpdateCheckbox) autoUpdateCheckbox.checked = appSettings.autoUpdateCheck !== false;

  // Χρώμα κεφαλίδας: έτοιμο χρώμα, «ίδιο με το θέμα» ή ελεύθερο χρώμα (#rrggbb)
  const sel1 = document.getElementById('setting-header-select');
  const color1 = document.getElementById('setting-header-color');
  const sel2 = document.getElementById('setting-header2-select');
  const color2 = document.getElementById('setting-header2-color');
  const dirSel = document.getElementById('setting-header-dir');
  const dirRow = document.getElementById('setting-header-dir-row');
  if (!sel1 || !sel2) return;

  const fill = (sel, colorInput, value, none) => {
    const hex = Themes.headerColorOf(value);
    const preset = Themes.HEADER_COLORS.find((c) => c.id === value);
    const isCustom = !!hex && !preset;
    sel.value = isCustom ? 'custom' : (preset && preset.id !== 'custom' ? preset.id : none);
    if (hex) colorInput.value = hex;
    colorInput.hidden = sel.value !== 'custom';
  };
  fill(sel1, color1, appSettings.headerColor, 'theme');
  fill(sel2, color2, appSettings.headerColor2, 'none');
  dirSel.value = Themes.HEADER_DIRECTIONS.some((d) => d.id === appSettings.headerDir) ? appSettings.headerDir : 'right';
  dirRow.hidden = sel2.value === 'none';
}

async function browseFolder() {
  if (window.electronAPI && window.electronAPI.selectFolder) {
    const selected = await window.electronAPI.selectFolder(appSettings.saveDirectory);
    if (selected) {
      document.getElementById('setting-folder-input').value = selected;
    }
  }
}

async function saveCurrentSettings() {
  const theme = document.getElementById('setting-theme-select').value;
  const browser = document.getElementById('setting-browser-select').value;
  const folder = document.getElementById('setting-folder-input').value;
  const hideControls = document.getElementById('setting-hide-beginner-controls').checked;

  const sel1 = document.getElementById('setting-header-select');
  const sel2 = document.getElementById('setting-header2-select');
  const headerColor = sel1.value === 'custom' ? document.getElementById('setting-header-color').value : sel1.value;
  const headerColor2 = sel2.value === 'none' ? ''
    : (sel2.value === 'custom' ? document.getElementById('setting-header2-color').value : sel2.value);

  appSettings.theme = theme;
  appSettings.browser = browser;
  appSettings.saveDirectory = folder;
  appSettings.hideBeginnerControls = hideControls;
  const autoUpdateCheckbox = document.getElementById('setting-auto-update-check');
  if (autoUpdateCheckbox) appSettings.autoUpdateCheck = autoUpdateCheckbox.checked;
  appSettings.headerColor = headerColor;
  appSettings.headerColor2 = headerColor2;
  appSettings.headerDir = document.getElementById('setting-header-dir').value;

  applyTheme(theme); // εφαρμόζει και το χρώμα της κεφαλίδας

  if (window.electronAPI && window.electronAPI.saveSettings) {
    await window.electronAPI.saveSettings(appSettings);
  }

  updateBrowserButton();
  setHideModeControls(hideControls);
  closeModal('settings-modal');
  showToast('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
}

// --- ΕΝΗΜΕΡΩΣΗ ΜΕΣΑ ΑΠΟ ΤΗΝ ΕΦΑΡΜΟΓΗ (δες updater.js) ---
// Η κύρια διεργασία στέλνει καταστάσεις: available → downloading → ready (ή error). Το τι γίνεται κάθε φορά εξαρτάται
// από το πώς εγκαταστάθηκε η εφαρμογή: Setup (αυτόματη εγκατάσταση), φορητή (λήψη και εκκίνηση της νέας), MSI (σελίδα λήψης).
let updateState = { state: 'idle' };

function initUpdater() {
  const api = window.electronAPI && window.electronAPI.update;
  if (!api) return;
  api.onState((s) => onUpdateState(s));
  // Αν η κατάσταση άλλαξε πριν φορτώσει η σελίδα (π.χ. ανανέωση παραθύρου)
  api.state().then((s) => { if (s && s.state && s.state !== 'idle') onUpdateState(s); }).catch(() => {});
}

function onUpdateState(s) {
  updateState = s;
  // «Δεν υπάρχει νέα έκδοση» και σφάλμα ελέγχου εμφανίζονται μόνο όταν ο χρήστης ζήτησε τον έλεγχο (checkAppUpdates)
  if (s.state === 'none' || s.state === 'idle' || (s.state === 'error' && s.phase === 'check')) return;
  renderUpdateBadge(s);
  renderUpdateModal(s);
}

// Η διακριτική ειδοποίηση στη γραμμή κατάστασης
function renderUpdateBadge(s) {
  const badge = document.getElementById('status-update-badge');
  if (!badge) return;
  badge.style.display = 'inline-flex';
  if (s.state === 'downloading') {
    badge.textContent = `⬇ Λήψη v${s.version}… ${s.percent || 0}%`;
  } else if (s.state === 'ready') {
    badge.textContent = s.kind === 'portable' ? `✅ Η v${s.version} κατέβηκε — κλικ για εκκίνηση` : `✅ Η v${s.version} είναι έτοιμη — κλικ για εγκατάσταση`;
  } else if (s.state === 'error') {
    badge.textContent = '⚠️ Η ενημέρωση δεν ολοκληρώθηκε';
  } else {
    badge.textContent = `✨ Νέα έκδοση v${s.version}!`;
  }
}

// Το παράθυρο ενημέρωσης: εκδόσεις, σημειώσεις, κατάσταση λήψης και το κουμπί της ενέργειας
function renderUpdateModal(s) {
  const $ = (id) => document.getElementById(id);
  const version = s.version || (updateState && updateState.version) || '';
  if ($('update-current-version')) $('update-current-version').textContent = `v${s.current}`;
  if ($('update-latest-version')) $('update-latest-version').textContent = version ? `v${version}` : '';
  const notes = $('update-release-notes');
  if (notes && s.notes !== undefined) {
    notes.textContent = s.notes || 'Δεν υπάρχουν διαθέσιμες σημειώσεις έκδοσης στο αποθετήριο GitHub.';
  }

  const kind = s.kind;
  const statusBox = $('update-status-box');
  const status = $('update-status');
  const progress = $('update-progress');
  const bar = $('update-progress-bar');
  const action = $('btn-download-update');
  const later = $('btn-update-later');
  const hint = $('update-hint');
  status.className = 'update-status';
  statusBox.hidden = true;
  progress.hidden = true;
  action.disabled = false;
  later.textContent = 'Αργότερα';

  const setAction = (icon, label) => {
    $('update-action-icon').textContent = icon;
    $('update-action-label').textContent = label;
  };

  if (s.state === 'available') {
    if (kind === 'setup') {
      setAction('⬇️', 'Ενημέρωση τώρα');
      hint.textContent = 'Η νέα έκδοση κατεβαίνει, εγκαθίσταται αυτόματα και η εφαρμογή ξεκινά ξανά.';
    } else if (kind === 'portable') {
      setAction('⬇️', 'Λήψη της νέας έκδοσης');
      hint.textContent = 'Η φορητή έκδοση δεν εγκαθίσταται: η νέα έκδοση (.exe) κατεβαίνει στον φάκελο της τρέχουσας και ξεκινά από εκεί. Το παλιό αρχείο μένει και μπορείτε να το διαγράψετε.';
    } else if (kind === 'msi') {
      setAction('🌐', 'Σελίδα λήψης (GitHub)');
      hint.textContent = 'Αυτή η εγκατάσταση (MSI για όλους τους χρήστες του υπολογιστή) χρειάζεται δικαιώματα διαχειριστή. Ο διαχειριστής του εργαστηρίου εγκαθιστά το νέο αρχείο .msi από τη σελίδα λήψης.';
    } else {
      setAction('🌐', 'Σελίδα λήψης (GitHub)');
      hint.textContent = 'Σε αυτή τη λειτουργία δεν γίνεται αυτόματη ενημέρωση· ανοίγει η σελίδα λήψης.';
    }
  } else if (s.state === 'downloading') {
    statusBox.hidden = false;
    progress.hidden = false;
    status.textContent = `⬇ Λήψη της έκδοσης v${version}… ${s.percent || 0}%`;
    bar.style.width = `${s.percent || 0}%`;
    action.disabled = true;
    setAction('⏳', 'Γίνεται λήψη…');
    later.textContent = 'Κλείσιμο';
    hint.textContent = 'Μπορείτε να κλείσετε αυτό το παράθυρο· η λήψη συνεχίζεται και η πρόοδος φαίνεται στη γραμμή κατάστασης.';
  } else if (s.state === 'ready') {
    statusBox.hidden = false;
    status.className = 'update-status is-ready';
    if (kind === 'portable') {
      status.textContent = `✅ Η έκδοση v${version} κατέβηκε${s.file ? ' (' + s.file + ')' : ''}.`;
      setAction('▶️', 'Εκκίνηση της νέας έκδοσης');
      hint.textContent = 'Η εφαρμογή θα κλείσει και θα ξεκινήσει η νέα έκδοση.';
    } else {
      status.textContent = `✅ Η έκδοση v${version} κατέβηκε και είναι έτοιμη για εγκατάσταση.`;
      setAction('🔄', 'Επανεκκίνηση & εγκατάσταση');
      hint.textContent = 'Η εφαρμογή θα κλείσει, θα εγκατασταθεί η ενημέρωση και θα ξεκινήσει ξανά. Αποθηκεύστε πρώτα την εργασία σας.';
    }
  } else if (s.state === 'error') {
    statusBox.hidden = false;
    status.className = 'update-status is-error';
    status.textContent = `⚠️ Η ενημέρωση δεν ολοκληρώθηκε (${s.error || 'άγνωστο σφάλμα'}).`;
    setAction('🌐', 'Σελίδα λήψης (GitHub)');
    hint.textContent = 'Μπορείτε να κατεβάσετε και να εγκαταστήσετε τη νέα έκδοση χειροκίνητα από τη σελίδα λήψης.';
  }
}

// Μη αποθηκευμένες αλλαγές στον editor (η γραμμή κατάστασης δείχνει «● Μη αποθηκευμένο»)
function hasUnsavedChanges() {
  return fileTabs.some((t) => !t.saved);
}

// Το κουμπί ενέργειας του παραθύρου ενημέρωσης, ανάλογα με την κατάσταση
async function runUpdateAction() {
  const api = window.electronAPI && window.electronAPI.update;
  if (!api) return;
  const s = updateState;
  if (s.state === 'available') {
    await api.download(); // Setup/φορητή: ξεκινά η λήψη· MSI/ανάπτυξη: ανοίγει η σελίδα λήψης
  } else if (s.state === 'ready') {
    if (hasUnsavedChanges() && !confirm('Υπάρχουν μη αποθηκευμένες αλλαγές στον editor.\nΗ εφαρμογή θα κλείσει για να ολοκληρωθεί η ενημέρωση και οι αλλαγές θα χαθούν.\n\nΝα συνεχίσω χωρίς αποθήκευση;')) {
      return;
    }
    await api.install();
  } else if (s.state === 'error' && s.url) {
    openInExternalBrowser({ isUrl: true, url: s.url });
  }
}

// Έλεγχος για νέα έκδοση. silent: αυτόματος έλεγχος κατά την εκκίνηση (δεν ενοχλεί αν δεν υπάρχει κάτι να δείξει)
async function checkAppUpdates(silent = false) {
  const api = window.electronAPI && window.electronAPI.update;
  if (!api) {
    if (!silent) showToast('Η λειτουργία ενημερώσεων δεν είναι διαθέσιμη.');
    return;
  }
  if (!silent) showToast('Έλεγχος για νεότερη έκδοση στο GitHub...');

  let s;
  try {
    s = await api.check(!silent);
  } catch (err) {
    console.error('Update check error:', err);
    if (!silent) showToast('⚠️ Σφάλμα κατά τον έλεγχο ενημερώσεων.');
    return;
  }
  if (!s) return;
  if (s.state === 'none') {
    if (!silent) showToast(`✔ Έχετε την πιο πρόσφατη έκδοση (v${s.current})!`);
    return;
  }
  if (s.state === 'error' && s.phase === 'check') {
    if (!silent) showToast('⚠️ Δεν ήταν δυνατή η σύνδεση για έλεγχο ενημερώσεων.');
    return;
  }
  updateState = s;
  renderUpdateBadge(s);
  renderUpdateModal(s);
  // Κατά την εκκίνηση το παράθυρο ανοίγει μόνο όταν η ενημέρωση γίνεται από την εφαρμογή· αλλιώς φτάνει η ειδοποίηση
  // στη γραμμή κατάστασης (π.χ. στο MSI του εργαστηρίου, όπου οι μαθητές δεν μπορούν να ενημερώσουν)
  if (!silent || s.canInstall) openModal('update-modal');
}

// Ρύθμιση Resizing & Event Listeners
function setupEventListeners() {
  // Mode selection buttons
  document.getElementById('btn-mode-beginner').onclick = () => setMode('beginner');
  document.getElementById('btn-mode-advanced').onclick = () => setMode('advanced');

  // Καρτέλες αρχείων (φτιάχνονται από το renderTabs)
  renderTabs();

  // Toolbar actions
  document.getElementById('btn-new').onclick = createNewFile;
  document.getElementById('btn-open').onclick = openFile;
  document.getElementById('btn-save').onclick = () => saveCurrentFile(false);
  document.getElementById('btn-save-as').onclick = () => saveCurrentFile(true);
  document.getElementById('btn-insert-image').onclick = insertImageFromFile;
  document.getElementById('btn-fix-css-link').onclick = insertCssLink;
  document.getElementById('btn-export-zip').onclick = exportZip;
  document.getElementById('btn-zip-create').onclick = createZipFromDialog;
  document.getElementById('btn-format').onclick = formatCode;
  document.getElementById('btn-templates').onclick = () => openModal('templates-modal');
  document.getElementById('btn-open-edge').onclick = () => openInExternalBrowser();
  document.getElementById('btn-eclass').onclick = openEclass;
  document.getElementById('btn-toggle-guide').onclick = toggleGuidePanel;
  document.getElementById('btn-zoom-in').onclick = () => adjustFontSize(2);
  document.getElementById('btn-zoom-out').onclick = () => adjustFontSize(-2);
  document.getElementById('btn-theme').onclick = toggleTheme;
  document.getElementById('btn-settings').onclick = () => {
    populateSettingsUI();
    openModal('settings-modal');
  };

  const btnAbout = document.getElementById('btn-about');
  if (btnAbout) {
    btnAbout.onclick = () => openModal('about-modal');
  }

  // About modal collapsible buttons (Terms & Shortcuts)
  const btnShowTerms = document.getElementById('btn-show-terms');
  const termsSection = document.getElementById('about-terms-section');
  if (btnShowTerms && termsSection) {
    btnShowTerms.onclick = () => {
      const isVisible = termsSection.style.display !== 'none';
      termsSection.style.display = isVisible ? 'none' : 'block';
      btnShowTerms.classList.toggle('active', !isVisible);
    };
  }

  const btnShowShortcuts = document.getElementById('btn-show-shortcuts');
  const shortcutsSection = document.getElementById('about-shortcuts-section');
  if (btnShowShortcuts && shortcutsSection) {
    btnShowShortcuts.onclick = () => {
      const isVisible = shortcutsSection.style.display !== 'none';
      shortcutsSection.style.display = isVisible ? 'none' : 'block';
      btnShowShortcuts.classList.toggle('active', !isVisible);
    };
  }

  // Κουμπί «Συντομεύσεις» του ribbon: ανοίγει το «Σχετικά» με τις συντομεύσεις ήδη ανοιχτές
  const btnShortcuts = document.getElementById('btn-shortcuts');
  if (btnShortcuts && shortcutsSection) {
    btnShortcuts.onclick = () => {
      shortcutsSection.style.display = 'block';
      if (btnShowShortcuts) btnShowShortcuts.classList.add('active');
      openModal('about-modal');
    };
  }

  // Θέμα εμφάνισης από το ribbon (εφαρμόζεται και αποθηκεύεται αμέσως)
  const ribbonTheme = document.getElementById('ribbon-theme-select');
  if (ribbonTheme) {
    ribbonTheme.onchange = (e) => updateAppearance({ theme: e.target.value });
  }

  // Χρώμα κεφαλίδας και διαβάθμιση: ρυθμίζονται στο παράθυρο Ρυθμίσεων
  const btnHeaderColor = document.getElementById('btn-header-color');
  if (btnHeaderColor) {
    btnHeaderColor.onclick = () => {
      populateSettingsUI();
      openModal('settings-modal');
    };
  }

  // Ribbon tabs (Κεντρικό / Εργασία / Εμφάνιση / Ρυθμίσεις & Βοήθεια)
  document.querySelectorAll('.ribbon-tab').forEach(tab => {
    tab.onclick = () => setRibbonTab(tab.dataset.ribbon);
  });

  // Settings modal buttons
  const btnBrowse = document.getElementById('btn-browse-folder');
  if (btnBrowse) btnBrowse.onclick = browseFolder;
  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) btnSaveSettings.onclick = saveCurrentSettings;

  // Κουμπιά ελέγχου ενημερώσεων
  const btnCheckUpdatesSettings = document.getElementById('btn-check-updates-settings');
  if (btnCheckUpdatesSettings) {
    btnCheckUpdatesSettings.onclick = () => checkAppUpdates(false);
  }
  const btnCheckUpdatesAbout = document.getElementById('btn-check-updates-about');
  if (btnCheckUpdatesAbout) {
    btnCheckUpdatesAbout.onclick = () => checkAppUpdates(false);
  }
  const btnDownloadUpdate = document.getElementById('btn-download-update');
  if (btnDownloadUpdate) btnDownloadUpdate.onclick = runUpdateAction;
  const statusUpdateBadge = document.getElementById('status-update-badge');
  if (statusUpdateBadge) {
    statusUpdateBadge.onclick = () => {
      if (updateState && ['available', 'downloading', 'ready', 'error'].includes(updateState.state)) {
        renderUpdateModal(updateState);
        openModal('update-modal');
      } else {
        checkAppUpdates(false);
      }
    };
  }

  // Window Controls (Πλήρης Οθόνη)
  const btnFull = document.getElementById('btn-win-fullscreen');
  if (btnFull) {
    btnFull.onclick = () => {
      if (window.electronAPI && window.electronAPI.toggleFullScreen) {
        window.electronAPI.toggleFullScreen();
      }
    };
  }

  // Browser preview toolbar
  document.getElementById('btn-preview-refresh').onclick = updateLivePreview;
  document.getElementById('btn-preview-edge').onclick = openInExternalBrowser;

  // Responsive device buttons
  const frame = document.getElementById('preview-frame');
  document.getElementById('btn-device-desktop').onclick = (e) => {
    setActiveDeviceBtn(e.target);
    frame.className = 'preview-frame';
  };
  document.getElementById('btn-device-tablet').onclick = (e) => {
    setActiveDeviceBtn(e.target);
    frame.className = 'preview-frame tablet';
  };
  document.getElementById('btn-device-mobile').onclick = (e) => {
    setActiveDeviceBtn(e.target);
    frame.className = 'preview-frame mobile';
  };

  // Επαναφορά εστίασης στον editor με κλικ στην περιοχή του editor
  const editorWrapper = document.querySelector('.editor-wrapper');
  if (editorWrapper) {
    editorWrapper.addEventListener('click', () => {
      if (editor && !editor.hasFocus()) {
        editor.focus();
      }
    });
  }

  // Setup panel resizing with gutters
  setupGutters();

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        saveCurrentFile(e.shiftKey);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        openInExternalBrowser();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggleGuidePanel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        cycleTabs(e.shiftKey ? -1 : 1);
      } else if ((e.key === 'w' || e.key === 'W') && !e.shiftKey) {
        e.preventDefault();
        closeFileTab(activeTabId);
      }
    } else if (e.key === 'F5') {
      e.preventDefault();
      updateLivePreview();
    }
  });

  // Modal Closers
  // Το ✕ της κεφαλίδας (.modal-close) και τα κουμπιά κλεισίματος στο κάτω μέρος (data-modal-close, π.χ. «Αργότερα»)
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    };
  });
}

function setupGutters() {
  const gutterGuide = document.getElementById('gutter-guide');
  const gutterPreview = document.getElementById('gutter-preview');
  const guidePanel = document.getElementById('guide-panel');
  const previewPanel = document.getElementById('preview-panel');

  if (gutterGuide) {
    let isDragging = false;
    gutterGuide.addEventListener('mousedown', (e) => {
      isDragging = true;
      gutterGuide.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const newWidth = Math.max(220, Math.min(500, e.clientX));
      guidePanel.style.width = `${newWidth}px`;
      if (editor) editor.refresh();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        gutterGuide.classList.remove('dragging');
        document.body.style.cursor = '';
        if (editor) editor.refresh();
      }
    });
  }

  if (gutterPreview) {
    let isDragging = false;
    gutterPreview.addEventListener('mousedown', (e) => {
      isDragging = true;
      gutterPreview.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const containerWidth = document.querySelector('.workspace-container').clientWidth;
      const newWidth = Math.max(280, Math.min(containerWidth - 400, containerWidth - e.clientX));
      previewPanel.style.width = `${newWidth}px`;
      previewPanel.style.flex = 'none';
      if (editor) editor.refresh();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        gutterPreview.classList.remove('dragging');
        document.body.style.cursor = '';
        if (editor) editor.refresh();
      }
    });
  }
}

// Εναλλαγή της ενεργής καρτέλας του ribbon
function setRibbonTab(name) {
  document.querySelectorAll('.ribbon-tab').forEach(t => {
    const isActive = t.dataset.ribbon === name;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  document.querySelectorAll('.ribbon-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.ribbon === name);
  });
}

function setActiveDeviceBtn(btn) {
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleGuidePanel() {
  const panel = document.getElementById('guide-panel');
  panel.classList.toggle('collapsed');
  if (editor) editor.refresh();
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

let toastTimer = null;
function showToast(msg, durationMs = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, durationMs);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Διασύνδεση με το εγγενές μενού του Electron
function setupElectronMenuBridge() {
  if (!window.electronAPI) return;

  window.electronAPI.onMenuNew(() => createNewFile());
  window.electronAPI.onMenuOpen(() => openFile());
  window.electronAPI.onMenuSave(() => saveCurrentFile(false));
  window.electronAPI.onMenuSaveAs(() => saveCurrentFile(true));
  window.electronAPI.onMenuExportZip(() => exportZip());
  window.electronAPI.onMenuRefreshPreview(() => updateLivePreview());
  window.electronAPI.onMenuOpenEdge(() => openInExternalBrowser());
  window.electronAPI.onMenuToggleGuide(() => toggleGuidePanel());
  window.electronAPI.onMenuToggleMode(() => setMode(currentMode === 'beginner' ? 'advanced' : 'beginner'));
  window.electronAPI.onMenuFormatCode(() => formatCode());
  window.electronAPI.onMenuAbout(() => openModal('about-modal'));
  if (window.electronAPI.onMenuCheckUpdates) {
    window.electronAPI.onMenuCheckUpdates(() => checkAppUpdates(false));
  }
  if (window.electronAPI.onMenuInsertImage) {
    window.electronAPI.onMenuInsertImage(() => insertImageFromFile());
  }
  if (window.electronAPI.onMenuSetTheme) {
    window.electronAPI.onMenuSetTheme((_event, id) => updateAppearance({ theme: id }));
  }
  if (window.electronAPI.onMenuToggleTheme) {
    window.electronAPI.onMenuToggleTheme(() => toggleTheme());
  }
}

// ==========================================================================
// ΔΙΑΧΕΙΡΙΣΗ ΔΕΞΙΟΥ ΚΛΙΚ & CONTEXT MENU (WINDOWS 11 FLUENT STYLE)
// ==========================================================================

function initContextMenu() {
  // Παρακολούθηση δεξιού κλικ σε ολόκληρο το παράθυρο
  window.addEventListener('contextmenu', (e) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    handleGeneralContextMenu(e);
  });

  // Κλείσιμο του μενού με πάτημα έξω από αυτό
  window.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#context-menu')) {
      closeContextMenu();
    }
  });

  // Κλείσιμο με Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeContextMenu();
    }
  });

  // Κλείσιμο σε αλλαγή μεγέθους παραθύρου
  window.addEventListener('resize', closeContextMenu);

  // Ακρόαση μηνυμάτων από το ενσωματωμένο preview iframe για δεξί κλικ
  window.addEventListener('message', (ev) => {
    if (ev.data && ev.data.type === 'preview-contextmenu') {
      const frame = document.getElementById('preview-frame');
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const x = rect.left + (ev.data.clientX || 0);
      const y = rect.top + (ev.data.clientY || 0);
      const sel = ev.data.selection || '';

      const items = [];
      if (sel && sel.trim().length > 0) {
        items.push({
          id: 'copy',
          icon: '📋',
          label: 'Αντιγραφή',
          shortcut: 'Ctrl+C',
          action: async () => {
            await writeToClipboard(sel);
            showToast('Αντιγράφηκε στο πρόχειρο!');
          }
        });
        items.push({ type: 'separator' });
      }
      items.push({
        id: 'refresh',
        icon: '🔄',
        label: 'Ανανέωση Προεπισκόπησης',
        shortcut: 'F5',
        action: () => updateLivePreview()
      });
      items.push({
        id: 'openBrowser',
        icon: '🌐',
        label: `Προβολή στον ${getBrowserName(appSettings.browser)}`,
        shortcut: 'Ctrl+B',
        action: () => openInExternalBrowser()
      });
      items.push({ type: 'separator' });
      items.push({
        id: 'fullscreen',
        icon: '⛶',
        label: 'Πλήρης Οθόνη',
        shortcut: 'F11',
        action: () => {
          if (window.electronAPI && window.electronAPI.toggleFullScreen) {
            window.electronAPI.toggleFullScreen();
          }
        }
      });

      openContextMenu(items, x, y);
    }
  });
}

// Διαχείριση δεξιού κλικ στον CodeMirror Editor
async function handleEditorContextMenu(cm, e) {
  if (!cm) return;

  // Αν δεν υπάρχει επιλεγμένο κείμενο, μετακινούμε τον κέρσορα στη θέση που έγινε το κλικ
  if (!cm.somethingSelected()) {
    const coords = cm.coordsChar({ left: e.clientX, top: e.clientY });
    if (coords) {
      cm.setCursor(coords);
    }
  }

  const hasSelection = cm.somethingSelected();
  const history = cm.historySize();
  const canUndo = !!(history && history.undo > 0);
  const canRedo = !!(history && history.redo > 0);

  const items = [
    {
      id: 'undo',
      icon: '↩️',
      label: 'Αναίρεση',
      shortcut: 'Ctrl+Z',
      disabled: !canUndo,
      action: () => {
        cm.undo();
        cm.focus();
      }
    },
    {
      id: 'redo',
      icon: '↪️',
      label: 'Επανάληψη',
      shortcut: 'Ctrl+Y',
      disabled: !canRedo,
      action: () => {
        cm.redo();
        cm.focus();
      }
    },
    { type: 'separator' },
    {
      id: 'cut',
      icon: '✂️',
      label: 'Αποκοπή',
      shortcut: 'Ctrl+X',
      disabled: !hasSelection,
      action: async () => {
        const text = cm.getSelection();
        if (text) {
          await writeToClipboard(text);
          cm.replaceSelection('');
          cm.focus();
          showToast('Αποκοπή επιτυχής!');
        }
      }
    },
    {
      id: 'copy',
      icon: '📋',
      label: 'Αντιγραφή',
      shortcut: 'Ctrl+C',
      disabled: !hasSelection,
      action: async () => {
        const text = cm.getSelection();
        if (text) {
          await writeToClipboard(text);
          cm.focus();
          showToast('Αντιγράφηκε στο πρόχειρο!');
        }
      }
    },
    {
      id: 'paste',
      icon: '📥',
      label: 'Επικόλληση',
      shortcut: 'Ctrl+V',
      disabled: false,
      action: async () => {
        const text = await readFromClipboard();
        if (text) {
          cm.replaceSelection(text);
          cm.focus();
          showToast('Επικόλληση επιτυχής!');
        } else {
          showToast('Το πρόχειρο είναι κενό.');
        }
      }
    },
    {
      id: 'delete',
      icon: '🗑️',
      label: 'Διαγραφή',
      shortcut: 'Del',
      disabled: !hasSelection,
      action: () => {
        cm.replaceSelection('');
        cm.focus();
      }
    },
    { type: 'separator' },
    {
      id: 'selectAll',
      icon: '🔲',
      label: 'Επιλογή Όλων',
      shortcut: 'Ctrl+A',
      action: () => {
        cm.execCommand('selectAll');
        cm.focus();
      }
    },
    { type: 'separator' },
    {
      id: 'format',
      icon: '✨',
      label: 'Μορφοποίηση Κώδικα (Beautify)',
      shortcut: 'Shift+Alt+F',
      action: () => {
        formatCode();
        cm.focus();
      }
    },
    {
      id: 'autocomplete',
      icon: '💡',
      label: 'Προτάσεις Εντολών',
      shortcut: 'Ctrl+Space',
      action: () => {
        cm.focus();
        triggerAutocomplete(cm);
      }
    },
    ...(currentMode === 'advanced' ? [{
      id: 'insertCssLink',
      icon: '🔗',
      label: 'Σύνδεση με CSS (<link>)',
      action: () => insertCssLink()
    }] : []),
    {
      id: 'insertImage',
      icon: '🖼️',
      label: 'Εισαγωγή εικόνας από αρχείο…',
      shortcut: 'Ctrl+Shift+P',
      action: () => insertImageFromFile()
    },
    { type: 'separator' },
    {
      id: 'save',
      icon: '💾',
      label: 'Αποθήκευση Αρχείου',
      shortcut: 'Ctrl+S',
      action: () => saveCurrentFile()
    },
    {
      id: 'openBrowser',
      icon: '🌐',
      label: `Προβολή στον ${getBrowserName(appSettings.browser)}`,
      shortcut: 'Ctrl+B',
      action: () => openInExternalBrowser()
    }
  ];

  openContextMenu(items, e.clientX, e.clientY);
}

// Διαχείριση δεξιού κλικ σε γενικά στοιχεία της σελίδας
function handleGeneralContextMenu(e) {
  // 1. Έλεγχος αν το κλικ έγινε μέσα στον Editor Panel (gutter, scroller, tabs)
  if (e.target.closest('.editor-panel') && editor) {
    handleEditorContextMenu(editor, e);
    return;
  }

  // 2. Έλεγχος αν το κλικ έγινε σε πεδίο κειμένου input ή textarea
  const targetInput = e.target.closest('input, textarea');
  if (targetInput && !targetInput.closest('.CodeMirror')) {
    const start = targetInput.selectionStart;
    const end = targetInput.selectionEnd;
    const hasInputSelection = (typeof start === 'number' && typeof end === 'number' && start !== end);

    const items = [
      {
        id: 'input-cut',
        icon: '✂️',
        label: 'Αποκοπή',
        shortcut: 'Ctrl+X',
        disabled: !hasInputSelection || targetInput.readOnly,
        action: async () => {
          const sel = targetInput.value.substring(start, end);
          if (sel) {
            await writeToClipboard(sel);
            targetInput.value = targetInput.value.substring(0, start) + targetInput.value.substring(end);
            targetInput.setSelectionRange(start, start);
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.focus();
            showToast('Αποκοπή επιτυχής!');
          }
        }
      },
      {
        id: 'input-copy',
        icon: '📋',
        label: 'Αντιγραφή',
        shortcut: 'Ctrl+C',
        disabled: !hasInputSelection,
        action: async () => {
          const sel = targetInput.value.substring(start, end);
          if (sel) {
            await writeToClipboard(sel);
            targetInput.focus();
            showToast('Αντιγράφηκε στο πρόχειρο!');
          }
        }
      },
      {
        id: 'input-paste',
        icon: '📥',
        label: 'Επικόλληση',
        shortcut: 'Ctrl+V',
        disabled: targetInput.readOnly,
        action: async () => {
          const text = await readFromClipboard();
          if (text) {
            const s = targetInput.selectionStart || 0;
            const en = targetInput.selectionEnd || 0;
            const val = targetInput.value || '';
            targetInput.value = val.substring(0, s) + text + val.substring(en);
            targetInput.setSelectionRange(s + text.length, s + text.length);
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.focus();
          }
        }
      },
      { type: 'separator' },
      {
        id: 'input-selectAll',
        icon: '🔲',
        label: 'Επιλογή Όλων',
        shortcut: 'Ctrl+A',
        action: () => {
          targetInput.select();
          targetInput.focus();
        }
      }
    ];
    openContextMenu(items, e.clientX, e.clientY);
    return;
  }

  // 3. Έλεγχος αν υπάρχει επιλεγμένο κείμενο οπουδήποτε αλλού στη σελίδα (π.χ. οδηγός, modal)
  const selectedText = window.getSelection() ? window.getSelection().toString() : '';
  if (selectedText && selectedText.trim().length > 0) {
    const items = [
      {
        id: 'text-copy',
        icon: '📋',
        label: 'Αντιγραφή',
        shortcut: 'Ctrl+C',
        action: async () => {
          await writeToClipboard(selectedText);
          showToast('Αντιγράφηκε στο πρόχειρο!');
        }
      },
      {
        id: 'text-selectAll',
        icon: '🔲',
        label: 'Επιλογή Όλων',
        shortcut: 'Ctrl+A',
        action: () => {
          document.execCommand('selectAll');
        }
      }
    ];
    openContextMenu(items, e.clientX, e.clientY);
    return;
  }

  // 4. Γενικό μενού εφαρμογής για κενές περιοχές
  const items = [
    {
      id: 'refresh',
      icon: '🔄',
      label: 'Ανανέωση Προεπισκόπησης',
      shortcut: 'F5',
      action: () => updateLivePreview()
    },
    {
      id: 'openBrowser',
      icon: '🌐',
      label: `Προβολή στον ${getBrowserName(appSettings.browser)}`,
      shortcut: 'Ctrl+B',
      action: () => openInExternalBrowser()
    },
    { type: 'separator' },
    {
      id: 'toggleGuide',
      icon: '📚',
      label: 'Εναλλαγή Οδηγού Εντολών',
      shortcut: 'Ctrl+G',
      action: () => toggleGuidePanel()
    },
    {
      id: 'fullscreen',
      icon: '⛶',
      label: 'Πλήρης Οθόνη',
      shortcut: 'F11',
      action: () => {
        if (window.electronAPI && window.electronAPI.toggleFullScreen) {
          window.electronAPI.toggleFullScreen();
        }
      }
    }
  ];
  openContextMenu(items, e.clientX, e.clientY);
}

// Εμφάνιση του αναδυόμενου μενού δεξιού κλικ
function openContextMenu(items, x, y) {
  const menu = document.getElementById('context-menu');
  if (!menu) return;

  menu.innerHTML = '';
  items.forEach(item => {
    if (item.type === 'separator') {
      const sep = document.createElement('div');
      sep.className = 'ctx-separator';
      menu.appendChild(sep);
      return;
    }
    const el = document.createElement('div');
    el.className = 'ctx-item' + (item.disabled ? ' disabled' : '');
    el.innerHTML = `
      <span class="ctx-icon">${item.icon || ''}</span>
      <span class="ctx-label">${escapeHtml(item.label)}</span>
      ${item.shortcut ? `<span class="ctx-shortcut">${escapeHtml(item.shortcut)}</span>` : ''}
    `;
    if (!item.disabled) {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        closeContextMenu();
        if (item.action) {
          try { item.action(); } catch (err) { console.error('Menu action error:', err); }
        }
      });
    }
    menu.appendChild(el);
  });

  menu.style.display = 'block';
  menu.classList.add('open');

  // Υπολογισμός θέσης με αποτροπή υπερχείλισης από την οθόνη
  const menuWidth = menu.offsetWidth || 230;
  const menuHeight = menu.offsetHeight || 300;
  const pad = 8;

  let left = x;
  let top = y;

  if (left + menuWidth > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - menuWidth - pad);
  }
  if (top + menuHeight > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - menuHeight - pad);
  }

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

// Κλείσιμο του αναδυόμενου μενού δεξιού κλικ
function closeContextMenu() {
  const menu = document.getElementById('context-menu');
  if (menu && menu.style.display !== 'none') {
    menu.style.display = 'none';
    menu.classList.remove('open');
  }
}

// Βοηθητικές συναρτήσεις Προχείρου (Clipboard)
async function writeToClipboard(text) {
  try {
    if (window.electronAPI && window.electronAPI.writeClipboard) {
      await window.electronAPI.writeClipboard(text);
      return true;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write error:', err);
  }
  return false;
}

async function readFromClipboard() {
  try {
    if (window.electronAPI && window.electronAPI.readClipboard) {
      const res = await window.electronAPI.readClipboard();
      if (typeof res === 'string') return res;
    } else if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
  }
  return '';
}
