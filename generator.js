/* =============================================================
   Mobile Newsletter Generator — UI logic
   Form state, image/GIF upload, repeatable lists, live preview.
   Vanilla JS, no framework. Mirrors the security-newsletter generator.
   ============================================================= */

(function () {
  'use strict';

  // Default images ship as data URLs (email clients can't load relative paths).
  const A = (typeof window !== 'undefined' && window.NEWSLETTER_ASSETS) || {};

  const DEFAULT_STATE = {
    accent: '#15181f',
    glass: true,

    issueLabel: '',
    logo: A.logoMasthead || 'assets/orangehrm-logo-masthead.png',
    logoWidth: 150,
    footerLogo: A.logoWhite || 'assets/orangehrm-logo-white.png',
    preheader: 'OrangeHRM Mobile gets smarter \u2014 Citra AI, faster approvals, and broader device support.',

    headlinePre: 'OrangeHRM Advanced Mobile App Version',
    headlineHL: '6.8',
    headlinePost: '',
    dek: '',

    heroImage: A.hero || 'assets/hero-security.png',
    heroAlt: 'OrangeHRM Mobile app on a phone',

    introLead: '',
    introBody: '',

    showFeatures: true,
    featuresTitle: 'New Features',
    featuresColor: '#15181f',
    features: [
      { badge: '01', tone: 'accent', title: 'Citra AI on mobile.', body: 'Every access decision now hinges on verifying who \u2014 or what \u2014 is connecting, not where they sit on the network.', version: 'version 8.0' },
      { badge: '02', tone: 'accent', title: 'Faster approvals.', body: 'Approve leave and timesheets in a tap, with push notifications that keep work moving even when you\u2019re away from your desk.', version: '' },
      { badge: '03', tone: 'accent', title: 'Redesigned dashboard.', body: 'A cleaner home screen surfaces what needs your attention first, with quick actions one tap away.', version: '' }
    ],

    showImprovements: true,
    improvementsTitle: 'Improvements',
    improvementsColor: '#15181f',
    improvements: [
      { badge: '01', tone: 'accent', title: 'Faster background sync.', body: 'Up to 40% quicker on large workforces, with fewer retries on flaky connections.' },
      { badge: '02', tone: 'accent', title: 'Accessibility polish.', body: 'Improved screen-reader labels and larger tap targets throughout the app.' }
    ],

    showCompat: true,
    compatTitle: 'Compatibility & Hosting',
    compatColor: '#15181f',
    compatVersionsTitle: 'Compatibility',
    compatVersions: 'Compatible with version 8.0',
    showAppButtons: true,
    appButtonsTitle: 'Download the app',
    assetBaseUrl: '',
    iosLabel: 'App Store',
    iosUrl: 'https://apps.apple.com/',
    androidLabel: 'Google Play',
    androidUrl: 'https://play.google.com/store/apps',
    hostingTitle: 'Hosting environment',
    hosting: [
      { label: 'URL', value: 'https://7191-tag-kord.orangehrm.com/', link: 'https://7191-tag-kord.orangehrm.com/' },
      { label: 'Admin Account', value: 'UN: admin  |  PW: BestSystemEver100%', link: '' },
      { label: 'Sysadmin Account', value: 'UN: _ohrmSysAdmin_  |  PW: >+$8YuqH3;W~&Nmw', link: '' },
      { label: 'Other users', value: 'PW: user@OHRM123', link: '' }
    ],

    showCta: false,
    ctaLabel: 'Download the latest version',
    ctaUrl: 'REPLACE_WITH_APP_URL',
    ctaMeta: 'Available on iOS & Android',

    showHighlights: true,
    highlightsTitle: 'Highlights',
    highlightsGif: '',
    highlightsUrl: '',
    highlightsAlt: 'Release highlights animation',
    highlightsCaption: 'A quick look at what\u2019s new in this release.',

    byName: 'The OrangeHRM Mobile Team',
    byRole: 'Product & Mobile',
    byInitials: 'M',

    footerNote: 'You\u2019re receiving this because you\u2019re part of the OrangeHRM team.\nOrangeHRM Inc. \u00b7 2570 N. First Street, Suite 200, San Jose, CA 95131',
    copyright: '\u00a9 2026 OrangeHRM, Inc. All rights reserved.'
  };

  const LS_KEY = 'mobile-newsletter-generator:v1';

  // Swap any legacy relative asset paths for the bundled data URLs so the
  // preview (and any restored session) always shows real images.
  function normalizeAssets(s) {
    const map = {
      'assets/hero-security.png': A.hero,
      'assets/orangehrm-logo-masthead.png': A.logoMasthead,
      'assets/orangehrm-logo-white.png': A.logoWhite
    };
    ['logo', 'heroImage', 'footerLogo'].forEach((k) => { if (map[s[k]]) s[k] = map[s[k]]; });
    return s;
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return normalizeAssets(JSON.parse(JSON.stringify(DEFAULT_STATE)));
      return normalizeAssets(Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), JSON.parse(raw)));
    } catch (e) {
      return normalizeAssets(JSON.parse(JSON.stringify(DEFAULT_STATE)));
    }
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  let state = loadState();

  // ---------- Preview render ----------
  const previewFrame = document.getElementById('preview-frame');
  const sizeMeter = document.getElementById('size-meter');
  let renderPending = false;

  function updateSizeMeter(html) {
    if (!sizeMeter) return;
    const kb = new Blob([html]).size / 1024;
    sizeMeter.querySelector('.size-meter-value').textContent = (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + ' KB';
    sizeMeter.classList.remove('size-ok', 'size-warn', 'size-bad');
    if (kb < 70) sizeMeter.classList.add('size-ok');
    else if (kb < 95) sizeMeter.classList.add('size-warn');
    else sizeMeter.classList.add('size-bad');
    sizeMeter.title = 'Approximate email size: ' + kb.toFixed(1) + ' KB.\n' +
      (kb >= 95 ? '\u26a0 Over Gmail\u2019s 102 KB clip limit \u2014 host the GIF / hero externally instead of embedding.'
        : kb >= 70 ? 'Approaching Gmail\u2019s 102 KB limit.'
        : 'Well under Gmail\u2019s 102 KB clip limit.');
  }

  function scheduleRender() {
    saveState();
    if (renderPending) return;
    renderPending = true;
    setTimeout(() => {
      renderPending = false;
      const html = window.NewsletterTemplate.render(state);
      previewFrame.srcdoc = html;
      updateSizeMeter(html);
    }, 16);
  }

  // ---------- Helpers ----------
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  function approxKb(dataUrl) {
    if (!dataUrl) return 0;
    const i = dataUrl.indexOf(',');
    const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
    return Math.round((b64.length * 0.75) / 1024);
  }

  // Resize big raster images down to the email's retina width and re-encode
  // JPEGs. GIFs pass through untouched so animation is preserved.
  async function optimizeImage(file, opts = {}) {
    const maxWidth = opts.maxWidth || 1072;
    const jpegQuality = opts.jpegQuality || 0.9;
    if (file.type === 'image/gif') return await fileToDataURL(file);
    if (!/^image\/(jpeg|jpg|png|webp|bmp)$/i.test(file.type)) return await fileToDataURL(file);
    const srcUrl = await fileToDataURL(file);
    let img;
    try { img = await loadImage(srcUrl); } catch (e) { return srcUrl; }
    const nW = img.naturalWidth, nH = img.naturalHeight;
    if (!nW || !nH) return srcUrl;
    let outW = nW, outH = nH;
    if (nW > maxWidth) { outW = maxWidth; outH = Math.round(nH * (maxWidth / nW)); }
    if (outW === nW && file.size < 220 * 1024) return srcUrl;
    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, outW, outH);
    if (file.type === 'image/png') return canvas.toDataURL('image/png');
    return canvas.toDataURL('image/jpeg', jpegQuality);
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---------- Form primitives ----------
  function field(label, control, hint) {
    const f = document.createElement('div');
    f.className = 'field';
    const l = document.createElement('label');
    l.className = 'field-label';
    l.innerHTML = label;
    f.appendChild(l);
    f.appendChild(control);
    if (hint) {
      const h = document.createElement('div');
      h.className = 'field-hint';
      h.textContent = hint;
      f.appendChild(h);
    }
    return f;
  }
  function textInput(value, onChange, opts = {}) {
    const i = document.createElement('input');
    i.className = 'input'; i.type = 'text'; i.value = value || '';
    if (opts.placeholder) i.placeholder = opts.placeholder;
    i.addEventListener('input', () => onChange(i.value));
    return i;
  }
  function textarea(value, onChange, opts = {}) {
    const t = document.createElement('textarea');
    t.className = 'textarea'; t.value = value || '';
    if (opts.placeholder) t.placeholder = opts.placeholder;
    if (opts.rows) t.rows = opts.rows;
    t.addEventListener('input', () => onChange(t.value));
    return t;
  }
  function switchToggle(value, onChange) {
    const s = document.createElement('div');
    s.className = 'switch' + (value ? ' on' : '');
    s.addEventListener('click', () => {
      const next = !s.classList.contains('on');
      s.classList.toggle('on', next);
      onChange(next);
    });
    return s;
  }
  function slider(value, onChange, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    const input = document.createElement('input');
    input.type = 'range'; input.className = 'slider';
    input.min = opts.min != null ? opts.min : 0;
    input.max = opts.max != null ? opts.max : 100;
    input.step = opts.step != null ? opts.step : 1;
    input.value = value == null ? input.min : value;
    const readout = document.createElement('span');
    readout.className = 'slider-readout';
    const fmt = (v) => (opts.unit ? v + opts.unit : String(v));
    readout.textContent = fmt(input.value);
    input.addEventListener('input', () => { readout.textContent = fmt(input.value); onChange(Number(input.value)); });
    wrap.appendChild(input); wrap.appendChild(readout);
    return wrap;
  }
  function segmented(options, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'segmented';
    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'segmented-btn' + (opt.value === value ? ' selected' : '');
      btn.innerHTML = '<span class="segmented-label">' + opt.label + '</span>' +
        (opt.sub ? '<span class="segmented-sub">' + opt.sub + '</span>' : '');
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.segmented-btn').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');
        onChange(opt.value);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  // Accent / tone swatch picker
  function swatchPicker(options, currentVal, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'swatch-grid';
    function render() {
      wrap.innerHTML = '';
      options.forEach((o) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (currentVal() === o.value ? ' selected' : '');
        sw.title = o.label;
        sw.innerHTML = '<span class="swatch-chip" style="background:' + o.fill + ';"></span>' +
          '<span class="swatch-label">' + o.label + '</span>';
        sw.addEventListener('click', () => { onChange(o.value); render(); });
        wrap.appendChild(sw);
      });
    }
    render();
    wrap._rerender = render;
    return wrap;
  }

  // Image / GIF dropzone
  function makeDropzone({ label, hint, currentValue, onChange, optimizeOpts, accept }) {
    const wrap = document.createElement('label');
    wrap.className = 'dropzone';
    if (currentValue) wrap.classList.add('has-image');

    const thumb = document.createElement('div');
    thumb.className = 'dropzone-thumb';
    if (currentValue) thumb.style.backgroundImage = 'url("' + currentValue + '")';

    const text = document.createElement('div');
    text.className = 'dropzone-text';
    text.innerHTML = '<strong>' + label + '</strong>' + (hint ? '<span class="filename">' + hint + '</span>' : '');

    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept || 'image/*';

    const clear = document.createElement('button');
    clear.type = 'button'; clear.className = 'dropzone-clear'; clear.innerHTML = '\u00d7';
    clear.title = 'Remove image'; clear.style.display = currentValue ? '' : 'none';

    wrap.appendChild(thumb); wrap.appendChild(text); wrap.appendChild(clear); wrap.appendChild(input);

    function setValue(dataUrl, filename) {
      if (dataUrl) {
        wrap.classList.add('has-image');
        thumb.style.backgroundImage = 'url("' + dataUrl + '")';
        clear.style.display = '';
        if (filename) text.innerHTML = '<strong>' + label + '</strong><span class="filename">' + filename + '</span>';
      } else {
        wrap.classList.remove('has-image');
        thumb.style.backgroundImage = '';
        clear.style.display = 'none';
        text.innerHTML = '<strong>' + label + '</strong>' + (hint ? '<span class="filename">' + hint + '</span>' : '');
      }
      onChange(dataUrl);
    }
    async function handle(file) {
      const originalKb = Math.round(file.size / 1024);
      const url = await optimizeImage(file, optimizeOpts || {});
      const outKb = approxKb(url);
      const note = outKb < originalKb ? file.name + ' \u2014 ' + originalKb + ' KB \u2192 ' + outKb + ' KB' : file.name + ' \u2014 ' + outKb + ' KB';
      setValue(url, note);
      if (outKb > 90) toast('Heads up: ' + outKb + ' KB \u2014 large for email. Consider hosting it instead.');
    }
    input.addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) handle(f); });
    ['dragenter', 'dragover'].forEach((evt) => wrap.addEventListener(evt, (e) => { e.preventDefault(); wrap.classList.add('dragging'); }));
    ['dragleave', 'drop'].forEach((evt) => wrap.addEventListener(evt, (e) => {
      if (evt === 'drop') { e.preventDefault(); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handle(f); }
      wrap.classList.remove('dragging');
    }));
    clear.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setValue('', ''); });
    return wrap;
  }

  function makeSection({ step, title, sub, open, build }) {
    const wrap = document.createElement('section');
    wrap.className = 'section' + (open ? ' open' : '');
    const header = document.createElement('button');
    header.type = 'button'; header.className = 'section-header';
    header.innerHTML = '<span class="section-step">' + step + '</span>' +
      '<span><span class="section-title">' + title + '</span>' +
      (sub ? '<div class="section-sub">' + sub + '</div>' : '') + '</span>' +
      '<span class="chevron"></span>';
    const body = document.createElement('div');
    body.className = 'section-body';
    build(body);
    header.addEventListener('click', () => wrap.classList.toggle('open'));
    wrap.appendChild(header); wrap.appendChild(body);
    return wrap;
  }

  const ACCENTS = [
    { value: '#15181f', label: 'Black',  fill: 'linear-gradient(90deg,#2b3240,#0c0f16)' },
    { value: '#ff7b1d', label: 'Orange', fill: 'linear-gradient(90deg,#ff8226,#f35c17)' },
    { value: '#17a954', label: 'Green',  fill: 'linear-gradient(90deg,#1fbf63,#128a44)' },
    { value: '#38455d', label: 'Slate',  fill: 'linear-gradient(90deg,#4a5a78,#2c3850)' },
    { value: '#2a6fdb', label: 'Blue',   fill: 'linear-gradient(90deg,#3b82f6,#2563eb)' },
    { value: '#0d9488', label: 'Teal',   fill: 'linear-gradient(90deg,#14b8a6,#0d9488)' },
    { value: '#7c3aed', label: 'Purple', fill: 'linear-gradient(90deg,#8b5cf6,#7c3aed)' },
    { value: '#e11d48', label: 'Red',    fill: 'linear-gradient(90deg,#f43f5e,#e11d48)' },
    { value: '#d97706', label: 'Amber',  fill: 'linear-gradient(90deg,#f59e0b,#d97706)' },
    { value: '#db2777', label: 'Pink',   fill: 'linear-gradient(90deg,#ec4899,#db2777)' },
    { value: '#4f46e5', label: 'Indigo', fill: 'linear-gradient(90deg,#6366f1,#4f46e5)' }
  ];
  const TONES = [
    { value: 'accent', label: 'Accent', fill: 'var(--oxd-primary-one)' },
    { value: 'green',  label: 'Green',  fill: '#17a954' },
    { value: 'slate',  label: 'Slate',  fill: '#38455d' }
  ];

  // Generic repeatable numbered-item list (Features / Improvements)
  function buildNumberedList(body, getArr) {
    const list = document.createElement('div');
    body.appendChild(list);

    function renderList() {
      list.innerHTML = '';
      const arr = getArr();
      arr.forEach((item, idx) => {
        const box = document.createElement('div');
        box.className = 'repeatable-item';
        box.draggable = true; box.dataset.index = idx;

        const head = document.createElement('div');
        head.className = 'repeatable-item-header';
        head.innerHTML = '<span class="drag-handle" title="Drag to reorder">\u22ee\u22ee</span><span class="repeatable-item-title">Item ' + (idx + 1) + '</span>';
        const del = document.createElement('button');
        del.type = 'button'; del.className = 'btn-danger'; del.textContent = 'Remove';
        del.addEventListener('click', () => { arr.splice(idx, 1); renderList(); scheduleRender(); });
        head.appendChild(del);
        box.appendChild(head);

        box.appendChild(field('Number', textInput(item.badge, (v) => { item.badge = v; scheduleRender(); }, { placeholder: '01' })));

        box.appendChild(field('Title (main point)', textInput(item.title, (v) => { item.title = v; scheduleRender(); }, { placeholder: 'e.g. Citra AI on mobile.' })));
        box.appendChild(field('Description (paragraph)', textarea(item.body, (v) => { item.body = v; scheduleRender(); }, { rows: 3 })));
        box.appendChild(field('Compatible with (optional)', textInput(item.version, (v) => { item.version = v; scheduleRender(); }, { placeholder: 'e.g. version 8.0' }), 'Shows as a small chip below the paragraph'));

        box.addEventListener('dragstart', (e) => { box.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); });
        box.addEventListener('dragend', () => box.classList.remove('dragging'));
        box.addEventListener('dragover', (e) => e.preventDefault());
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer.getData('text/plain'));
          const to = Number(box.dataset.index);
          if (from === to) return;
          const moved = arr.splice(from, 1)[0];
          arr.splice(to, 0, moved);
          renderList(); scheduleRender();
        });

        list.appendChild(box);
      });
    }
    renderList();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button'; addBtn.className = 'add-btn'; addBtn.innerHTML = '+ Add item';
    addBtn.addEventListener('click', () => {
      const arr = getArr();
      arr.push({ badge: String(arr.length + 1).padStart(2, '0'), tone: 'accent', title: '', body: '', version: '' });
      renderList(); scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // Repeatable label / value / link rows (Hosting environment)
  function buildHostingList(body) {
    const list = document.createElement('div');
    body.appendChild(list);

    function renderList() {
      list.innerHTML = '';
      state.hosting.forEach((item, idx) => {
        const box = document.createElement('div');
        box.className = 'repeatable-item';
        box.draggable = true; box.dataset.index = idx;

        const head = document.createElement('div');
        head.className = 'repeatable-item-header';
        head.innerHTML = '<span class="drag-handle" title="Drag to reorder">\u22ee\u22ee</span><span class="repeatable-item-title">Row ' + (idx + 1) + '</span>';
        const del = document.createElement('button');
        del.type = 'button'; del.className = 'btn-danger'; del.textContent = 'Remove';
        del.addEventListener('click', () => { state.hosting.splice(idx, 1); renderList(); scheduleRender(); });
        head.appendChild(del);
        box.appendChild(head);

        box.appendChild(field('Label', textInput(item.label, (v) => { item.label = v; scheduleRender(); }, { placeholder: 'e.g. URL' })));
        box.appendChild(field('Value', textInput(item.value, (v) => { item.value = v; scheduleRender(); }, { placeholder: 'Shown text (credentials render in monospace)' })));
        box.appendChild(field('Link (optional)', textInput(item.link, (v) => { item.link = v; scheduleRender(); }, { placeholder: 'https://\u2026 makes the value clickable' })));

        box.addEventListener('dragstart', (e) => { box.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); });
        box.addEventListener('dragend', () => box.classList.remove('dragging'));
        box.addEventListener('dragover', (e) => e.preventDefault());
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer.getData('text/plain'));
          const to = Number(box.dataset.index);
          if (from === to) return;
          const moved = state.hosting.splice(from, 1)[0];
          state.hosting.splice(to, 0, moved);
          renderList(); scheduleRender();
        });

        list.appendChild(box);
      });
    }
    renderList();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button'; addBtn.className = 'add-btn'; addBtn.innerHTML = '+ Add row';
    addBtn.addEventListener('click', () => {
      state.hosting.push({ label: '', value: '', link: '' });
      renderList(); scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // -------- Section 1: Theme & header --------
  function buildThemeSection(body) {
    body.appendChild(field('Accent color', swatchPicker(ACCENTS, () => state.accent, (v) => { state.accent = v; scheduleRender(); }),
      'Drives the top bar, headline highlight, numbers, button & links'));

    const glassRow = document.createElement('div');
    glassRow.className = 'toggle-row';
    glassRow.innerHTML = '<span><strong>Frosted glass</strong><div class="field-hint">Apple/iOS Mail show real glass; Gmail/Outlook fall back to clean solids</div></span>';
    glassRow.appendChild(switchToggle(state.glass, (v) => { state.glass = v; scheduleRender(); }));
    body.appendChild(glassRow);

    body.appendChild(field('Issue label', textInput(state.issueLabel, (v) => { state.issueLabel = v; scheduleRender(); }), 'Shown centered under the logo'));
    body.appendChild(field('Logo size', slider(state.logoWidth || 150, (v) => { state.logoWidth = v; scheduleRender(); }, { min: 80, max: 280, step: 2, unit: 'px' }), 'Width of the OrangeHRM logo in the masthead'));
    body.appendChild(field('Preheader text', textarea(state.preheader, (v) => { state.preheader = v; scheduleRender(); }, { rows: 2 }),
      'Inbox preview snippet — hidden in the email body'));
  }

  // -------- Section 2: Headline --------
  function buildHeadlineSection(body) {
    body.appendChild(field('Headline — before highlight', textInput(state.headlinePre, (v) => { state.headlinePre = v; scheduleRender(); })));
    body.appendChild(field('Highlighted word', textInput(state.headlineHL, (v) => { state.headlineHL = v; scheduleRender(); }), 'Gets the accent marker'));
    body.appendChild(field('Headline — after highlight', textInput(state.headlinePost, (v) => { state.headlinePost = v; scheduleRender(); })));
    body.appendChild(field('Sub-headline', textarea(state.dek, (v) => { state.dek = v; scheduleRender(); }, { rows: 2 })));
  }

  // -------- Section 3: Hero & intro --------
  function buildStorySection(body) {
    body.appendChild(field('Hero image', makeDropzone({
      label: 'Drop hero image or click to upload',
      hint: 'Auto-resized & optimised',
      currentValue: state.heroImage,
      optimizeOpts: { maxWidth: 1072, jpegQuality: 0.9 },
      onChange: (v) => { state.heroImage = v; scheduleRender(); }
    })));
    body.appendChild(field('Hero alt text', textInput(state.heroAlt, (v) => { state.heroAlt = v; scheduleRender(); }), 'For accessibility & when images are blocked'));
    body.appendChild(field('Lead sentence (bold)', textarea(state.introLead, (v) => { state.introLead = v; scheduleRender(); }, { rows: 2 })));
    body.appendChild(field('Intro body', textarea(state.introBody, (v) => { state.introBody = v; scheduleRender(); }, { rows: 5 }), 'Leave both blank to hide the intro'));
  }

  // -------- Section 4: Features --------
  function buildFeaturesSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">Numbered list, styled like \u201cIn this issue\u201d</div></span>';
    toggle.appendChild(switchToggle(state.showFeatures, (v) => { state.showFeatures = v; scheduleRender(); }));
    body.appendChild(toggle);
    body.appendChild(field('Section title', textInput(state.featuresTitle, (v) => { state.featuresTitle = v; scheduleRender(); })));
    body.appendChild(field('Section color', swatchPicker(ACCENTS, () => state.featuresColor, (v) => { state.featuresColor = v; scheduleRender(); }), 'Colors the section title and the numbers'));
    buildNumberedList(body, () => state.features);
  }

  // -------- Section 5: Improvements --------
  function buildImprovementsSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">Numbered list, styled like \u201cIn this issue\u201d</div></span>';
    toggle.appendChild(switchToggle(state.showImprovements, (v) => { state.showImprovements = v; scheduleRender(); }));
    body.appendChild(toggle);
    body.appendChild(field('Section title', textInput(state.improvementsTitle, (v) => { state.improvementsTitle = v; scheduleRender(); })));
    body.appendChild(field('Section color', swatchPicker(ACCENTS, () => state.improvementsColor, (v) => { state.improvementsColor = v; scheduleRender(); }), 'Colors the section title and the numbers'));
    buildNumberedList(body, () => state.improvements);
  }

  // -------- Section 6: Compatibility & hosting --------
  function buildCompatSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">Compatible versions + hosting environment</div></span>';
    toggle.appendChild(switchToggle(state.showCompat, (v) => { state.showCompat = v; scheduleRender(); }));
    body.appendChild(toggle);

    body.appendChild(field('Section color', swatchPicker(ACCENTS, () => state.compatColor, (v) => { state.compatColor = v; scheduleRender(); }), 'Colors titles, bullets, links & app buttons'));

    body.appendChild(field('Compatibility section title', textInput(state.compatVersionsTitle, (v) => { state.compatVersionsTitle = v; scheduleRender(); })));
    body.appendChild(field('Compatible versions', textarea(state.compatVersions, (v) => { state.compatVersions = v; scheduleRender(); }, { rows: 3, placeholder: 'Compatible with version 8.0' }),
      'One line per bullet — shown in its own section'));

    const appToggle = document.createElement('div');
    appToggle.className = 'toggle-row';
    appToggle.innerHTML = '<span><strong>App download buttons</strong><div class="field-hint">Side-by-side App Store / Google Play buttons</div></span>';
    appToggle.appendChild(switchToggle(state.showAppButtons, (v) => { state.showAppButtons = v; scheduleRender(); }));
    body.appendChild(appToggle);
    body.appendChild(field('App Store link (iOS)', textInput(state.iosUrl, (v) => { state.iosUrl = v; scheduleRender(); }, { placeholder: 'https://apps.apple.com/...' }), 'The App Store button links here'));
    body.appendChild(field('Google Play link (Android)', textInput(state.androidUrl, (v) => { state.androidUrl = v; scheduleRender(); }, { placeholder: 'https://play.google.com/...' }), 'The Google Play badge links here'));

    body.appendChild(field('Hosting section title', textInput(state.hostingTitle, (v) => { state.hostingTitle = v; scheduleRender(); })));
    buildHostingList(body);
  }

  // -------- Section 7: Call to action --------
  function buildCtaSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include the button</strong><div class="field-hint">A primary call-to-action button</div></span>';
    toggle.appendChild(switchToggle(state.showCta, (v) => { state.showCta = v; scheduleRender(); }));
    body.appendChild(toggle);
    body.appendChild(field('Button label', textInput(state.ctaLabel, (v) => { state.ctaLabel = v; scheduleRender(); })));
    body.appendChild(field('Button link', textInput(state.ctaUrl, (v) => { state.ctaUrl = v; scheduleRender(); }, { placeholder: 'https://...' }),
      'App store / download / release-notes URL'));
    body.appendChild(field('Meta line', textInput(state.ctaMeta, (v) => { state.ctaMeta = v; scheduleRender(); }), 'Small caption under the button'));
  }

  // -------- Section 8: Highlights (GIF) --------
  function buildHighlightsSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">An animated GIF shown just above the footer</div></span>';
    toggle.appendChild(switchToggle(state.showHighlights, (v) => { state.showHighlights = v; scheduleRender(); }));
    body.appendChild(toggle);

    body.appendChild(field('Section title', textInput(state.highlightsTitle, (v) => { state.highlightsTitle = v; scheduleRender(); })));

    body.appendChild(field('Highlights GIF', makeDropzone({
      label: 'Drop a GIF or click to upload',
      hint: 'GIF, PNG or JPG — animates in Apple/Gmail; Outlook shows frame 1',
      currentValue: state.highlightsGif,
      accept: 'image/gif,image/png,image/jpeg,image/webp',
      optimizeOpts: { maxWidth: 1072, jpegQuality: 0.9 },
      onChange: (v) => { state.highlightsGif = v; scheduleRender(); }
    }), 'Embedded GIFs add weight — watch the size meter (Gmail clips over 102 KB)'));

    body.appendChild(field('…or paste a hosted GIF URL', textInput(state.highlightsUrl, (v) => { state.highlightsUrl = v; scheduleRender(); }, { placeholder: 'https://…/highlights.gif' }),
      'Recommended for large GIFs — keeps the email small. Used only if no file is uploaded above.'));
    body.appendChild(field('Caption (optional)', textInput(state.highlightsCaption, (v) => { state.highlightsCaption = v; scheduleRender(); })));
    body.appendChild(field('Alt text', textInput(state.highlightsAlt, (v) => { state.highlightsAlt = v; scheduleRender(); }), 'Shown when the image is blocked'));
  }

  // -------- Section 9: Byline --------
  function buildBylineSection(body) {
    body.appendChild(field('Name', textInput(state.byName, (v) => { state.byName = v; scheduleRender(); })));
    body.appendChild(field('Role', textInput(state.byRole, (v) => { state.byRole = v; scheduleRender(); })));
  }

  // -------- Section 10: Footer --------
  function buildFooterSection(body) {
    body.appendChild(field('Disclaimer / address', textarea(state.footerNote, (v) => { state.footerNote = v; scheduleRender(); }, { rows: 3 }), 'Newlines wrap onto multiple lines'));
    body.appendChild(field('Copyright line', textInput(state.copyright, (v) => { state.copyright = v; scheduleRender(); })));
  }

  // ---------- Mount ----------
  const SECTIONS = [
    { step: '1',  title: 'Theme & header',         sub: 'Accent, glass, issue label, preheader', open: true,  build: buildThemeSection },
    { step: '2',  title: 'Headline',               sub: 'Headline, sub-headline',                open: true,  build: buildHeadlineSection },
    { step: '3',  title: 'Hero & intro',           sub: 'Hero image, lead + body copy',          open: false, build: buildStorySection },
    { step: '4',  title: 'Features',               sub: 'Numbered \u201cNew features\u201d list',      open: true,  build: buildFeaturesSection },
    { step: '5',  title: 'Improvements',           sub: 'Numbered improvements list',            open: false, build: buildImprovementsSection },
    { step: '6',  title: 'Compatibility & hosting',sub: 'Versions, app badges, credentials',     open: false, build: buildCompatSection },
    { step: '7',  title: 'Call to action',         sub: 'Button label, link, meta',              open: false, build: buildCtaSection },
    { step: '8',  title: 'Highlights (GIF)',       sub: 'Animated GIF above the footer',         open: false, build: buildHighlightsSection },
    { step: '9',  title: 'Byline',                 sub: 'Team name shown in the footer',         open: false, build: buildBylineSection },
    { step: '10', title: 'Footer',                 sub: 'Disclaimer, copyright',                 open: false, build: buildFooterSection }
  ];
  const formPane = document.getElementById('form-pane');
  function mountForm() {
    formPane.innerHTML = '';
    SECTIONS.forEach((s) => formPane.appendChild(makeSection(s)));
  }
  mountForm();

  // ---------- Export ----------
  async function inlineLocalAssets(html) {
    const matches = [...html.matchAll(/src="(assets\/[^"]+)"/g)];
    const unique = [...new Set(matches.map((m) => m[1]))];
    for (const path of unique) {
      try {
        const res = await fetch(path);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        html = html.split('src="' + path + '"').join('src="' + dataUrl + '"');
      } catch (e) {}
    }
    return html;
  }
  async function getExportHtml() {
    let html = window.NewsletterTemplate.render(state);
    html = await inlineLocalAssets(html);
    return html;
  }
  // For pasting into Gmail/Outlook: hand over only the <body> contents (a
  // fragment), never a full <!doctype><html><head> document — pasting a whole
  // document makes Gmail render a stripped fallback AND the real body (the
  // “two versions” bug). The Download button still gets the full document.
  function bodyInner(html) {
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return (m ? m[1] : html).trim();
  }
  async function getPasteHtml() {
    return bodyInner(await getExportHtml());
  }
  function getPlainText() {
    return ((state.headlinePre || '') + ' ' + (state.headlineHL || '') + ' ' + (state.headlinePost || ''))
      .replace(/\s+/g, ' ').trim() || 'OrangeHRM Mobile Newsletter';
  }

  document.getElementById('btn-copy').addEventListener('click', async () => {
    const htmlPromise = getPasteHtml();
    const plain = getPlainText();
    let copiedRich = false;
    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      try {
        const item = new ClipboardItem({
          'text/html':  htmlPromise.then((h) => new Blob([h], { type: 'text/html' })),
          'text/plain': new Blob([plain], { type: 'text/plain' })
        });
        await navigator.clipboard.write([item]);
        copiedRich = true;
      } catch (e) {}
    }
    if (!copiedRich) {
      try { await navigator.clipboard.writeText(await htmlPromise); }
      catch (e) { toast('Copy failed — try Download HTML instead'); return; }
    }
    toast(copiedRich ? 'Copied! Paste into Gmail compose' : 'HTML source copied');
  });

  document.getElementById('btn-download').addEventListener('click', async () => {
    const html = await getExportHtml();
    const filename = 'mobile-newsletter-' + (state.issueLabel || 'email').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html';
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Downloaded ' + filename);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all fields to defaults? This clears any uploaded images.')) return;
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    localStorage.removeItem(LS_KEY);
    mountForm();
    scheduleRender();
    toast('Reset to defaults');
  });

  // ---------- Send test ----------
  document.getElementById('btn-send-test').addEventListener('click', openSendTestModal);

  function openSendTestModal() {
    const lastEmail = localStorage.getItem('newsletter-generator:last-email') || '';
    const subjectDefault = (state.headlinePre + ' ' + state.headlineHL + ' ' + state.headlinePost).replace(/\s+/g, ' ').trim();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML =
      '<div class="modal-head"><div>' +
        '<div class="modal-title">Send test email</div>' +
        '<div class="modal-sub">We\u2019ll copy the HTML and open your compose window — just paste into the body and send</div>' +
      '</div><button class="modal-close" type="button" aria-label="Close">\u00d7</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="field-label">Recipient email <span class="req">*</span></label>' +
          '<input id="st-email" type="email" class="input" placeholder="you@orangehrm.com" value="' + esc(lastEmail) + '" autocomplete="email"></div>' +
        '<div class="field"><label class="field-label">Subject</label>' +
          '<input id="st-subject" type="text" class="input" value="' + esc(subjectDefault) + '"></div>' +
        '<div class="modal-info"><strong>How it works:</strong><ol>' +
          '<li>Click a compose option — we copy the HTML and open the window</li>' +
          '<li>In the body, paste with <kbd>Ctrl/Cmd</kbd> + <kbd>V</kbd></li>' +
          '<li>Click Send</li></ol></div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-ghost" id="st-cancel" type="button">Cancel</button>' +
        '<button class="btn" id="st-mailto" type="button">Default mail app</button>' +
        '<button class="btn" id="st-outlook" type="button">Outlook</button>' +
        '<button class="btn btn-primary" id="st-gmail" type="button">Open in Gmail \u2192</button>' +
      '</div>';
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.querySelector('#st-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

    const emailInput = modal.querySelector('#st-email');
    const subjectInput = modal.querySelector('#st-subject');
    setTimeout(() => emailInput.focus(), 50);

    function validate() {
      const v = (emailInput.value || '').trim();
      if (!v || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
        emailInput.style.borderColor = 'var(--oxd-feedback-danger)';
        emailInput.focus(); toast('Enter a valid email address'); return null;
      }
      emailInput.style.borderColor = '';
      localStorage.setItem('newsletter-generator:last-email', v);
      return { email: v, subject: (subjectInput.value || '').trim() };
    }
    async function copyHtmlForPaste() {
      const htmlPromise = getPasteHtml();
      const plain = getPlainText();
      try {
        if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({
            'text/html':  htmlPromise.then((h) => new Blob([h], { type: 'text/html' })),
            'text/plain': new Blob([plain], { type: 'text/plain' })
          })]);
          return true;
        }
      } catch (e) {}
      try { await navigator.clipboard.writeText(await htmlPromise); return true; } catch (e) { return false; }
    }
    modal.querySelector('#st-gmail').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      window.open('https://mail.google.com/mail/?view=cm&fs=1&tf=cm&to=' + encodeURIComponent(v.email) + '&su=' + encodeURIComponent(v.subject), '_blank', 'noopener');
      toast(ok ? 'HTML copied! Paste into Gmail body' : 'Gmail opened — Copy HTML separately'); close();
    });
    modal.querySelector('#st-outlook').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      window.open('https://outlook.office.com/mail/deeplink/compose?to=' + encodeURIComponent(v.email) + '&subject=' + encodeURIComponent(v.subject), '_blank', 'noopener');
      toast(ok ? 'HTML copied! Paste into Outlook body' : 'Outlook opened — Copy HTML separately'); close();
    });
    modal.querySelector('#st-mailto').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      window.location.href = 'mailto:' + encodeURIComponent(v.email) + '?subject=' + encodeURIComponent(v.subject);
      toast(ok ? 'HTML copied! Paste into your mail app body' : 'Mail app opened — Copy HTML separately'); close();
    });
  }

  // ---------- Init ----------
  scheduleRender();
})();
