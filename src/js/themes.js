'use strict';
/**
 * Θέματα εμφάνισης και χρώμα κεφαλίδας (ίδια λειτουργία με το myGlossa).
 *
 * Τα «light» και «dark» είναι τα προεπιλεγμένα της εφαρμογής. Τα υπόλοιπα έχουν την εμφάνιση του Android Studio /
 * IntelliJ: Dark, Darcula, Islands Darcula και τα φωτεινά τους αντίστοιχα (Light, IntelliJ Light, Islands Light).
 *
 * Εδώ βρίσκονται τα στοιχεία κάθε θέματος που χρειάζονται το κύριο πρόγραμμα και το μενού, καθώς και ο υπολογισμός
 * των χρωμάτων της κεφαλίδας (γραμμή τίτλου + μενού + εργαλεία). Τα χρώματα του περιβάλλοντος και του editor είναι
 * μεταβλητές CSS στο css/style.css, στα blocks `body.theme-<id>`.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Themes = api;
})(typeof self !== 'undefined' ? self : this, function () {
  /**
   * id: ό,τι αποθηκεύεται στις ρυθμίσεις (settings.theme)
   * dark: σκοτεινό (παίρνει και την κλάση theme-dark, αλλιώς theme-light)
   * islands: «νησίδες» (στρογγυλεμένα πάνελ με κενά ανάμεσά τους)
   * pair: το θέμα στο οποίο γυρνά το κουμπί «φωτεινό/σκοτεινό»
   * window: χρώμα του παραθύρου πριν φορτώσει η σελίδα
   */
  const LIST = [
    { id: 'light', label: 'Φωτεινό', group: 'default', dark: false, pair: 'dark', window: '#ffffff' },
    { id: 'dark', label: 'Σκοτεινό', group: 'default', dark: true, pair: 'light', window: '#1e1f22' },

    { id: 'jb-dark', label: 'Dark', group: 'dark', dark: true, pair: 'jb-light', window: '#1e1f22' },
    { id: 'jb-darcula', label: 'Darcula', group: 'dark', dark: true, pair: 'jb-intellij-light', window: '#2b2b2b' },
    { id: 'jb-islands-darcula', label: 'Islands Darcula', group: 'dark', dark: true, islands: true, pair: 'jb-islands-light', window: '#17181b' },

    { id: 'jb-light', label: 'Light', group: 'light', dark: false, pair: 'jb-dark', window: '#ffffff' },
    { id: 'jb-intellij-light', label: 'IntelliJ Light', group: 'light', dark: false, pair: 'jb-darcula', window: '#ffffff' },
    { id: 'jb-islands-light', label: 'Islands Light', group: 'light', dark: false, islands: true, pair: 'jb-islands-darcula', window: '#e3e5ea' },
  ];

  const GROUPS = { default: 'Προεπιλεγμένα', dark: 'Σκοτεινά (τύπου Android Studio)', light: 'Φωτεινά (τύπου Android Studio)' };

  const DEFAULT_ID = 'dark';

  /**
   * Το id ενός θέματος που υπάρχει. Οι ρυθμίσεις των εκδόσεων έως την 1.5.1 είχαν άλλα ονόματα
   * (dark-charcoal, light-gray…): όσα ξεκινούν από «light» γίνονται το φωτεινό, τα υπόλοιπα το σκοτεινό.
   */
  function normalize(id) {
    if (LIST.some((t) => t.id === id)) return id;
    if (typeof id === 'string' && id.startsWith('light')) return 'light';
    return DEFAULT_ID;
  }

  /** Το θέμα με αυτό το id· για άγνωστο id (π.χ. παλιά ρύθμιση) το προεπιλεγμένο. */
  function get(id) {
    const nid = normalize(id);
    return LIST.find((t) => t.id === nid);
  }

  /** Οι κλάσεις του <body>: theme-dark|theme-light (βάση), theme-<id> (χρώματα) και theme-islands. */
  function bodyClasses(id) {
    const t = get(id);
    return [t.dark ? 'theme-dark' : 'theme-light', `theme-${t.id}`, ...(t.islands ? ['theme-islands'] : [])];
  }

  /** Βάζει το θέμα στο <body> χωρίς να πειράξει τις άλλες κλάσεις του. */
  function applyToBody(body, id) {
    for (const c of Array.from(body.classList)) if (c.startsWith('theme-')) body.classList.remove(c);
    body.classList.add(...bodyClasses(id));
  }

  // ------------------------------------------------------------ χρώμα γραμμής τίτλου, καρτελών μενού και εργαλείων
  /**
   * Χρώματα για την κεφαλίδα (στυλ Android Studio): η γραμμή τίτλου, οι καρτέλες και τα εργαλεία έχουν ένα χρώμα φόντου.
   * 'theme' = ίδιο με το θέμα (προεπιλογή)· 'custom' = ό,τι διαλέξει ο χρήστης (settings.headerColor = '#rrggbb').
   */
  const HEADER_COLORS = [
    { id: 'theme', label: 'Ίδιο με το θέμα' },
    { id: 'graphite', label: 'Γραφίτης (Android Studio)', color: '#3c3f41' },
    { id: 'charcoal', label: 'Σκούρο γκρι', color: '#2b2d30' },
    { id: 'black', label: 'Μαύρο', color: '#16171a' },
    { id: 'navy', label: 'Μπλε ναυτικό', color: '#1f3a5f' },
    { id: 'blue', label: 'Μπλε', color: '#2f5fa8' },
    { id: 'indigo', label: 'Λουλακί', color: '#3f3f8f' },
    { id: 'purple', label: 'Μωβ', color: '#5b3a8c' },
    { id: 'teal', label: 'Τιρκουάζ', color: '#0f6b66' },
    { id: 'green', label: 'Πράσινο', color: '#2e6b3f' },
    { id: 'red', label: 'Κόκκινο', color: '#8a2b2b' },
    { id: 'orange', label: 'Πορτοκαλί', color: '#b3541e' },
    { id: 'silver', label: 'Ασημί', color: '#dfe1e5' },
    { id: 'white', label: 'Λευκό', color: '#ffffff' },
    { id: 'custom', label: 'Άλλο χρώμα…' },
  ];

  const HEX = /^#[0-9a-f]{6}$/i;

  /** Το χρώμα (#rrggbb) που αντιστοιχεί σε μια τιμή της ρύθμισης headerColor, ή null για «ίδιο με το θέμα». */
  function headerColorOf(value) {
    if (typeof value === 'string' && HEX.test(value)) return value.toLowerCase();
    const preset = HEADER_COLORS.find((c) => c.id === value);
    return preset && preset.color ? preset.color : null;
  }

  /** Φωτεινότητα (WCAG) ενός χρώματος #rrggbb, από 0 (μαύρο) έως 1 (λευκό). */
  function luminance(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /** Λόγος αντίθεσης (WCAG) δύο χρωμάτων #rrggbb, από 1 έως 21. */
  function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  /** Ανάμειξη δύο χρωμάτων #rrggbb: t = 0 → a, t = 1 → b. */
  function mix(a, b, t) {
    const ch = (i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t);
    return '#' + [1, 3, 5].map((i) => ch(i).toString(16).padStart(2, '0')).join('');
  }

  /** Κατευθύνσεις της διαβάθμισης (gradient): από το πρώτο προς το δεύτερο χρώμα. */
  const HEADER_DIRECTIONS = [
    { id: 'right', label: 'Αριστερά → δεξιά', css: '90deg' },
    { id: 'left', label: 'Δεξιά → αριστερά', css: '270deg' },
    { id: 'down', label: 'Πάνω → κάτω', css: '180deg' },
    { id: 'diag', label: 'Διαγώνια', css: '115deg' },
  ];
  const dirOf = (id) => HEADER_DIRECTIONS.find((d) => d.id === id) || HEADER_DIRECTIONS[0];

  /** Η διαβάθμιση ως τιμή CSS για το φόντο της κεφαλίδας. */
  function headerImage(c1, c2, dir) {
    return `linear-gradient(${dirOf(dir).css}, ${c1}, ${c2})`;
  }

  /**
   * Το χρώμα της διαβάθμισης στη δεξιά άκρη της γραμμής τίτλου. Τα κουμπιά του παραθύρου (ελαχιστοποίηση, κλείσιμο…)
   * τα σχεδιάζει το σύστημα σε ΕΝΑ χρώμα, οπότε παίρνουν το χρώμα που έχει εκεί η διαβάθμιση, για να μη φαίνονται «κομμένα».
   */
  function headerEdgeColor(c1, c2, dir) {
    if (dir === 'right') return c2;
    if (dir === 'left' || dir === 'down') return c1;
    return mix(c1, c2, 0.45); // διαγώνια: άνω δεξιά γωνία
  }

  /** Τα υπόλοιπα χρώματα της κεφαλίδας (hover, διαχωριστικά, έμφαση) για ανοιχτά ή σκούρα γράμματα. */
  function headerPalette(lightText) {
    return {
      muted: lightText ? 'rgba(242, 243, 245, 0.7)' : 'rgba(27, 28, 31, 0.68)',
      hover: lightText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.09)',
      active: lightText ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.17)',
      sep: lightText ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)',
      onAccent: lightText ? '#1b1c1f' : '#ffffff',
      dark: lightText,
    };
  }

  const MIN_CONTRAST = 4.5;

  /**
   * Τα χρώματα της κεφαλίδας για φόντο `bg` (#rrggbb), ή για διαβάθμιση από `bg` σε `bg2`. Επιστρέφει τιμές για τις
   * μεταβλητές CSS --hdr-*.
   *
   * Ένα χρώμα: ανοιχτά γράμματα σε σκούρο φόντο, σκούρα σε ανοιχτό, όποιο δίνει τη μεγαλύτερη αντίθεση.
   *
   * Διαβάθμιση: τα ίδια γράμματα πρέπει να διαβάζονται και στις δύο άκρες. Αν τα δύο χρώματα διαφέρουν πολύ σε
   * φωτεινότητα (π.χ. σκούρο γκρι → ασημί), κανένα χρώμα γραμμάτων δεν ταιριάζει και στα δύο· τότε η άκρη που δεν
   * διαβάζεται μαλακώνει όσο χρειάζεται (το λιγότερο δυνατό). Το bg και το bg2 που επιστρέφονται είναι τα χρώματα που
   * πρέπει να ζωγραφιστούν.
   */
  function headerStyle(bg, bg2) {
    if (!bg2) {
      // Απαλά γράμματα (όπως στο Android Studio)· σε μεσαία έντονα χρώματα δεν αρκούν, και τότε καθαρό λευκό ή μαύρο
      // (το καλύτερο από τα δύο δίνει πάντα αντίθεση τουλάχιστον 4.58)
      let LIGHT = '#f2f3f5';
      let DARK = '#1b1c1f';
      if (Math.max(contrast(bg, LIGHT), contrast(bg, DARK)) < MIN_CONTRAST) {
        LIGHT = '#ffffff';
        DARK = '#000000';
      }
      const lightText = contrast(bg, LIGHT) >= contrast(bg, DARK);
      return { bg, bg2: null, menu: bg, fg: lightText ? LIGHT : DARK, ...headerPalette(lightText) };
    }
    const candidates = [
      { fg: '#f2f3f5', light: true, toward: '#000000' },
      { fg: '#1b1c1f', light: false, toward: '#ffffff' },
      { fg: '#ffffff', light: true, toward: '#000000' },
      { fg: '#000000', light: false, toward: '#ffffff' },
    ];
    // Για κάθε επιλογή γραμμάτων: πόσο πρέπει να μαλακώσει κάθε άκρη (t = 0: καθόλου) ώστε να διαβάζεται
    const fit = (color, cand) => {
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const c = mix(color, cand.toward, Math.min(t, 1));
        if (contrast(c, cand.fg) >= MIN_CONTRAST) return { color: t === 0 ? color : c, t };
      }
      return { color: cand.toward, t: 1 };
    };
    let best = null;
    for (const cand of candidates) {
      const a = fit(bg, cand);
      const b = fit(bg2, cand);
      const cost = a.t + b.t;
      if (!best || cost < best.cost - 1e-9) best = { cand, a, b, cost };
    }
    const { cand, a, b } = best;
    return {
      bg: a.color,
      bg2: b.color,
      menu: mix(a.color, b.color, 0.5), // φόντο των λιστών επιλογής
      fg: cand.fg,
      ...headerPalette(cand.light),
    };
  }

  return {
    LIST, GROUPS, DEFAULT_ID, normalize, get, bodyClasses, applyToBody,
    HEADER_COLORS, HEADER_DIRECTIONS, headerColorOf, headerStyle, headerImage, headerEdgeColor, luminance, contrast, mix,
  };
});
