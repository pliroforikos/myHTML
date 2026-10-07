// Εκπαιδευτικά Πρότυπα (Starter Templates) για μαθητές ΓΕΛ & ΕΠΑΛ
const STARTER_TEMPLATES = [
  {
    id: 'skeleton',
    title: '1. Βασικός Σκελετός HTML5',
    category: 'Βασικά',
    level: 'ΓΕΛ / ΕΠΑΛ',
    description: 'Ο απαραίτητος κώδικας εκκίνησης για κάθε σύγχρονη ιστοσελίδα.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Η Πρώτη μου Ιστοσελίδα</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      background-color: #f8fafc;
      color: #1e293b;
    }
    h1 {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <h1>Καλώς ήρθατε στον κόσμο της HTML!</h1>
  <p>Αυτή είναι η πρώτη μου ιστοσελίδα. Μπορείτε να τροποποιήσετε αυτό το κείμενο απευθείας!</p>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Η Πρώτη μου Ιστοσελίδα</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Καλώς ήρθατε στον κόσμο της HTML!</h1>
  <p>Αυτή είναι η πρώτη μου ιστοσελίδα. Μπορείτε να τροποποιήσετε αυτό το κείμενο απευθείας!</p>
</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  margin: 40px;
  line-height: 1.6;
  background-color: #f8fafc;
  color: #1e293b;
}

h1 {
  color: #2563eb;
}`
    }
  },
  {
    id: 'typography',
    title: '2. Μορφοποίηση Κειμένου & Ποίημα',
    category: 'Κείμενο',
    level: 'ΓΕΛ / ΕΠΑΛ',
    description: 'Εξάσκηση σε επικεφαλίδες, έντονη, πλάγια γραφή, μαρκάρισμα και αλλαγές γραμμής.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Μορφοποίηση Κειμένου</title>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 700px;
      margin: 40px auto;
      padding: 20px;
      background-color: #fffbeb;
      color: #451a03;
      border: 1px solid #fde68a;
      border-radius: 8px;
    }
    h1 {
      text-align: center;
      color: #b45309;
    }
    .poet {
      text-align: right;
      font-style: italic;
      color: #78350f;
    }
    mark {
      background-color: #fef08a;
      padding: 2px 5px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>Ιθάκη</h1>
  <p class="poet">Κ. Π. Καβάφης</p>
  <hr>
  <p>
    Σα βγεις στον πηγαιμό για την Ιθάκη,<br>
    να εύχεσαι να 'ναι <strong>μακρύς ο δρόμος</strong>,<br>
    γεμάτος <em>περιπέτειες</em>, γεμάτος <em>γνώσεις</em>.<br>
    Τους Λαιστρυγόνας και τους Κύκλωπας,<br>
    τον θυμωμένο Ποσειδώνα μη φοβάσαι...
  </p>
  <p>
    <mark>Πάντα στον νου σου να 'χεις την Ιθάκη.</mark><br>
    Το φθάσιμον εκεί είν' ο προορισμός σου.
  </p>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Μορφοποίηση Κειμένου</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Ιθάκη</h1>
  <p class="poet">Κ. Π. Καβάφης</p>
  <hr>
  <p>
    Σα βγεις στον πηγαιμό για την Ιθάκη,<br>
    να εύχεσαι να 'ναι <strong>μακρύς ο δρόμος</strong>,<br>
    γεμάτος <em>περιπέτειες</em>, γεμάτος <em>γνώσεις</em>.<br>
    Τους Λαιστρυγόνας και τους Κύκλωπας,<br>
    τον θυμωμένο Ποσειδώνα μη φοβάσαι...
  </p>
  <p>
    <mark>Πάντα στον νου σου να 'χεις την Ιθάκη.</mark><br>
    Το φθάσιμον εκεί είν' ο προορισμός σου.
  </p>
</body>
</html>`,
      css: `body {
  font-family: Georgia, serif;
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fffbeb;
  color: #451a03;
  border: 1px solid #fde68a;
  border-radius: 8px;
}

h1 {
  text-align: center;
  color: #b45309;
}

.poet {
  text-align: right;
  font-style: italic;
  color: #78350f;
}

mark {
  background-color: #fef08a;
  padding: 2px 5px;
  border-radius: 3px;
}`
    }
  },
  {
    id: 'links_lists',
    title: '3. Αγαπημένα Sites & Λίστες',
    category: 'Σύνδεσμοι & Λίστες',
    level: 'ΓΕΛ / ΕΠΑΛ',
    description: 'Συνδυασμός υπερσυνδέσμων, εικόνων και μη αριθμημένων / αριθμημένων λιστών.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Αγαπημένοι Ιστότοποι</title>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      margin: 30px;
      background-color: #f0fdf4;
      color: #166534;
    }
    ul, ol {
      background: white;
      padding: 20px 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    li {
      margin-bottom: 10px;
    }
    a {
      color: #15803d;
      text-decoration: none;
      font-weight: bold;
    }
    a:hover {
      text-decoration: underline;
    }
    .thumb {
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>Εκπαιδευτικοί Σύνδεσμοι & Πηγές</h1>
  
  <img class="thumb" src="https://picsum.photos/600/200" alt="Τεχνολογία και Μάθηση" width="100%">

  <h2>Χρήσιμοι Ιστότοποι (Λίστα με κουκκίδες)</h2>
  <ul>
    <li><a href="https://www.sch.gr" target="_blank">Πανελλήνιο Σχολικό Δίκτυο (ΠΣΔ)</a> - Επίσημη πύλη</li>
    <li><a href="https://minedu.gov.gr" target="_blank">Υπουργείο Παιδείας</a> - Ανακοινώσεις & Εγκύκλιοι</li>
    <li><a href="https://www.w3schools.com" target="_blank">W3Schools</a> - Οδηγοί HTML & CSS</li>
  </ul>

  <h2>Βήματα Μελέτης (Αριθμημένη λίστα)</h2>
  <ol>
    <li>Κατανόηση των ετικετών δομής</li>
    <li>Εξάσκηση σε πίνακες και φόρμες</li>
    <li>Εφαρμογή κανόνων CSS για όμορφη εμφάνιση</li>
  </ol>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Αγαπημένοι Ιστότοποι</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Εκπαιδευτικοί Σύνδεσμοι & Πηγές</h1>
  
  <img class="thumb" src="https://picsum.photos/600/200" alt="Τεχνολογία και Μάθηση" width="100%">

  <h2>Χρήσιμοι Ιστότοποι (Λίστα με κουκκίδες)</h2>
  <ul>
    <li><a href="https://www.sch.gr" target="_blank">Πανελλήνιο Σχολικό Δίκτυο (ΠΣΔ)</a> - Επίσημη πύλη</li>
    <li><a href="https://minedu.gov.gr" target="_blank">Υπουργείο Παιδείας</a> - Ανακοινώσεις & Εγκύκλιοι</li>
    <li><a href="https://www.w3schools.com" target="_blank">W3Schools</a> - Οδηγοί HTML & CSS</li>
  </ul>

  <h2>Βήματα Μελέτης (Αριθμημένη λίστα)</h2>
  <ol>
    <li>Κατανόηση των ετικετών δομής</li>
    <li>Εξάσκηση σε πίνακες και φόρμες</li>
    <li>Εφαρμογή κανόνων CSS για όμορφη εμφάνιση</li>
  </ol>
</body>
</html>`,
      css: `body {
  font-family: "Segoe UI", sans-serif;
  margin: 30px;
  background-color: #f0fdf4;
  color: #166534;
}

ul, ol {
  background: white;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

li {
  margin-bottom: 10px;
}

a {
  color: #15803d;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}

.thumb {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`
    }
  },
  {
    id: 'schedule_table',
    title: '4. Εβδομαδιαίο Σχολικό Πρόγραμμα',
    category: 'Πίνακες',
    level: 'ΓΕΛ / ΕΠΑΛ',
    description: 'Πίνακας με thead, tbody, th, td, στυλ κελιών και συγχώνευση (colspan).',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Ωρολόγιο Πρόγραμμα</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 40px;
      background-color: #f8fafc;
    }
    h2 {
      text-align: center;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 12px;
      text-align: center;
    }
    th {
      background-color: #3b82f6;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f1f5f9;
    }
    .break {
      background-color: #fef08a !important;
      font-weight: bold;
      color: #854d0e;
    }
  </style>
</head>
<body>
  <h2>Ωρολόγιο Πρόγραμμα - Τάξη Α1</h2>
  <table>
    <thead>
      <tr>
        <th>Ώρα</th>
        <th>Δευτέρα</th>
        <th>Τρίτη</th>
        <th>Τετάρτη</th>
        <th>Πέμπτη</th>
        <th>Παρασκευή</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1η (08:15)</td>
        <td>Μαθηματικά</td>
        <td>Αρχαία</td>
        <td>Χημεία</td>
        <td>Πληροφορική</td>
        <td>Φυσική</td>
      </tr>
      <tr>
        <td>2η (09:05)</td>
        <td>Άλγεβρα</td>
        <td>Ιστορία</td>
        <td>Βιολογία</td>
        <td>Πληροφορική</td>
        <td>Αγγλικά</td>
      </tr>
      <tr class="break">
        <td>Διάλειμμα</td>
        <td colspan="5">Πρώτο Μεγάλο Διάλειμμα (20 λεπτά)</td>
      </tr>
      <tr>
        <td>3η (10:05)</td>
        <td>Φυσική</td>
        <td>Νέα Ελληνικά</td>
        <td>Γεωμετρία</td>
        <td>Μαθηματικά</td>
        <td>Γυμναστική</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Ωρολόγιο Πρόγραμμα</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h2>Ωρολόγιο Πρόγραμμα - Τάξη Α1</h2>
  <table>
    <thead>
      <tr>
        <th>Ώρα</th>
        <th>Δευτέρα</th>
        <th>Τρίτη</th>
        <th>Τετάρτη</th>
        <th>Πέμπτη</th>
        <th>Παρασκευή</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1η (08:15)</td>
        <td>Μαθηματικά</td>
        <td>Αρχαία</td>
        <td>Χημεία</td>
        <td>Πληροφορική</td>
        <td>Φυσική</td>
      </tr>
      <tr>
        <td>2η (09:05)</td>
        <td>Άλγεβρα</td>
        <td>Ιστορία</td>
        <td>Βιολογία</td>
        <td>Πληροφορική</td>
        <td>Αγγλικά</td>
      </tr>
      <tr class="break">
        <td>Διάλειμμα</td>
        <td colspan="5">Πρώτο Μεγάλο Διάλειμμα (20 λεπτά)</td>
      </tr>
      <tr>
        <td>3η (10:05)</td>
        <td>Φυσική</td>
        <td>Νέα Ελληνικά</td>
        <td>Γεωμετρία</td>
        <td>Μαθηματικά</td>
        <td>Γυμναστική</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`,
      css: `body {
  font-family: sans-serif;
  margin: 40px;
  background-color: #f8fafc;
}

h2 {
  text-align: center;
  color: #0f172a;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  border: 1px solid #cbd5e1;
  padding: 12px;
  text-align: center;
}

th {
  background-color: #3b82f6;
  color: white;
}

tr:nth-child(even) {
  background-color: #f1f5f9;
}

.break {
  background-color: #fef08a !important;
  font-weight: bold;
  color: #854d0e;
}`
    }
  },
  {
    id: 'student_form',
    title: '5. Φόρμα Εγγραφής Μαθητή',
    category: 'Φόρμες',
    level: 'ΕΠΑΛ / ΓΕΛ',
    description: 'Φόρμα με ετικέτες label, input (text, email, radio, checkbox), select, textarea και submit.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Αίτηση Συμμετοχής σε Όμιλο</title>
  <style>
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      background-color: #f1f5f9;
      padding: 30px;
    }
    .form-card {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      padding: 25px 35px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    h2 {
      margin-top: 0;
      color: #1e3a8a;
      text-align: center;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #334155;
    }
    input[type="text"], input[type="email"], select, textarea {
      width: 100%;
      padding: 9px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-sizing: border-box;
      font-size: 14px;
    }
    .radio-group label {
      display: inline-block;
      margin-right: 15px;
      font-weight: normal;
    }
    button {
      width: 100%;
      background-color: #2563eb;
      color: white;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    button:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="form-card">
    <h2>Εγγραφή στον Μαθητικό Όμιλο Ρομποτικής</h2>
    <form action="#" method="post">
      <div class="form-group">
        <label for="fullname">Ονοματεπώνυμο:</label>
        <input type="text" id="fullname" name="fullname" placeholder="π.χ. Νίκος Παπαδόπουλος" required>
      </div>

      <div class="form-group">
        <label for="email">Ηλεκτρονικό Ταχυδρομείο (Email):</label>
        <input type="email" id="email" name="email" placeholder="student@sch.gr" required>
      </div>

      <div class="form-group">
        <label>Τάξη Φοίτησης:</label>
        <div class="radio-group">
          <label><input type="radio" name="grade" value="A" checked> Α' Λυκείου</label>
          <label><input type="radio" name="grade" value="B"> Β' Λυκείου</label>
          <label><input type="radio" name="grade" value="G"> Γ' Λυκείου</label>
        </div>
      </div>

      <div class="form-group">
        <label for="track">Ειδικότητα / Κατεύθυνση:</label>
        <select id="track" name="track">
          <option value="gel">Γενικό Λύκειο (ΓΕΛ)</option>
          <option value="epal-it">ΕΠΑΛ - Τομέας Πληροφορικής</option>
          <option value="epal-tech">ΕΠΑΛ - Ηλεκτρολογίας & Ηλεκτρονικής</option>
        </select>
      </div>

      <div class="form-group">
        <label for="comments">Γιατί θέλετε να συμμετάσχετε;</label>
        <textarea id="comments" name="comments" rows="3" placeholder="Λίγα λόγια για το ενδιαφέρον σας..."></textarea>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" name="agree" required> Συμφωνώ με τον κανονισμό λειτουργίας
        </label>
      </div>

      <button type="submit">Υποβολή Αίτησης</button>
    </form>
  </div>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Αίτηση Συμμετοχής σε Όμιλο</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="form-card">
    <h2>Εγγραφή στον Μαθητικό Όμιλο Ρομποτικής</h2>
    <form action="#" method="post">
      <div class="form-group">
        <label for="fullname">Ονοματεπώνυμο:</label>
        <input type="text" id="fullname" name="fullname" placeholder="π.χ. Νίκος Παπαδόπουλος" required>
      </div>

      <div class="form-group">
        <label for="email">Ηλεκτρονικό Ταχυδρομείο (Email):</label>
        <input type="email" id="email" name="email" placeholder="student@sch.gr" required>
      </div>

      <div class="form-group">
        <label>Τάξη Φοίτησης:</label>
        <div class="radio-group">
          <label><input type="radio" name="grade" value="A" checked> Α' Λυκείου</label>
          <label><input type="radio" name="grade" value="B"> Β' Λυκείου</label>
          <label><input type="radio" name="grade" value="G"> Γ' Λυκείου</label>
        </div>
      </div>

      <div class="form-group">
        <label for="track">Ειδικότητα / Κατεύθυνση:</label>
        <select id="track" name="track">
          <option value="gel">Γενικό Λύκειο (ΓΕΛ)</option>
          <option value="epal-it">ΕΠΑΛ - Τομέας Πληροφορικής</option>
          <option value="epal-tech">ΕΠΑΛ - Ηλεκτρολογίας & Ηλεκτρονικής</option>
        </select>
      </div>

      <div class="form-group">
        <label for="comments">Γιατί θέλετε να συμμετάσχετε;</label>
        <textarea id="comments" name="comments" rows="3" placeholder="Λίγα λόγια για το ενδιαφέρον σας..."></textarea>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" name="agree" required> Συμφωνώ με τον κανονισμό λειτουργίας
        </label>
      </div>

      <button type="submit">Υποβολή Αίτησης</button>
    </form>
  </div>
</body>
</html>`,
      css: `body {
  font-family: "Segoe UI", Tahoma, sans-serif;
  background-color: #f1f5f9;
  padding: 30px;
}

.form-card {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: 25px 35px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

h2 {
  margin-top: 0;
  color: #1e3a8a;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #334155;
}

input[type="text"], input[type="email"], select, textarea {
  width: 100%;
  padding: 9px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

.radio-group label {
  display: inline-block;
  margin-right: 15px;
  font-weight: normal;
}

button {
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

button:hover {
  background-color: #1d4ed8;
}`
    }
  },
  {
    id: 'flexbox_modern',
    title: '6. Μοντέρνα Σελίδα με Flexbox Layout',
    category: 'CSS Διάταξη',
    level: 'ΕΠΑΛ (Προχωρημένο)',
    description: 'Πλήρης δομή ιστοσελίδας: Header με Navbar, Flexbox Cards και Footer.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Μαθητικό Portal Τεχνολογίας</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    nav a {
      color: white;
      text-decoration: none;
      margin-left: 20px;
      font-weight: 500;
    }
    nav a:hover {
      text-decoration: underline;
    }
    .hero {
      text-align: center;
      padding: 40px 20px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }
    .hero h2 {
      font-size: 2rem;
      color: #0f172a;
      margin-bottom: 10px;
    }
    main {
      flex: 1;
      max-width: 1100px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .cards-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .card {
      background: white;
      flex: 1 1 300px;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      border-top: 4px solid #3b82f6;
    }
    .card h3 {
      color: #1e3a8a;
      margin-bottom: 10px;
    }
    footer {
      background-color: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 20px;
      margin-top: auto;
    }
  </style>
</head>
<body>
  <header>
    <h1>EduWeb Studio</h1>
    <nav>
      <a href="#">Αρχική</a>
      <a href="#">Μαθήματα</a>
      <a href="#">Εργαστήριο</a>
      <a href="#">Επικοινωνία</a>
    </nav>
  </header>

  <section class="hero">
    <h2>Καλώς ήρθατε στο Εργαστήριο Πληροφορικής!</h2>
    <p>Μαθαίνουμε σύγχρονη ανάπτυξη ιστοσελίδων με HTML5 και CSS3 Flexbox.</p>
  </section>

  <main>
    <div class="cards-container">
      <div class="card">
        <h3>HTML5 Σημασιολογία</h3>
        <p>Δομήστε τις σελίδες σας με σύγχρονες ετικέτες όπως header, nav, main, section και footer.</p>
      </div>

      <div class="card">
        <h3>CSS3 Flexbox</h3>
        <p>Δημιουργήστε ευέλικτες διατάξεις που προσαρμόζονται σε όλες τις οθόνες με ευκολία.</p>
      </div>

      <div class="card">
        <h3>Διαδραστικότητα</h3>
        <p>Προσθέστε φόρμες, συνδέσμους και κουμπιά με όμορφα εφέ αιώρησης (:hover).</p>
      </div>
    </div>
  </main>

  <footer>
    <p>&copy; 2026 Εργαστήριο Πληροφορικής - Τομέας Πληροφορικής ΕΠΑΛ & ΓΕΛ</p>
  </footer>
</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Μαθητικό Portal Τεχνολογίας</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>EduWeb Studio</h1>
    <nav>
      <a href="#">Αρχική</a>
      <a href="#">Μαθήματα</a>
      <a href="#">Εργαστήριο</a>
      <a href="#">Επικοινωνία</a>
    </nav>
  </header>

  <section class="hero">
    <h2>Καλώς ήρθατε στο Εργαστήριο Πληροφορικής!</h2>
    <p>Μαθαίνουμε σύγχρονη ανάπτυξη ιστοσελίδων με HTML5 και CSS3 Flexbox.</p>
  </section>

  <main>
    <div class="cards-container">
      <div class="card">
        <h3>HTML5 Σημασιολογία</h3>
        <p>Δομήστε τις σελίδες σας με σύγχρονες ετικέτες όπως header, nav, main, section και footer.</p>
      </div>

      <div class="card">
        <h3>CSS3 Flexbox</h3>
        <p>Δημιουργήστε ευέλικτες διατάξεις που προσαρμόζονται σε όλες τις οθόνες με ευκολία.</p>
      </div>

      <div class="card">
        <h3>Διαδραστικότητα</h3>
        <p>Προσθέστε φόρμες, συνδέσμους και κουμπιά με όμορφα εφέ αιώρησης (:hover).</p>
      </div>
    </div>
  </main>

  <footer>
    <p>&copy; 2026 Εργαστήριο Πληροφορικής - Τομέας Πληροφορικής ΕΠΑΛ & ΓΕΛ</p>
  </footer>
</body>
</html>`,
      css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
  color: #334155;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  font-weight: 500;
}

nav a:hover {
  text-decoration: underline;
}

.hero {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.hero h2 {
  font-size: 2rem;
  color: #0f172a;
  margin-bottom: 10px;
}

main {
  flex: 1;
  max-width: 1100px;
  margin: 30px auto;
  padding: 0 20px;
}

.cards-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  background: white;
  flex: 1 1 300px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  border-top: 4px solid #3b82f6;
}

.card h3 {
  color: #1e3a8a;
  margin-bottom: 10px;
}

footer {
  background-color: #0f172a;
  color: #94a3b8;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}`
    }
  },
  {
    id: 'js-counter',
    title: '7. Διαδραστικός Μετρητής (JavaScript)',
    category: 'JavaScript (ΕΠΑΛ)',
    level: 'ΕΠΑΛ (JavaScript)',
    requiresMode: 'advanced',
    description: 'Εισαγωγή στη JavaScript: Διαχείριση συμβάντων click, μεταβλητές και αλλαγή περιεχομένου με DOM.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Διαδραστικός Μετρητής</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px 20px;
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .card {
      background: white;
      max-width: 400px;
      margin: 0 auto;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .display {
      font-size: 54px;
      font-weight: bold;
      color: #2563eb;
      margin: 20px 0;
    }
    .btn-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    button:hover {
      background-color: #1d4ed8;
    }
    button.reset {
      background-color: #64748b;
    }
    button.reset:hover {
      background-color: #475569;
    }
  </style>
</head>
<body>

  <div class="card">
    <h2>⏱️ Μετρητής Κλικ</h2>
    <div id="counter-val" class="display">0</div>
    <div class="btn-group">
      <button onclick="decrement()">- 1</button>
      <button class="reset" onclick="reset()">Μηδενισμός</button>
      <button onclick="increment()">+ 1</button>
    </div>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('counter-val');

    function update() {
      display.textContent = count;
      if (count > 0) display.style.color = '#10b981';
      else if (count < 0) display.style.color = '#ef4444';
      else display.style.color = '#2563eb';
    }

    function increment() {
      count++;
      update();
    }

    function decrement() {
      count--;
      update();
    }

    function reset() {
      count = 0;
      update();
    }
  </script>

</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Διαδραστικός Μετρητής</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="card">
    <h2>⏱️ Μετρητής Κλικ</h2>
    <div id="counter-val" class="display">0</div>
    <div class="btn-group">
      <button id="btn-dec">- 1</button>
      <button id="btn-reset" class="reset">Μηδενισμός</button>
      <button id="btn-inc">+ 1</button>
    </div>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('counter-val');

    function update() {
      display.textContent = count;
      if (count > 0) display.style.color = '#10b981';
      else if (count < 0) display.style.color = '#ef4444';
      else display.style.color = '#2563eb';
    }

    document.getElementById('btn-inc').addEventListener('click', () => {
      count++;
      update();
    });

    document.getElementById('btn-dec').addEventListener('click', () => {
      count--;
      update();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      count = 0;
      update();
    });
  </script>

</body>
</html>`,
      css: `body {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 50px 20px;
  background-color: #f1f5f9;
  color: #0f172a;
}

.card {
  background: white;
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.display {
  font-size: 54px;
  font-weight: bold;
  color: #2563eb;
  margin: 20px 0;
}

.btn-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

button:hover {
  background-color: #1d4ed8;
}

button.reset {
  background-color: #64748b;
}

button.reset:hover {
  background-color: #475569;
}`
    }
  },
  {
    id: 'js-quiz',
    title: '8. Κουίζ Πολλαπλής Επιλογής (JavaScript)',
    category: 'JavaScript (ΕΠΑΛ)',
    level: 'ΕΠΑΛ (JavaScript)',
    requiresMode: 'advanced',
    description: 'Μαθητικό κουίζ με ερωτήσεις πληροφορικής, έλεγχο απάντησης και υπολογισμό τελικού βαθμού.',
    singleFile: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Μαθητικό Κουίζ Πληροφορικής</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 30px 15px;
    }
    .quiz-card {
      max-width: 550px;
      margin: 0 auto;
      background: #1e293b;
      padding: 30px;
      border-radius: 14px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.4);
      border: 1px solid #334155;
    }
    h2 { color: #38bdf8; margin-top: 0; }
    .question { margin-bottom: 20px; font-size: 17px; }
    .options button {
      display: block;
      width: 100%;
      text-align: left;
      background: #334155;
      color: white;
      border: 1px solid #475569;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .options button:hover {
      background: #2563eb;
      border-color: #3b82f6;
    }
    .result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      font-weight: bold;
      display: none;
    }
    .correct { background: #065f46; color: #34d399; }
    .wrong { background: #7f1d1d; color: #f87171; }
  </style>
</head>
<body>

  <div class="quiz-card">
    <h2>🎯 Κουίζ HTML & Web</h2>
    <p class="question"><strong>Ερώτηση:</strong> Ποια ετικέτα HTML χρησιμοποιείται για την εισαγωγή εικόνας;</p>
    
    <div class="options">
      <button onclick="checkAnswer(false)">A. &lt;picture&gt;</button>
      <button onclick="checkAnswer(true)">B. &lt;img&gt;</button>
      <button onclick="checkAnswer(false)">Γ. &lt;image&gt;</button>
      <button onclick="checkAnswer(false)">Δ. &lt;src&gt;</button>
    </div>

    <div id="result-box" class="result"></div>
  </div>

  <script>
    function checkAnswer(isCorrect) {
      const box = document.getElementById('result-box');
      box.style.display = 'block';
      if (isCorrect) {
        box.className = 'result correct';
        box.textContent = '🎉 Σωστά! Η ετικέτα <img> χρησιμοποιείται για εικόνες.';
      } else {
        box.className = 'result wrong';
        box.textContent = '❌ Λάθος απάντηση! Δοκιμάστε ξανά.';
      }
    }
  </script>

</body>
</html>`,
    multiFile: {
      html: `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Μαθητικό Κουίζ Πληροφορικής</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="quiz-card">
    <h2>🎯 Κουίζ HTML & Web</h2>
    <p class="question"><strong>Ερώτηση:</strong> Ποια ετικέτα HTML χρησιμοποιείται για την εισαγωγή εικόνας;</p>
    
    <div class="options">
      <button onclick="checkAnswer(false)">A. &lt;picture&gt;</button>
      <button onclick="checkAnswer(true)">B. &lt;img&gt;</button>
      <button onclick="checkAnswer(false)">Γ. &lt;image&gt;</button>
      <button onclick="checkAnswer(false)">Δ. &lt;src&gt;</button>
    </div>

    <div id="result-box" class="result"></div>
  </div>

  <script>
    function checkAnswer(isCorrect) {
      const box = document.getElementById('result-box');
      box.style.display = 'block';
      if (isCorrect) {
        box.className = 'result correct';
        box.textContent = '🎉 Σωστά! Η ετικέτα <img> χρησιμοποιείται για εικόνες.';
      } else {
        box.className = 'result wrong';
        box.textContent = '❌ Λάθος απάντηση! Δοκιμάστε ξανά.';
      }
    }
  </script>

</body>
</html>`,
      css: `body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 30px 15px;
}

.quiz-card {
  max-width: 550px;
  margin: 0 auto;
  background: #1e293b;
  padding: 30px;
  border-radius: 14px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  border: 1px solid #334155;
}

h2 {
  color: #38bdf8;
  margin-top: 0;
}

.question {
  margin-bottom: 20px;
  font-size: 17px;
}

.options button {
  display: block;
  width: 100%;
  text-align: left;
  background: #334155;
  color: white;
  border: 1px solid #475569;
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.options button:hover {
  background: #2563eb;
  border-color: #3b82f6;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  display: none;
}

.correct {
  background: #065f46;
  color: #34d399;
}

.wrong {
  background: #7f1d1d;
  color: #f87171;
}`
    }
  }
];
