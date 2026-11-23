'use strict';
/**
 * Η διαδρομή μιας εικόνας για το src="" του <img>, ανάλογα με το πού βρίσκεται σε σχέση με τη σελίδα HTML.
 * Καθαρή λογική, χωρίς Electron (δοκιμάζεται απευθείας με node).
 *
 *  - Στον ίδιο φάκελο με τη σελίδα:      μόνο το όνομα του αρχείου          →  eikona.jpg              (where: 'same')
 *  - Σε υποφάκελο της σελίδας:           σχετική διαδρομή με «/»            →  images/eikona.jpg       (where: 'sub')
 *  - Οπουδήποτε αλλού:                   ολόκληρη η διαδρομή ως file:///    →  file:///C:/Φωτο/a.jpg   (where: 'outside')
 *
 * Οι σχετικές διαδρομές μένουν σωστές όταν ο φάκελος της σελίδας μετακινηθεί ή παραδοθεί· η πλήρης διαδρομή
 * δουλεύει μόνο σε αυτόν τον υπολογιστή (γι' αυτό η εφαρμογή το επισημαίνει στον χρήστη).
 */
const path = require('path');

/**
 * Κάνει το κείμενο ασφαλές για να μπει μέσα στα εισαγωγικά ενός src="…". Τα κενά και τα ελληνικά μένουν όπως είναι
 * (οι browsers τα δέχονται και διαβάζονται εύκολα)· κωδικοποιούνται μόνο οι χαρακτήρες που αλλιώς αλλάζουν το νόημα:
 * % (αρχή κωδικοποίησης), # (τμήμα URL), ? (ερώτημα), & (οντότητα HTML), εισαγωγικά.
 */
function escapeForSrc(text) {
  return String(text)
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\?/g, '%3F')
    .replace(/&/g, '%26')
    .replace(/"/g, '%22')
    .replace(/'/g, '%27');
}

/** Το πλήρες URL file:/// ενός αρχείου, π.χ. C:\Φωτο\a.jpg → file:///C:/Φωτο/a.jpg (δίκτυο: \\server\share → file://server/share). */
function toFileUrl(filePath) {
  const slashed = filePath.split('\\').join('/');
  if (slashed.startsWith('//')) return 'file:' + escapeForSrc(slashed);
  return 'file:///' + escapeForSrc(slashed.replace(/^\/+/, ''));
}

/**
 * baseDir: ο φάκελος της σελίδας (ή ο φάκελος εργασίας αν δεν έχει αποθηκευτεί ακόμα)· κενός = άγνωστος.
 * imagePath: η πλήρης διαδρομή του αρχείου που διάλεξε ο χρήστης.
 * Επιστρέφει { src, where } με where: 'same' | 'sub' | 'outside'.
 */
function computeImageSrc(baseDir, imagePath) {
  if (baseDir) {
    const rel = path.relative(baseDir, imagePath);
    const climbs = rel === '..' || rel.startsWith('..' + path.sep);
    if (rel && !climbs && !path.isAbsolute(rel)) {
      const slashed = rel.split(path.sep).join('/');
      return { src: escapeForSrc(slashed), where: slashed.includes('/') ? 'sub' : 'same' };
    }
  }
  return { src: toFileUrl(imagePath), where: 'outside' };
}

module.exports = { computeImageSrc, escapeForSrc, toFileUrl };
