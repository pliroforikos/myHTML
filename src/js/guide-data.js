// Ολοκληρωμένος Οδηγός Εντολών HTML5 & CSS3 για Α' Λυκείου (ΓΕΛ) και ΕΠΑΛ (Τομέας Πληροφορικής)
const GUIDE_CATEGORIES = [
  { id: 'all', title: 'Όλες οι Εντολές', icon: '📚' },
  { id: 'structure', title: 'Βασική Δομή HTML', icon: '🌐' },
  { id: 'text', title: 'Κείμενο & Μορφοποίηση', icon: '📝' },
  { id: 'links_media', title: 'Σύνδεσμοι & Πολυμέσα', icon: '🔗' },
  { id: 'lists', title: 'Λίστες (ul, ol, dl)', icon: '📋' },
  { id: 'tables', title: 'Πίνακες (Tables)', icon: '📊' },
  { id: 'forms', title: 'Φόρμες & Στοιχεία (Forms)', icon: '📥' },
  { id: 'semantic', title: 'Σημασιολογικά Στοιχεία HTML5', icon: '🧱' },
  { id: 'css_basics', title: 'CSS Βασικά & Χρώματα', icon: '🎨' },
  { id: 'css_typography', title: 'CSS Γραμματοσειρές', icon: '🔤' },
  { id: 'css_boxmodel', title: 'CSS Box Model & Περιθώρια', icon: '📦' },
  { id: 'css_flexbox', title: 'CSS Διάταξη & Flexbox', icon: '📐' }
];

