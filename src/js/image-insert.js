'use strict';
/**
 * Πού και πώς μπαίνει η διαδρομή μιας εικόνας στον κώδικα HTML. Καθαρή λογική, χωρίς DOM ή CodeMirror
 * (δοκιμάζεται απευθείας με node). Δουλεύει με θέσεις χαρακτήρων μέσα στο κείμενο.
 *
 *  1. Ο κέρσορας (ή η επιλογή) είναι μέσα σε ένα υπάρχον <img …>:
 *       - έχει src="…"  → αντικαθίσταται μόνο η τιμή ανάμεσα στα εισαγωγικά (π.χ. <img src=""> → <img src="a.jpg">)
 *       - δεν έχει src  → προστίθεται  src="…"  αμέσως μετά το <img
 *  2. Αλλιώς μπαίνει ολόκληρη η ετικέτα  <img src="…" alt="">  στη θέση του κέρσορα (ή της επιλογής) και ο κέρσορας
 *     μένει μέσα στο alt="" για να γράψει ο μαθητής την περιγραφή.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ImageInsert = api;
})(typeof self !== 'undefined' ? self : this, function () {
  /** Ο <img …> στον οποίο βρίσκεται η επιλογή [start, end], ή null. Επιστρέφει { open, close } (θέσεις των < και >). */
  function enclosingImgTag(text, start, end) {
    const open = start > 0 ? text.lastIndexOf('<', start - 1) : -1;
    if (open < 0) return null;
    // μέσα στην ίδια ετικέτα: κανένα > ανάμεσα στο < και την επιλογή, και η επιλογή δεν περιέχει < ή >
    const closeBefore = start > 0 ? text.lastIndexOf('>', start - 1) : -1;
    if (closeBefore > open) return null;
    if (/[<>]/.test(text.slice(start, end))) return null;
    const close = text.indexOf('>', end);
    if (close < 0) return null;
    return /^<img(?=[\s/>])/i.test(text.slice(open, close + 1)) ? { open, close } : null;
  }

  /**
   * text: ο κώδικας HTML· start, end: η επιλογή (start === end όταν δεν υπάρχει επιλογή)· src: η διαδρομή της εικόνας.
   * Επιστρέφει { from, to, insert, cursor, mode }: αντικατάσταση του text[from, to) με το insert, και η θέση του
   * κέρσορα μετά την αλλαγή. mode: 'fill' (συμπλήρωση του src), 'add-src' ή 'new' (νέα ετικέτα).
   */
  function planImageInsert(text, start, end, src) {
    const tag = enclosingImgTag(text, start, end);
    if (tag) {
      const tagText = text.slice(tag.open, tag.close + 1);
      const m = /(?<![\w-])src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(tagText);
      if (m) {
        const attrStart = tag.open + m.index;
        const attrEnd = attrStart + m[0].length;
        if (m[3] !== undefined) {
          // τιμή χωρίς εισαγωγικά: μπαίνει ολόκληρη με εισαγωγικά
          const insert = `src="${src}"`;
          return { from: attrStart, to: attrEnd, insert, cursor: attrStart + insert.length, mode: 'fill' };
        }
        // τιμή μέσα σε εισαγωγικά: αλλάζει μόνο ό,τι είναι ανάμεσά τους
        const valueLength = (m[1] !== undefined ? m[1] : m[2]).length;
        const to = attrEnd - 1;
        const from = to - valueLength;
        return { from, to, insert: src, cursor: from + src.length + 1, mode: 'fill' };
      }
      const insert = ` src="${src}"`;
      const at = tag.open + 4; // αμέσως μετά το «<img»
      return { from: at, to: at, insert, cursor: at + insert.length, mode: 'add-src' };
    }
    const insert = `<img src="${src}" alt="">`;
    return { from: start, to: end, insert, cursor: start + insert.length - 2, mode: 'new' };
  }

  return { planImageInsert, enclosingImgTag };
});
