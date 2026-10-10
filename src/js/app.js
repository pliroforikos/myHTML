// EduHTML Studio - Κύριος κώδικας εφαρμογής

let currentMode = 'beginner'; // 'beginner' (ενιαίο) ή 'advanced' (multi-tab)
let activeTab = 'html'; // 'html' ή 'css'
let editor = null;
let htmlDoc = null;
let cssDoc = null;
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
  hideBeginnerControls: false
};

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
  try { setupEventListeners(); } catch (e) { console.error('Listeners init:', e); }
  try { setupElectronMenuBridge(); } catch (e) { console.error('Menu bridge:', e); }
  try { initAppVersion(); } catch (e) { console.error('Version init:', e); }
  try { updateLivePreview(); } catch (e) { console.error('Preview update:', e); }
  try { validateHtmlCode(); } catch (e) { console.error('Validation:', e); }
});

// Δυναμική φόρτωση και ενημέρωση της έκδοσης (status bar & about modal)
async function initAppVersion() {
  let appVersion = '1.3.1';
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

  htmlDoc = CodeMirror.Doc(defaultBeginnerCode, 'htmlmixed');
  cssDoc = CodeMirror.Doc(defaultAdvancedCSS, 'css');

  editor = CodeMirror.fromTextArea(editorTextarea, {
    lineNumbers: true,
    theme: 'dracula',
    autoCloseTags: true,
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

function onCodeChanged() {
  const saveEl = document.getElementById('status-save');
  if (saveEl) saveEl.textContent = '● Μη αποθηκευμένο';
  
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
  const tabsBar = document.getElementById('tabs-group');
  const tabCss = document.getElementById('tab-css');

  if (mode === 'beginner') {
    currentMode = 'beginner';
    btnBeginner.classList.add('active');
    btnAdvanced.classList.remove('active');
    tabCss.style.display = 'none';
    switchTab('html');
    showToast('Λειτουργία «Αρχάριος»: Ενιαίο αρχείο HTML με εσωτερικό CSS');
  } else {
    currentMode = 'advanced';
    btnAdvanced.classList.add('active');
    btnBeginner.classList.remove('active');
    tabCss.style.display = 'flex';
    showToast('Λειτουργία «Προχωρημένος»: Ξεχωριστά Tabs HTML και CSS');
  }

  applyModeVisibility();
  renderGuideCategories();
  filterGuideItems(document.getElementById('guide-search-input') ? document.getElementById('guide-search-input').value.trim().toLowerCase() : '');
  initTemplatesModal();
  updateLivePreview();
  validateHtmlCode();
}

// Εναλλαγή καρτελών (Tabs)
function switchTab(tab) {
  if (activeTab === tab) return;

  activeTab = tab;
  const tabHtml = document.getElementById('tab-html');
  const tabCss = document.getElementById('tab-css');

  if (tab === 'html') {
    tabHtml.classList.add('active');
    tabCss.classList.remove('active');
    editor.swapDoc(htmlDoc);
  } else {
    tabCss.classList.add('active');
    tabHtml.classList.remove('active');
    editor.swapDoc(cssDoc);
  }

  editor.focus();
  updateCursorInfo();
}

// Σύνθεση τελικού κώδικα HTML για προεπισκόπηση και εξωτερικό browser
function getCompiledHTML() {
  const htmlContent = htmlDoc.getValue();

  if (currentMode === 'beginner') {
    return htmlContent;
  } else {
    // Στη λειτουργία προχωρημένου, ενσωματώνουμε το CSS στο <head> αν υπάρχει
    const cssContent = cssDoc.getValue();
    const styleTag = `<style>\n${cssContent}\n</style>`;

    if (htmlContent.includes('</head>')) {
      return htmlContent.replace('</head>', `${styleTag}\n</head>`);
    } else {
      return `${styleTag}\n${htmlContent}`;
    }
  }
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
    
    previewFrame.srcdoc = compiled;
  } catch (err) {
    console.warn('Update preview error:', err);
  }
}

// Άνοιγμα στον Επιλεγμένο Browser / Άνοιγμα URL
async function openInExternalBrowser(options = {}) {
  const compiled = getCompiledHTML();
  const browser = (options && options.browser) ? options.browser : (appSettings.browser || 'msedge');
  const isUrl = !!(options && options.isUrl && options.url);
  const targetUrl = isUrl ? options.url : '';

  const payload = {
    content: compiled,
    browser: browser,
    isUrl: isUrl,
    url: targetUrl
  };

  const browserLabel = getBrowserName(browser);

  if (window.electronAPI && window.electronAPI.openInExternalBrowser) {
    const res = await window.electronAPI.openInExternalBrowser(payload);
    if (res.success) {
      if (isUrl) {
        showToast(`Άνοιγμα του ${targetUrl} στον ${browserLabel}...`);
      } else {
        showToast(`Η σελίδα άνοιξε επιτυχώς στον ${browserLabel}!`);
      }
    } else {
      showToast('Σφάλμα κατά το άνοιγμα του browser: ' + res.error);
    }
  } else {
    // Fallback για browser περιβάλλον
    const target = isUrl ? targetUrl : URL.createObjectURL(new Blob([compiled], { type: 'text/html' }));
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
      </div>
    `;

    const insertBtn = card.querySelector('.btn-insert');
    insertBtn.onclick = () => {
      insertCodeToEditor(item.insertCode, item.target);
    };

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
function validateHtmlCode() {
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

    // Εμφάνιση αποτελέσματος
    if (warnings.length === 0) {
      statusEl.innerHTML = '<span class="status-ok">🟢 Όλα εντάξει!</span>';
      statusEl.title = 'Δεν εντοπίστηκαν συντακτικά σφάλματα στον κώδικα.';
      tipEl.textContent = 'Ο κώδικάς σας είναι καθαρός και έτοιμος.';
      tipEl.title = 'Ο κώδικάς σας είναι καθαρός και έτοιμος.';
    } else {
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
async function exportZip() {
  if (typeof JSZip === 'undefined') {
    showToast('Η βιβλιοθήκη JSZip δεν είναι διαθέσιμη.');
    return;
  }

  const zip = new JSZip();

  if (currentMode === 'beginner') {
    zip.file('index.html', htmlDoc.getValue());
  } else {
    zip.file('index.html', htmlDoc.getValue());
    zip.file('style.css', cssDoc.getValue());
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = 'Mathitiki-Ergasia.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Το αρχείο ZIP δημιουργήθηκε και ξεκίνησε η λήψη!');
}

// Αποθήκευση αρχείου
async function saveCurrentFile() {
  const content = (activeTab === 'html') ? htmlDoc.getValue() : cssDoc.getValue();
  const defaultExt = (activeTab === 'html') ? 'html' : 'css';
  const defaultName = (activeTab === 'html') ? 'index.html' : 'style.css';

  if (window.electronAPI && window.electronAPI.saveFile) {
    const res = await window.electronAPI.saveFile({
      defaultPath: defaultName,
      content: content,
      filters: [{ name: `${defaultExt.toUpperCase()} File`, extensions: [defaultExt] }]
    });

    if (res.success) {
      document.getElementById('status-save').textContent = '✔ Αποθηκευμένο';
      showToast(`Το αρχείο ${defaultName} αποθηκεύτηκε επιτυχώς!`);
    }
  } else {
    // Browser download fallback
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    document.getElementById('status-save').textContent = '✔ Αποθηκευμένο';
    showToast(`Το αρχείο ${defaultName} λήφθηκε επιτυχώς!`);
  }
}

// Άνοιγμα αρχείου
async function openFile() {
  if (window.electronAPI && window.electronAPI.openFile) {
    const res = await window.electronAPI.openFile();
    if (res) {
      if (res.filePath.endsWith('.css')) {
        if (currentMode === 'beginner') setMode('advanced');
        cssDoc.setValue(res.content);
        switchTab('css');
      } else {
        htmlDoc.setValue(res.content);
        switchTab('html');
      }
      updateLivePreview();
      validateHtmlCode();
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
          if (file.name.endsWith('.css')) {
            if (currentMode === 'beginner') setMode('advanced');
            cssDoc.setValue(evt.target.result);
            switchTab('css');
          } else {
            htmlDoc.setValue(evt.target.result);
            switchTab('html');
          }
          updateLivePreview();
          validateHtmlCode();
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
  if (confirm('Θέλετε να ξεκινήσετε ένα νέο κενό έγγραφο;')) {
    htmlDoc.setValue(cleanNewSkeleton);
    if (currentMode === 'advanced') {
      cssDoc.setValue('/* style.css */\n');
    }
    updateLivePreview();
    validateHtmlCode();
    showToast('Δημιουργήθηκε νέο κενό έγγραφο.');
  }
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

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'dark';
  const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  
  if (editor) {
    editor.setOption('theme', newTheme === 'dark' ? 'dracula' : 'eclipse');
    editor.refresh();
  }

  if (window.electronAPI && window.electronAPI.setTheme) {
    window.electronAPI.setTheme(newTheme);
  }

  showToast(`Ενεργοποιήθηκε ${newTheme === 'light' ? 'φωτεινό' : 'σκοτεινό'} θέμα`);
}

// --- ΔΙΑΧΕΙΡΙΣΗ ΡΥΘΜΙΣΕΩΝ (SETTINGS) ---
async function initSettings() {
  if (window.electronAPI && window.electronAPI.getSettings) {
    try {
      const fetched = await window.electronAPI.getSettings();
      if (fetched) appSettings = { ...appSettings, ...fetched };
    } catch (err) {
      console.error('Σφάλμα φόρτωσης ρυθμίσεων:', err);
    }
  }
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

function applyModeVisibility() {
  const modeSelector = document.querySelector('.mode-selector');
  const btnTemplates = document.getElementById('btn-templates');
  if (currentMode === 'beginner' && appSettings.hideBeginnerControls) {
    if (modeSelector) modeSelector.style.display = 'none';
    if (btnTemplates) btnTemplates.style.display = 'none';
  } else {
    if (modeSelector) modeSelector.style.display = 'flex';
    if (btnTemplates) btnTemplates.style.display = 'inline-flex';
  }
}

function populateSettingsUI() {
  const browserSelect = document.getElementById('setting-browser-select');
  const folderInput = document.getElementById('setting-folder-input');
  const hideCheckbox = document.getElementById('setting-hide-beginner-controls');

  if (browserSelect) browserSelect.value = appSettings.browser || 'msedge';
  if (folderInput) folderInput.value = appSettings.saveDirectory || '';
  if (hideCheckbox) hideCheckbox.checked = !!appSettings.hideBeginnerControls;
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
  const browser = document.getElementById('setting-browser-select').value;
  const folder = document.getElementById('setting-folder-input').value;
  const hideControls = document.getElementById('setting-hide-beginner-controls').checked;

  appSettings.browser = browser;
  appSettings.saveDirectory = folder;
  appSettings.hideBeginnerControls = hideControls;

  if (window.electronAPI && window.electronAPI.saveSettings) {
    await window.electronAPI.saveSettings(appSettings);
  }

  updateBrowserButton();
  applyModeVisibility();
  closeModal('settings-modal');
  showToast('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
}

// Ρύθμιση Resizing & Event Listeners
function setupEventListeners() {
  // Mode selection buttons
  document.getElementById('btn-mode-beginner').onclick = () => setMode('beginner');
  document.getElementById('btn-mode-advanced').onclick = () => setMode('advanced');

  // Tabs
  document.getElementById('tab-html').onclick = () => switchTab('html');
  document.getElementById('tab-css').onclick = () => switchTab('css');

  // Toolbar actions
  document.getElementById('btn-new').onclick = createNewFile;
  document.getElementById('btn-open').onclick = openFile;
  document.getElementById('btn-save').onclick = saveCurrentFile;
  document.getElementById('btn-export-zip').onclick = exportZip;
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

  // Settings modal buttons
  const btnBrowse = document.getElementById('btn-browse-folder');
  if (btnBrowse) btnBrowse.onclick = browseFolder;
  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) btnSaveSettings.onclick = saveCurrentSettings;

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
        saveCurrentFile();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        openInExternalBrowser();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggleGuidePanel();
      }
    } else if (e.key === 'F5') {
      e.preventDefault();
      updateLivePreview();
    }
  });

  // Modal Closers
  document.querySelectorAll('.modal-close').forEach(btn => {
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

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
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
  window.electronAPI.onMenuSave(() => saveCurrentFile());
  window.electronAPI.onMenuSaveAs(() => saveCurrentFile());
  window.electronAPI.onMenuExportZip(() => exportZip());
  window.electronAPI.onMenuRefreshPreview(() => updateLivePreview());
  window.electronAPI.onMenuOpenEdge(() => openInExternalBrowser());
  window.electronAPI.onMenuToggleGuide(() => toggleGuidePanel());
  window.electronAPI.onMenuToggleMode(() => setMode(currentMode === 'beginner' ? 'advanced' : 'beginner'));
  window.electronAPI.onMenuFormatCode(() => formatCode());
  window.electronAPI.onMenuAbout(() => openModal('about-modal'));
}