const GUIDE_ITEMS = [
  // --- ΒΑΣΙΚΗ ΔΟΜΗ HTML ---
  {
    category: 'structure',
    target: 'html',
    name: '<!DOCTYPE html>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Δήλωση τύπου εγγράφου HTML5',
    description: 'Δηλώνει στον browser ότι το έγγραφο είναι γραμμένο σε σύγχρονο κώδικα HTML5. Τοποθετείται πάντα στην 1η γραμμή.',
    syntax: '<!DOCTYPE html>',
    example: '<!DOCTYPE html>\n<html lang="el">\n  ...\n</html>',
    insertCode: '<!DOCTYPE html>\n'
  },
  {
    category: 'structure',
    target: 'html',
    name: '<html lang="el">',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Ριζικό στοιχείο της ιστοσελίδας',
    description: 'Περικλείει όλο τον κώδικα της σελίδας. Η ιδιότητα lang="el" καθορίζει ότι η γλώσσα περιεχομένου είναι τα Ελληνικά.',
    syntax: '<html lang="el">\n  ...\n</html>',
    example: '<html lang="el">\n  <head>...</head>\n  <body>...</body>\n</html>',
    insertCode: '<html lang="el">\n  \n</html>'
  },
  {
    category: 'structure',
    target: 'html',
    name: '<head>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Κεφαλίδα με μεταδεδομένα της σελίδας',
    description: 'Περιέχει πληροφορίες για τη σελίδα που δεν εμφανίζονται στο κυρίως σώμα (τίτλος καρτέλας, κωδικοποίηση, συνδέσεις με CSS).',
    syntax: '<head>\n  <meta charset="UTF-8">\n  <title>Τίτλος</title>\n</head>',
    example: '<head>\n  <meta charset="UTF-8">\n  <title>Η Πρώτη μου Σελίδα</title>\n</head>',
    insertCode: '<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Τίτλος Σελίδας</title>\n</head>\n'
  },
  {
    category: 'structure',
    target: 'html',
    name: '<title>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Τίτλος στην καρτέλα του φυλλομετρητή (Browser tab)',
    description: 'Ορίζει τον τίτλο που εμφανίζεται στην καρτέλα του Edge/Chrome και στα αποτελέσματα αναζήτησης.',
    syntax: '<title>Το όνομα της σελίδας μου</title>',
    example: '<title>Μαθητικό Ιστολόγιο 1ου ΓΕΛ</title>',
    insertCode: '<title>Το Όνομα της Σελίδας μου</title>\n'
  },
  {
    category: 'structure',
    target: 'html',
    name: '<meta charset="UTF-8">',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Κωδικοποίηση ελληνικών χαρακτήρων',
    description: 'Εξασφαλίζει ότι τα ελληνικά κείμενα θα εμφανίζονται σωστά χωρίς ακαταλαβίστικα σύμβολα (mojibake).',
    syntax: '<meta charset="UTF-8">',
    example: '<meta charset="UTF-8">',
    insertCode: '<meta charset="UTF-8">\n'
  },
  {
    category: 'structure',
    target: 'html',
    name: '<body>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Το ορατό σώμα της ιστοσελίδας',
    description: 'Περιέχει όλο το ορατό περιεχόμενο που βλέπει ο χρήστης: κείμενα, εικόνες, βίντεο, πίνακες, φόρμες.',
    syntax: '<body>\n  <!-- Εδώ μπαίνει το περιεχόμενο -->\n</body>',
    example: '<body>\n  <h1>Καλώς ήρθατε!</h1>\n  <p>Αυτή είναι η σελίδα μου.</p>\n</body>',
    insertCode: '<body>\n  <h1>Καλώς ήρθατε!</h1>\n  <p>Γράψτε το κείμενό σας εδώ...</p>\n</body>'
  },

  // --- ΚΕΙΜΕΝΟ & ΜΟΡΦΟΠΟΙΗΣΗ ---
  {
    category: 'text',
    target: 'html',
    name: '<h1> έως <h6>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Επικεφαλίδες κειμένου (6 επίπεδα)',
    description: 'Το <h1> είναι ο κύριος τίτλος (μεγαλύτερος και πιο σημαντικός), ενώ το <h6> είναι ο μικρότερος υποτίτλος.',
    syntax: '<h1>Κύριος Τίτλος</h1>\n<h2>Υπότιτλος Ενότητας</h2>',
    example: '<h1>Εφαρμογές Πληροφορικής</h1>\n<h2>Κεφάλαιο 3: HTML & CSS</h2>\n<h3>Ενότητα 3.1</h3>',
    insertCode: '<h1>Κύριος Τίτλος</h1>\n<h2>Υπότιτλος Ενότητας</h2>\n'
  },
  {
    category: 'text',
    target: 'html',
    name: '<p>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Παράγραφος κειμένου',
    description: 'Δημιουργεί μια παράγραφο κειμένου. Αφήνει αυτόματα κενό διάστημα πριν και μετά.',
    syntax: '<p>Κείμενο παραγράφου...</p>',
    example: '<p>Η HTML είναι η γλώσσα σήμανσης για τη δημιουργία ιστοσελίδων.</p>',
    insertCode: '<p>Γράψτε εδώ την παράγραφο του κειμένου σας.</p>\n'
  },
  {
    category: 'text',
    target: 'html',
    name: '<br>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Αλλαγή γραμμής (Line Break)',
    description: 'Αλλάζει γραμμή χωρίς να ξεκινήσει νέα παράγραφο. Είναι κενό στοιχείο (δεν χρειάζεται ετικέτα κλεισίματος).',
    syntax: 'Πρώτη γραμμή<br>Δεύτερη γραμμή',
    example: 'Διεύθυνση: Σχολική Οδός 12<br>Τηλέφωνο: 210-1234567',
    insertCode: '<br>'
  },
  {
    category: 'text',
    target: 'html',
    name: '<hr>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Οριζόντια διαχωριστική γραμμή',
    description: 'Σχεδιάζει μια οριζόντια γραμμή που διαχωρίζει θεματικά τις ενότητες μιας σελίδας.',
    syntax: '<hr>',
    example: '<p>Τέλος πρώτου θέματος.</p>\n<hr>\n<p>Αρχή δεύτερου θέματος.</p>',
    insertCode: '<hr>\n'
  },
  {
    category: 'text',
    target: 'html',
    name: '<b> και <strong>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Έντονη γραφή (Bold / Σημαντικό κείμενο)',
    description: 'Το <b> κάνει τα γράμματα έντονα. Το <strong> δηλώνει και σημασιολογική έμφαση/σπουδαιότητα.',
    syntax: '<b>Έντονο κείμενο</b>\n<strong>Σημαντικό μήνυμα!</strong>',
    example: '<p>Προσοχή: Η προθεσμία είναι <strong>αυστηρή</strong>!</p>',
    insertCode: '<strong>Έντονο κείμενο</strong>'
  },
  {
    category: 'text',
    target: 'html',
    name: '<i> και <em>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Πλάγια γραφή (Italic / Έμφαση)',
    description: 'Το <i> εμφανίζει το κείμενο με πλάγια γράμματα. Το <em> προσδίδει έμφαση (emphasis).',
    syntax: '<i>Πλάγια γραφή</i>\n<em>Έμφαση</em>',
    example: '<p>Ο όρος <em>αλγόριθμος</em> προέρχεται από το όνομα του Al-Khwarizmi.</p>',
    insertCode: '<em>Πλάγιο κείμενο</em>'
  },
  {
    category: 'text',
    target: 'html',
    name: '<u>, <mark>, <small>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Υπογράμμιση, Μαρκάρισμα & Μικρά γράμματα',
    description: '<u> για υπογράμμιση, <mark> για κίτρινο μαρκάρισμα/υπογράμμιση highlighter, <small> για ψιλά γράμματα (σημειώσεις).',
    syntax: '<mark>Μαρκαρισμένο</mark>\n<u>Υπογραμμισμένο</u>\n<small>Σημείωση</small>',
    example: '<p>Τιμή: 10€ <mark>Έκπτωση 50%</mark> <small>(για μαθητές)</small></p>',
    insertCode: '<mark>Σημαντική φράση</mark>'
  },
  {
    category: 'text',
    target: 'html',
    name: '<sub> και <sup>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Δείκτης (Subscript) & Εκθέτης (Superscript)',
    description: 'Για χημικούς τύπους (π.χ. H2O με <sub>) και μαθηματικές δυνάμεις (π.χ. x2 με <sup>).',
    syntax: 'H<sub>2</sub>O\nx<sup>2</sup> + y<sup>2</sup>',
    example: '<p>Το νερό είναι H<sub>2</sub>O και το εμβαδόν r<sup>2</sup></p>',
    insertCode: 'H<sub>2</sub>O και x<sup>2</sup>'
  },

  // --- ΣΥΝΔΕΣΜΟΙ & ΠΟΛΥΜΕΣΑ ---
  {
    category: 'links_media',
    target: 'html',
    name: '<a href="...">',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Υπερσύνδεσμος (Link)',
    description: 'Συνδέει σε άλλη ιστοσελίδα, αρχείο ή σημείο της σελίδας. Με target="_blank" ανοίγει σε νέα καρτέλα.',
    syntax: '<a href="URL" target="_blank">Κείμενο Συνδέσμου</a>',
    example: '<a href="https://minedu.gov.gr" target="_blank">Υπουργείο Παιδείας</a>\n<a href="mailto:sch@sch.gr">Αποστολή Email</a>',
    insertCode: '<a href="https://example.com" target="_blank">Επισκεφθείτε την ιστοσελίδα</a>\n'
  },
  {
    category: 'links_media',
    target: 'html',
    name: '<img src="..." alt="...">',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Εικόνα',
    description: 'Εμφανίζει εικόνα. Το src είναι η διαδρομή/URL του αρχείου και το alt είναι η περιγραφή για προσβασιμότητα και αν αποτύχει η φόρτωση.',
    syntax: '<img src="diadromi/eikona.jpg" alt="Περιγραφή εικόνας" width="300">',
    example: '<img src="https://picsum.photos/400/250" alt="Τυχαία όμορφη φωτογραφία" width="400">',
    insertCode: '<img src="https://picsum.photos/400/250" alt="Περιγραφή εικόνας" width="400">\n'
  },
  {
    category: 'links_media',
    target: 'html',
    name: '<audio controls>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Αναπαραγωγή Ήχου',
    description: 'Ενσωματώνει αρχείο ήχου (mp3, ogg, wav) με κουμπιά ελέγχου αναπαραγωγής (play, pause, volume).',
    syntax: '<audio controls>\n  <source src="audio.mp3" type="audio/mpeg">\n  Το πρόγραμμα περιήγησης δεν υποστηρίζει ήχο.\n</audio>',
    example: '<audio controls>\n  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">\n</audio>',
    insertCode: '<audio controls>\n  <source src="sound.mp3" type="audio/mpeg">\n  Ο browser σας δεν υποστηρίζει αναπαραγωγή ήχου.\n</audio>\n'
  },
  {
    category: 'links_media',
    target: 'html',
    name: '<video controls>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Αναπαραγωγή Βίντεο',
    description: 'Ενσωματώνει βίντεο (mp4, webm) με πλήκτρα αναπαραγωγής και καθορισμό πλάτους/ύψους.',
    syntax: '<video width="480" height="270" controls>\n  <source src="video.mp4" type="video/mp4">\n</video>',
    example: '<video width="480" height="270" controls>\n  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">\n</video>',
    insertCode: '<video width="480" height="270" controls>\n  <source src="movie.mp4" type="video/mp4">\n  Ο browser σας δεν υποστηρίζει βίντεο.\n</video>\n'
  },

  // --- ΛΙΣΤΕΣ ---
  {
    category: 'lists',
    target: 'html',
    name: '<ul> και <li>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Μη αριθμημένη λίστα (Κουκκίδες - Unordered List)',
    description: 'Εμφανίζει στοιχεία με κουκκίδες. Το <ul> περιέχει τα <li> (list items).',
    syntax: '<ul>\n  <li>Πρώτο στοιχείο</li>\n  <li>Δεύτερο στοιχείο</li>\n</ul>',
    example: '<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n  <li>JavaScript</li>\n</ul>',
    insertCode: '<ul>\n  <li>Πρώτο στοιχείο</li>\n  <li>Δεύτερο στοιχείο</li>\n  <li>Τρίτο στοιχείο</li>\n</ul>\n'
  },
  {
    category: 'lists',
    target: 'html',
    name: '<ol> και <li>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Αριθμημένη λίστα (Ordered List: 1, 2, 3...)',
    description: 'Εμφανίζει στοιχεία με αρίθμηση (1, 2, 3 ή A, B, C με type="A" ή ρωμαϊκά I, II με type="I").',
    syntax: '<ol type="1">\n  <li>Βήμα πρώτο</li>\n  <li>Βήμα δεύτερο</li>\n</ol>',
    example: '<ol>\n  <li>Άνοιγμα του κειμενογράφου</li>\n  <li>Συγγραφή κώδικα HTML</li>\n  <li>Προβολή στον Edge</li>\n</ol>',
    insertCode: '<ol>\n  <li>Βήμα 1: Σχεδίαση</li>\n  <li>Βήμα 2: Υλοποίηση</li>\n  <li>Βήμα 3: Δοκιμή</li>\n</ol>\n'
  },
  {
    category: 'lists',
    target: 'html',
    name: '<dl>, <dt>, <dd>',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Λίστα ορισμών (Description List)',
    description: 'Για λεξικά και επεξηγήσεις όρων: <dl> η λίστα, <dt> ο όρος (term), <dd> ο ορισμός/εξήγηση (description).',
    syntax: '<dl>\n  <dt>HTML</dt>\n  <dd>HyperText Markup Language</dd>\n</dl>',
    example: '<dl>\n  <dt>Browser</dt>\n  <dd>Πρόγραμμα περιήγησης στον παγκόσμιο ιστό.</dd>\n</dl>',
    insertCode: '<dl>\n  <dt>HTML</dt>\n  <dd>Γλώσσα σήμανσης για τη δομή ιστοσελίδων.</dd>\n  <dt>CSS</dt>\n  <dd>Γλώσσα στυλ για την εμφάνιση και διάταξη.</dd>\n</dl>\n'
  },

  // --- ΠΙΝΑΚΕΣ ---
  {
    category: 'tables',
    target: 'html',
    name: '<table>, <tr>, <th>, <td>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Βασική δομή Πίνακα',
    description: '<table> ορίζει τον πίνακα, <tr> ορίζει γραμμή (row), <th> επικεφαλίδα στήλης (έντονη), <td> απλό κελί δεδομένων.',
    syntax: '<table border="1">\n  <tr>\n    <th>Μάθημα</th>\n    <th>Ώρες</th>\n  </tr>\n  <tr>\n    <td>Πληροφορική</td>\n    <td>2</td>\n  </tr>\n</table>',
    example: '<table border="1" style="width:100%; border-collapse: collapse;">\n  <tr>\n    <th>Ημέρα</th>\n    <th>1η Ώρα</th>\n  </tr>\n  <tr>\n    <td>Δευτέρα</td>\n    <td>Μαθηματικά</td>\n  </tr>\n</table>',
    insertCode: '<table border="1" style="border-collapse: collapse; width: 100%;">\n  <thead>\n    <tr>\n      <th>Όνομα</th>\n      <th>Τάξη</th>\n      <th>Βαθμός</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Γιώργος</td>\n      <td>Α1</td>\n      <td>19</td>\n    </tr>\n    <tr>\n      <td>Μαρία</td>\n      <td>Α2</td>\n      <td>20</td>\n    </tr>\n  </tbody>\n</table>\n'
  },
  {
    category: 'tables',
    target: 'html',
    name: 'colspan και rowspan',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Συγχώνευση κελιών πίνακα',
    description: 'colspan="2" συγχωνεύει 2 στήλες οριζόντια. rowspan="2" συγχωνεύει 2 γραμμές κάθετα.',
    syntax: '<td colspan="2">Ενιαίο κελί σε 2 στήλες</td>\n<td rowspan="2">Ενιαίο κελί σε 2 γραμμές</td>',
    example: '<tr>\n  <td colspan="3" style="text-align:center;">Συνολικά Αποτελέσματα</td>\n</tr>',
    insertCode: '<td colspan="2">Συγχωνευμένο Κελί</td>'
  },

  // --- ΦΟΡΜΕΣ & ΣΤΟΙΧΕΙΑ ΕΙΣΟΔΟΥ ---
  {
    category: 'forms',
    target: 'html',
    name: '<form>',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Φόρμα υποβολής στοιχείων',
    description: 'Περικλείει πεδία εισαγωγής για συλλογή δεδομένων από τον χρήστη (action: διεύθυνση προορισμού, method="get" ή "post").',
    syntax: '<form action="#" method="post">\n  <!-- Πεδία φόρμας -->\n</form>',
    example: '<form action="#" method="post">\n  <label>Όνομα: <input type="text" name="fname"></label>\n  <button type="submit">Υποβολή</button>\n</form>',
    insertCode: '<form action="#" method="post">\n  <label for="username">Όνομα Χρήστη:</label>\n  <input type="text" id="username" name="username" required>\n  <br><br>\n  <button type="submit">Αποστολή</button>\n</form>\n'
  },
  {
    category: 'forms',
    target: 'html',
    name: '<input type="text|password|email|number">',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Πεδία κειμένου, κωδικού, email, αριθμού',
    description: 'Επιτρέπει στον χρήστη να πληκτρολογήσει απλό κείμενο, κρυφό κωδικό πρόσβασης, έγκυρο email ή αριθμό.',
    syntax: '<input type="text" placeholder="Πληκτρολογήστε...">\n<input type="password">\n<input type="email">\n<input type="number" min="1" max="100">',
    example: '<input type="email" placeholder="student@sch.gr" required>',
    insertCode: '<label>Email: </label>\n<input type="email" name="user_email" placeholder="name@example.com" required>\n'
  },
  {
    category: 'forms',
    target: 'html',
    name: '<input type="checkbox"> & <input type="radio">',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Κουτιά επιλογής (Checkbox) & Κουμπιά επιλογής (Radio)',
    description: 'Το checkbox επιτρέπει πολλαπλές επιλογές. Το radio (με ίδιο name) επιτρέπει ΜΟΝΟ μία επιλογή από ομάδα επιλογών.',
    syntax: '<input type="checkbox" name="sports" value="football"> Ποδόσφαιρο\n<input type="radio" name="gender" value="male"> Άρρεν\n<input type="radio" name="gender" value="female"> Θήλυ',
    example: '<p>Επιλέξτε τάξη:</p>\n<label><input type="radio" name="grade" value="A"> Α Λυκείου</label>\n<label><input type="radio" name="grade" value="B"> Β Λυκείου</label>',
    insertCode: '<label><input type="checkbox" name="terms" required> Αποδέχομαι τους όρους συμμετοχής</label>\n'
  },
  {
    category: 'forms',
    target: 'html',
    name: '<select> και <option>',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Αναπτυσσόμενη λίστα επιλογών (Drop-down Menu)',
    description: 'Επιτρέπει την επιλογή μιας τιμής από αναδυόμενο κατάλογο.',
    syntax: '<select name="city">\n  <option value="ath">Αθήνα</option>\n  <option value="thess">Θεσσαλονίκη</option>\n</select>',
    example: '<select name="specialty">\n  <option value="it">Πληροφορική (ΕΠΑΛ)</option>\n  <option value="gel">Γενικό Λύκειο</option>\n</select>',
    insertCode: '<label for="city-select">Επιλέξτε Πόλη:</label>\n<select id="city-select" name="city">\n  <option value="ath">Αθήνα</option>\n  <option value="thess">Θεσσαλονίκη</option>\n  <option value="pat">Πάτρα</option>\n  <option value="ira">Ηράκλειο</option>\n</select>\n'
  },
  {
    category: 'forms',
    target: 'html',
    name: '<textarea>',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Πεδίο κειμένου πολλαπλών γραμμών',
    description: 'Για εισαγωγή μεγάλου κειμένου όπως σχόλια, μηνύματα κ.α. (rows: γραμμές, cols: στήλες).',
    syntax: '<textarea rows="4" cols="40" placeholder="Γράψτε το μήνυμά σας..."></textarea>',
    example: '<textarea rows="5" cols="30" name="comments">Πληκτρολογήστε τα σχόλιά σας...</textarea>',
    insertCode: '<textarea rows="4" cols="40" name="message" placeholder="Γράψτε το μήνυμά σας εδώ..."></textarea>\n'
  },
  {
    category: 'forms',
    target: 'html',
    name: '<button type="submit|reset|button">',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Κουμπί ενεργοποίησης / υποβολής',
    description: 'Κουμπί για υποβολή φόρμας (submit), επαναφορά αρχικών τιμών (reset), ή εκτέλεση script.',
    syntax: '<button type="submit">Αποστολή</button>\n<button type="reset">Καθαρισμός</button>',
    example: '<button type="submit" style="padding: 8px 16px; background-color: #2563eb; color: white;">Εγγραφή</button>',
    insertCode: '<button type="submit">Υποβολή Στοιχείων</button>\n'
  },

  // --- ΣΗΜΑΣΙΟΛΟΓΙΚΑ ΣΤΟΙΧΕΙΑ HTML5 ---
  {
    category: 'semantic',
    target: 'html',
    name: '<header>, <nav>, <main>, <footer>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Βασική σημασιολογική δομή σελίδας',
    description: '<header> κεφαλίδα, <nav> μενού πλοήγησης, <main> κύριο περιεχόμενο, <footer> υποσέλιδο. Βοηθούν τις μηχανές αναζήτησης και άτομα με ειδικές ανάγκες.',
    syntax: '<header><h1>Τίτλος</h1></header>\n<nav><a href="#">Αρχική</a></nav>\n<main><p>Κείμενο...</p></main>\n<footer>&copy; 2026</footer>',
    example: '<header>\n  <h1>Το Σχολείο μας</h1>\n  <nav>\n    <a href="#about">Σχετικά</a> | <a href="#contact">Επικοινωνία</a>\n  </nav>\n</header>',
    insertCode: '<header>\n  <h1>Τίτλος Ιστοσελίδας</h1>\n  <nav>\n    <a href="#home">Αρχική</a> |\n    <a href="#about">Σχετικά</a> |\n    <a href="#contact">Επικοινωνία</a>\n  </nav>\n</header>\n<main>\n  <p>Κύριο περιεχόμενο εδώ...</p>\n</main>\n<footer>\n  <p>&copy; 2026 Το Σχολείο μας - Με την επιφύλαξη παντός δικαιώματος.</p>\n</footer>\n'
  },
  {
    category: 'semantic',
    target: 'html',
    name: '<section>, <article>, <aside>',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Ενότητες, Άρθρα & Πλευρικές στήλες',
    description: '<section> αυτόνομη θεματική ενότητα, <article> αυτοτελές άρθρο (π.χ. ανάρτηση blog), <aside> πλευρικό σχετικό περιεχόμενο.',
    syntax: '<section>\n  <h2>Νέα του Σχολείου</h2>\n  <article>\n    <h3>Εκδρομή</h3>\n    <p>Λεπτομέρειες...</p>\n  </article>\n</section>',
    example: '<section>\n  <h2>Ανακοινώσεις</h2>\n  <article>\n    <h3>Έναρξη Μαθημάτων</h3>\n    <p>Τα μαθήματα ξεκινούν τη Δευτέρα.</p>\n  </article>\n</section>',
    insertCode: '<section>\n  <h2>Τίτλος Ενότητας</h2>\n  <article>\n    <h3>Τίτλος Άρθρου</h3>\n    <p>Κείμενο του άρθρου...</p>\n  </article>\n</section>\n'
  },
  {
    category: 'semantic',
    target: 'html',
    name: '<div> και <span>',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Γενικοί περιέκτες (Containers block & inline)',
    description: '<div> είναι περιέκτης επιπέδου μπλοκ (αλλάζει γραμμή) για ομαδοποίηση στοιχείων με CSS. <span> είναι περιέκτης γραμμής (inline) για μεμονωμένες λέξεις.',
    syntax: '<div class="card">\n  <h3>Κάρτα</h3>\n  <p>Κείμενο με <span class="highlight">έμφαση</span>.</p>\n</div>',
    example: '<div style="background-color:#f1f5f9; padding:15px; border-radius:8px;">\n  <h3>Ειδοποίηση</h3>\n  <p>Μήνυμα προς μαθητές.</p>\n</div>',
    insertCode: '<div class="box">\n  <h3>Τίτλος Πλαισίου</h3>\n  <p>Περιεχόμενο μέσα στο πλαίσιο.</p>\n</div>\n'
  },

  // --- CSS ΒΑΣΙΚΑ & ΧΡΩΜΑΤΑ ---
  {
    category: 'css_basics',
    target: 'css',
    name: 'Επιλογείς (Selectors): p, .class, #id',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Στόχευση στοιχείων HTML',
    description: 'p στοχεύει όλα τα <p>. .onoma-klasis στοχεύει στοιχεία με class="onoma-klasis". #monadiko-id στοχεύει το στοιχείο με id="monadiko-id".',
    syntax: 'p { color: red; }\n.tonismeno { font-weight: bold; }\n#koryfi { background: yellow; }',
    example: '/* Στοχεύει όλες τις παραγράφους */\np {\n  color: #333333;\n}\n\n/* Στοχεύει κλάση */\n.highlight {\n  background-color: yellow;\n}',
    insertCode: '/* Επιλογέας κλάσης */\n.my-class {\n  color: #1e3a8a;\n  background-color: #dbeafe;\n  padding: 10px;\n}\n'
  },
  {
    category: 'css_basics',
    target: 'css',
    name: 'color και background-color',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Χρώμα γραμμάτων & Χρώμα φόντου',
    description: 'color ορίζει το χρώμα του κειμένου. background-color ορίζει το χρώμα του φόντου (ονομαστικά π.χ. blue, hex π.χ. #3b82f6, ή rgb).',
    syntax: 'color: #1e40af;\nbackground-color: #f3f4f6;',
    example: 'body {\n  color: #1f2937;\n  background-color: #f8fafc;\n}',
    insertCode: 'color: #2563eb;\nbackground-color: #eff6ff;\n'
  },
  {
    category: 'css_basics',
    target: 'css',
    name: ':hover (Ψευδοκλάση)',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Εφέ όταν το ποντίκι περνάει από πάνω',
    description: 'Εφαρμόζει στυλ όταν ο δείκτης του ποντικιού αιωρείται πάνω από ένα στοιχείο (π.χ. κουμπί ή σύνδεσμο).',
    syntax: 'a:hover {\n  color: red;\n  text-decoration: underline;\n}',
    example: 'button:hover {\n  background-color: #1d4ed8;\n  cursor: pointer;\n}',
    insertCode: 'button:hover {\n  background-color: #1d4ed8;\n  transform: translateY(-2px);\n}\n'
  },

  // --- CSS ΓΡΑΜΜΑΤΟΣΕΙΡΕΣ & ΚΕΙΜΕΝΟ ---
  {
    category: 'css_typography',
    target: 'css',
    name: 'font-family, font-size, font-weight',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Γραμματοσειρά, μέγεθος & πάχος',
    description: 'font-family ορίζει τη γραμματοσειρά (π.χ. Arial, sans-serif), font-size το μέγεθος (π.χ. 16px, 1.2rem), font-weight το πάχος (bold, normal).',
    syntax: 'font-family: Arial, Helvetica, sans-serif;\nfont-size: 18px;\nfont-weight: bold;',
    example: 'h1 {\n  font-family: "Segoe UI", Tahoma, sans-serif;\n  font-size: 28px;\n  font-weight: 700;\n}',
    insertCode: 'font-family: system-ui, -apple-system, sans-serif;\nfont-size: 16px;\nfont-weight: normal;\n'
  },
  {
    category: 'css_typography',
    target: 'css',
    name: 'text-align & text-decoration',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Στοίχιση & Διακόσμηση κειμένου',
    description: 'text-align: left | center | right | justify. text-decoration: none | underline | line-through (αφαίρεση υπογράμμισης συνδέσμων με none).',
    syntax: 'text-align: center;\ntext-decoration: none;',
    example: 'a {\n  text-decoration: none;\n}\na:hover {\n  text-decoration: underline;\n}',
    insertCode: 'text-align: center;\ntext-decoration: none;\n'
  },
  {
    category: 'css_typography',
    target: 'css',
    name: 'line-height & letter-spacing',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Διάστιχο & Απόσταση γραμμάτων',
    description: 'line-height καθορίζει το ύψος γραμμής για ευανάγνωστο κείμενο (π.χ. 1.6). letter-spacing καθορίζει την απόσταση μεταξύ γραμμάτων.',
    syntax: 'line-height: 1.6;\nletter-spacing: 1px;',
    example: 'p {\n  line-height: 1.6;\n  letter-spacing: 0.5px;\n}',
    insertCode: 'line-height: 1.6;\nletter-spacing: 0.5px;\n'
  },

  // --- CSS BOX MODEL & ΠΕΡΙΘΩΡΙΑ ---
  {
    category: 'css_boxmodel',
    target: 'css',
    name: 'margin (Εξωτερικό περιθώριο)',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Απόσταση έξω από τα όρια του στοιχείου',
    description: 'Αφήνει κενό χώρο γύρω από το στοιχείο προς τα γειτονικά στοιχεία. margin: auto κεντράρει οριζόντια ένα block στοιχείο.',
    syntax: 'margin: 20px;\nmargin: 10px 20px;\nmargin: 0 auto; /* Κεντράρισμα */',
    example: '.container {\n  width: 80%;\n  margin: 0 auto;\n}',
    insertCode: 'margin: 15px auto;\n'
  },
  {
    category: 'css_boxmodel',
    target: 'css',
    name: 'padding (Εσωτερικό περιθώριο)',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Απόσταση ανάμεσα στο περιεχόμενο και το περίγραμμα',
    description: 'Δημιουργεί "αέρα" στο εσωτερικό του πλαισίου ώστε το κείμενο να μην κολλάει στο περίγραμμα.',
    syntax: 'padding: 15px;\npadding: 10px 20px;',
    example: '.card {\n  padding: 20px;\n  background-color: white;\n}',
    insertCode: 'padding: 15px;\n'
  },
  {
    category: 'css_boxmodel',
    target: 'css',
    name: 'border και border-radius',
    level: 'ΓΕΛ / ΕΠΑΛ',
    summary: 'Περίγραμμα & Στρογγυλεμένες γωνίες',
    description: 'border ορίζει πάχος, στυλ και χρώμα (π.χ. 2px solid #ccc). border-radius στρογγυλεύει τις γωνίες (π.χ. 8px ή 50% για κύκλο).',
    syntax: 'border: 2px solid #3b82f6;\nborder-radius: 8px;',
    example: '.avatar {\n  border: 3px solid #2563eb;\n  border-radius: 50%; /* Κυκλικό */\n}',
    insertCode: 'border: 1px solid #cbd5e1;\nborder-radius: 8px;\n'
  },
  {
    category: 'css_boxmodel',
    target: 'css',
    name: 'box-shadow',
    level: 'ΕΠΑΛ / ΓΕΛ',
    summary: 'Σκιά στοιχείου (Βάθος)',
    description: 'Δίνει εφέ σκίασης κάνοντας τα στοιχεία να φαίνονται ανασηκωμένα σαν κάρτες.',
    syntax: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);',
    example: '.card {\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);\n}',
    insertCode: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);\n'
  },

  // --- CSS ΔΙΑΤΑΞΗ & FLEXBOX ---
  {
    category: 'css_flexbox',
    target: 'css',
    name: 'display: flex;',
    level: 'ΕΠΑΛ (Προχωρημένο)',
    summary: 'Ενεργοποίηση Flexbox Διάταξης',
    description: 'Κάνει τον περιέκτη ελαστικό κουτί (Flex Container), τοποθετώντας αυτόματα τα παιδιά-στοιχεία σε οριζόντια σειρά.',
    syntax: 'display: flex;',
    example: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}',
    insertCode: 'display: flex;\njustify-content: space-between;\nalign-items: center;\ngap: 15px;\n'
  },
  {
    category: 'css_flexbox',
    target: 'css',
    name: 'justify-content & align-items',
    level: 'ΕΠΑΛ (Προχωρημένο)',
    summary: 'Στοίχιση στον κύριο και κάθετο άξονα',
    description: 'justify-content: flex-start | center | flex-end | space-between | space-around (οριζόντια στοίχιση). align-items: center | flex-start (κάθετη στοίχιση).',
    syntax: 'justify-content: center;\nalign-items: center;',
    example: '.center-box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 200px;\n}',
    insertCode: 'justify-content: center;\nalign-items: center;\n'
  },
  {
    category: 'css_flexbox',
    target: 'css',
    name: 'gap & flex-wrap',
    level: 'ΕΠΑΛ (Προχωρημένο)',
    summary: 'Κενό μεταξύ στοιχείων & Αναδίπλωση',
    description: 'gap: απόσταση ανάμεσα στα στοιχεία του flexbox. flex-wrap: wrap επιτρέπει στα στοιχεία να αλλάζουν σειρά όταν δεν χωράνε στην οθόνη.',
    syntax: 'gap: 15px;\nflex-wrap: wrap;',
    example: '.gallery {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 20px;\n}',
    insertCode: 'gap: 20px;\nflex-wrap: wrap;\n'
  }
];
