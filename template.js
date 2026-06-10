/* =============================================================
   Mobile Newsletter Email Template
   Produces bulletproof, table-based HTML for an OrangeHRM
   Mobile release newsletter. Inline styles + a small <style>
   block that progressively enhances supporting clients (Apple /
   iOS Mail) with frosted glass — Gmail / Outlook keep clean solids.
   ============================================================= */

(function (global) {
  'use strict';

  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&(?!#?\w+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const escMulti = (s) => esc(s).replace(/\n/g, '<br>');

  const BLANK_HERO =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340">' +
        '<rect width="100%" height="100%" fill="%23e7ebf4"/>' +
        '<text x="50%" y="50%" fill="%238a93a6" font-family="Inter,sans-serif" font-size="18" ' +
        'text-anchor="middle" dominant-baseline="middle">Hero image</text></svg>'
    );

  const BLANK_GIF =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="500">' +
        '<rect width="100%" height="100%" fill="#11151c"/>' +
        '<text x="50%" y="47%" fill="#8a93a6" font-family="Inter,sans-serif" font-size="16" ' +
        'text-anchor="middle">Highlights GIF</text>' +
        '<text x="50%" y="53%" fill="#5d6b82" font-family="Inter,sans-serif" font-size="11" ' +
        'text-anchor="middle">Upload a mobile screen recording</text></svg>'
    );

  // ---------- Accent themes ----------
  // Each theme drives the bar, eyebrow chip, headline highlight, badges,
  // CTA gradient, and footer links. Black is the mobile-release default.
  const THEMES = {
    '#15181f': { base: '#15181f', grad: 'linear-gradient(90deg,#2b3240 0%,#0c0f16 100%)', text: '#15181f', link: '#9aa3b2', rgb: '21,24,31',   label: 'Black'  },
    '#ff7b1d': { base: '#ff7b1d', grad: 'linear-gradient(90deg,#ff8226 0%,#f35c17 100%)', text: '#e2620e', link: '#ff9a4d', rgb: '255,123,29', label: 'Orange' },
    '#17a954': { base: '#17a954', grad: 'linear-gradient(90deg,#1fbf63 0%,#128a44 100%)', text: '#0f8f46', link: '#4cd083', rgb: '23,169,84',  label: 'Green'  },
    '#38455d': { base: '#38455d', grad: 'linear-gradient(90deg,#4a5a78 0%,#2c3850 100%)', text: '#38455d', link: '#aab6cd', rgb: '56,69,93',   label: 'Slate'  },
    '#2a6fdb': { base: '#2a6fdb', grad: 'linear-gradient(90deg,#3b82f6 0%,#2563eb 100%)', text: '#1d5fc4', link: '#7aa7f0', rgb: '42,111,219', label: 'Blue'   },
    '#0d9488': { base: '#0d9488', grad: 'linear-gradient(90deg,#14b8a6 0%,#0d9488 100%)', text: '#0c8478', link: '#5ed3c6', rgb: '13,148,136', label: 'Teal'   },
    '#7c3aed': { base: '#7c3aed', grad: 'linear-gradient(90deg,#8b5cf6 0%,#7c3aed 100%)', text: '#6d28d9', link: '#b69bf5', rgb: '124,58,237', label: 'Purple' },
    '#e11d48': { base: '#e11d48', grad: 'linear-gradient(90deg,#f43f5e 0%,#e11d48 100%)', text: '#c81e43', link: '#f58aa0', rgb: '225,29,72',  label: 'Red'    },
    '#d97706': { base: '#d97706', grad: 'linear-gradient(90deg,#f59e0b 0%,#d97706 100%)', text: '#b45309', link: '#f0b860', rgb: '217,119,6',  label: 'Amber'  },
    '#db2777': { base: '#db2777', grad: 'linear-gradient(90deg,#ec4899 0%,#db2777 100%)', text: '#be185d', link: '#f08bb8', rgb: '219,39,119', label: 'Pink'   },
    '#4f46e5': { base: '#4f46e5', grad: 'linear-gradient(90deg,#6366f1 0%,#4f46e5 100%)', text: '#4338ca', link: '#a5a0f0', rgb: '79,70,229',  label: 'Indigo' }
  };
  const GREEN = { text: '#17a954', rgb: '23,169,84' };

  function themeFor(d) {
    return THEMES[d.accent] || THEMES['#15181f'];
  }
  // Resolve a per-section custom color (hex key into THEMES) to a color object.
  function sectionColor(hex, d) {
    return THEMES[hex] || themeFor(d);
  }
  function toneColors(tone, theme) {
    if (tone === 'green') return { text: GREEN.text, rgb: GREEN.rgb, grad: 'linear-gradient(90deg,#1fbf63 0%,#0f8f46 100%)' };
    if (tone === 'slate') return { text: '#38455d', rgb: '56,69,93', grad: 'linear-gradient(90deg,#4a5a78 0%,#2c3850 100%)' };
    return { text: theme.text, rgb: theme.rgb, grad: theme.grad };
  }
  // Gradient-filled text with a solid fallback FIRST (Outlook & clients that
  // can't clip a gradient to text fall back to the solid color).
  function gradText(c) {
    return 'color:' + c.text + '; background:' + c.grad + '; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;';
  }

  // <head> style block — base resets + (optionally) the frosted-glass
  // enhancement. Inline styles below always carry a solid fallback, so even
  // if a client drops this block the email still looks finished.
  function headStyle(d) {
    const glass = d.glass
      ? `
  .glass-card { background:rgba(255,255,255,0.72) !important; -webkit-backdrop-filter:blur(20px) saturate(150%); backdrop-filter:blur(20px) saturate(150%); }
  .glass-panel { background:rgba(255,255,255,0.55) !important; -webkit-backdrop-filter:blur(12px) saturate(140%); backdrop-filter:blur(12px) saturate(140%); }`
      : '';
    return `
  html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
  * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse !important; }
  img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; display:block; }
  a { text-decoration:none; }
  @media only screen and (max-width:600px){
    .container { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:30px !important; line-height:35px !important; }
    .hero img { width:100% !important; height:auto !important; }
    .stack { display:block !important; width:100% !important; text-align:left !important; }
    .stack-right { text-align:left !important; padding-top:8px !important; }
  }${glass}`;
  }

  // ---------- Section blocks ----------

  function renderMasthead(d) {
    const logoW = Math.round(Math.max(80, Math.min(280, Number(d.logoWidth) || 150)));
    const label = (d.issueLabel || '').trim()
      ? `<div style="font-family:'Inter',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#8a93a6; padding-top:10px;">${esc(d.issueLabel)}</div>`
      : '';
    return `
    <tr>
      <td class="px" align="center" style="padding:32px 40px 22px 40px; border-bottom:1px solid rgba(56,69,93,0.08); text-align:center;">
        <img src="${esc(d.logo || 'assets/orangehrm-logo-masthead.png')}" width="${logoW}" alt="OrangeHRM" style="width:${logoW}px; max-width:${logoW}px; height:auto; margin:0 auto; display:block;">
        ${label}
      </td>
    </tr>`;
  }

  function renderHeadline(d) {
    const t = themeFor(d);
    const tint = (a) => `rgba(${t.rgb},${a})`;
    const hl = (d.headlineHL || '').trim()
      ? ` <span style="display:inline-block; margin:0 7px; background:${tint('0.16')}; box-shadow:0 0 0 4px ${tint('0.16')}; border-radius:4px;"><span style="${gradText({text:t.text,grad:t.grad})}">${esc(d.headlineHL)}</span></span> `
      : ' ';
    const dek = (d.dek || '').trim()
      ? `
    <tr><td class="px" align="center" style="padding:14px 60px 28px 60px; font-family:'Inter',Arial,sans-serif; font-size:15px; line-height:23px; font-weight:500; color:#8a93a6;">${escMulti(d.dek)}</td></tr>`
      : '<tr><td style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>';
    return `
    <tr><td class="px h1" align="center" style="padding:34px 50px 8px 50px; font-family:'Inter',Arial,sans-serif; font-size:38px; line-height:43px; font-weight:800; color:#2c3850; letter-spacing:-1.2px;">${esc(d.headlinePre)}${hl}${esc(d.headlinePost)}</td></tr>${dek}`;
  }

  function renderHero(d) {
    const src = d.heroImage || BLANK_HERO;
    return `
    <tr><td class="px" style="padding:0 24px; font-size:0; line-height:0;">
      <img class="hero" src="${esc(src)}" width="552" alt="${esc(d.heroAlt || '')}" style="width:100%; max-width:552px; height:auto; display:block; border-radius:14px;">
    </td></tr>`;
  }

  function renderIntro(d) {
    if (!(d.introLead || '').trim() && !(d.introBody || '').trim()) return '';
    const lead = (d.introLead || '').trim()
      ? `<span style="font-weight:700; color:#2c3850;">${esc(d.introLead)}</span> `
      : '';
    return `
    <tr><td class="px" style="padding:30px 48px 6px 48px; font-family:'Inter',Arial,sans-serif; font-size:16px; line-height:27px; font-weight:400; color:#5d6b82;">${lead}${escMulti(d.introBody)}</td></tr>`;
  }

  // ---------- Numbered list item (Features / Improvements) ----------
  function renderItem(item, c) {
    const tint = (a) => `rgba(${c.rgb},${a})`;
    const body = (item.body || '').trim()
      ? `<div style="padding-top:5px; font-family:'Inter',Arial,sans-serif; font-size:15px; line-height:23px; color:#5d6b82;">${escMulti(item.body)}</div>`
      : '';
    const ver = (item.version || '').trim()
      ? `<div style="padding-top:9px;"><span style="display:inline-block; padding:4px 12px; background:${tint('0.12')}; border-radius:20px; font-family:'Inter',Arial,sans-serif; font-size:12px; line-height:16px; font-weight:700; letter-spacing:0.02em; color:${c.text};">Compatible with ${esc(item.version)}</span></div>`
      : '';
    const badge = esc(item.badge || '•');
    return `
      <tr><td style="padding:16px 24px 0 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="top" width="38" style="width:38px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" valign="middle" width="30" height="30" style="width:30px; height:30px; background:${tint('0.14')}; border-radius:50%; font-family:'Inter',Arial,sans-serif; font-size:12px; font-weight:800;"><span style="${gradText(c)}">${badge}</span></td>
            </tr></table>
          </td>
          <td valign="top" style="padding-left:14px; font-family:'Inter',Arial,sans-serif;">
            <span style="font-size:16px; line-height:22px; font-weight:700; color:#2c3850;">${esc(item.title)}</span>${body}${ver}
          </td>
        </tr></table>
      </td></tr>`;
  }

  function panelTitle(text, color) {
    return (text || '').trim()
      ? `<tr><td style="padding:22px 24px 4px 24px; font-family:'Inter',Arial,sans-serif; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:${color || '#2c3850'};">${esc(text)}</td></tr>`
      : '';
  }

  // Generic numbered-item panel — used for Features and Improvements.
  function renderNumberedPanel(d, opts) {
    if (!opts.show) return '';
    const c = sectionColor(opts.color, d);
    const items = (opts.items || [])
      .filter((i) => (i.title || '').trim().length > 0)
      .map((i) => renderItem(i, c))
      .join('');
    if (!items) return '';
    return `
    <tr><td class="px" style="padding:18px 24px 6px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="glass-panel" style="border-radius:18px; border:1px solid rgba(255,255,255,0.7); background:#f4f6fa;">
        ${panelTitle(opts.title, c.text)}${items}
        <tr><td style="height:22px; line-height:22px; font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>`;
  }

  // ---------- Compatibility & hosting ----------
  function renderVersionRow(v, c) {
    return `
      <tr><td style="padding:5px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle" width="22" style="width:22px;"><div style="width:7px; height:7px; border-radius:50%; background:${c.base}; margin:0;">&nbsp;</div></td>
          <td valign="middle" style="font-family:'Inter',Arial,sans-serif; font-size:15px; line-height:22px; font-weight:600; color:#2c3850;">${esc(v)}</td>
        </tr></table>
      </td></tr>`;
  }

  function renderHostingRow(row, c) {
    const link = (row.link || '').trim();
    const isCode = /\b(PW|UN|password)\s*[:=]/i.test(row.value || '');
    let val;
    if (link) {
      val = `<a href="${esc(link)}" target="_blank" style="font-family:'Inter',Arial,sans-serif; font-size:14px; line-height:21px; font-weight:600; color:${c.text}; text-decoration:underline; word-break:break-word;">${esc(row.value || link)}</a>`;
    } else if (isCode) {
      val = `<span style="font-family:'SF Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace; font-size:13px; line-height:21px; color:#2c3850; word-break:normal; overflow-wrap:normal; white-space:normal;">${esc(row.value).replace(/\s*\|\s*/g, '<br>')}</span>`;
    } else {
      val = `<span style="font-family:'Inter',Arial,sans-serif; font-size:14px; line-height:21px; color:#5d6b82; word-break:break-word;">${esc(row.value)}</span>`;
    }
    return `
      <tr>
        <td valign="top" width="38%" style="width:38%; padding:11px 12px 11px 0; border-top:1px solid rgba(56,69,93,0.10); font-family:'Inter',Arial,sans-serif; font-size:12px; font-weight:700; color:#8a93a6; letter-spacing:0.02em;">${esc(row.label)}</td>
        <td valign="top" style="padding:11px 0; border-top:1px solid rgba(56,69,93,0.10);">${val}</td>
      </tr>`;
  }

  function subHead(text) {
    return (text || '').trim()
      ? `<tr><td style="padding:18px 24px 2px 24px; font-family:'Inter',Arial,sans-serif; font-size:12px; font-weight:800; color:#2c3850; letter-spacing:0.04em;">${esc(text)}</td></tr>`
      : '';
  }

  // Side-by-side App Store / Google Play badge images (linked).
  function renderAppButtons(d) {
    if (!d.showAppButtons) return '';
    const B = (typeof window !== 'undefined' && window.STORE_BADGES) || {};
    // If a host URL is given, link to real PNG files (so Gmail keeps them when
    // you edit the link). Otherwise embed the data-URL badges (self-contained).
    const base = (d.assetBaseUrl || '').trim().replace(/\/+$/, '');
    const iosSrc = base ? base + '/badge-appstore.png' : B.ios;
    const andSrc = base ? base + '/badge-googleplay.png' : B.android;
    const cell = (url, src, alt) => src ? `
          <td align="center" style="padding:6px 7px;">
            <a href="${esc(url || '#')}" target="_blank" style="text-decoration:none;">
              <img src="${esc(src)}" width="184" height="56" alt="${esc(alt)}" style="width:184px; max-width:184px; height:56px; display:block; border:0;">
            </a>
          </td>` : '';
    const cells = cell(d.iosUrl, iosSrc, 'Download on the App Store') + cell(d.androidUrl, andSrc, 'Get it on Google Play');
    if (!cells) return '';
    return `
      <tr><td style="padding:8px 20px 6px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${cells}</tr></table>
      </td></tr>`;
  }

  function renderCompat(d) {
    if (!d.showCompat) return '';
    const c = sectionColor(d.compatColor, d);

    // Panel 1 — Compatibility (versions as bullets)
    const versions = String(d.compatVersions || '')
      .split('\n').map((s) => s.trim()).filter(Boolean);
    const verPanel = versions.length
      ? `
    <tr><td class="px" style="padding:18px 24px 6px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="glass-panel" style="border-radius:18px; border:1px solid rgba(255,255,255,0.7); background:#f4f6fa;">
        ${panelTitle(d.compatVersionsTitle, c.text)}
        <tr><td style="padding:4px 24px 4px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${versions.map((v) => renderVersionRow(v, c)).join('')}</table>
        </td></tr>
        <tr><td style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>`
      : '';

    // Panel 2 — Hosting environment (app buttons + credentials)
    const appBtns = renderAppButtons(d);
    const rows = (d.hosting || []).filter((r) => (r.label || '').trim() || (r.value || '').trim());
    const rowsBlock = rows.length
      ? `<tr><td style="padding:4px 24px 6px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.map((r) => renderHostingRow(r, c)).join('')}</table>
        </td></tr>`
      : '';
    const hostPanel = (appBtns || rowsBlock)
      ? `
    <tr><td class="px" style="padding:18px 24px 6px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="glass-panel" style="border-radius:18px; border:1px solid rgba(255,255,255,0.7); background:#f4f6fa;">
        ${panelTitle(d.hostingTitle, c.text)}${appBtns}${rowsBlock}
        <tr><td style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>`
      : '';

    return verPanel + hostPanel;
  }

  // ---------- Highlights GIF ----------
  function renderHighlights(d) {
    if (!d.showHighlights) return '';
    const src = d.highlightsGif || (d.highlightsUrl || '').trim() || BLANK_GIF;
    const title = (d.highlightsTitle || '').trim()
      ? `<tr><td class="px" style="padding:6px 48px 12px 48px; font-family:'Inter',Arial,sans-serif; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#2c3850; text-align:center;">${esc(d.highlightsTitle)}</td></tr>`
      : '';
    const caption = (d.highlightsCaption || '').trim()
      ? `<tr><td class="px" align="center" style="padding:12px 48px 4px 48px; font-family:'Inter',Arial,sans-serif; font-size:13px; line-height:20px; font-weight:500; color:#8a93a6; text-align:center;">${escMulti(d.highlightsCaption)}</td></tr>`
      : '';
    // Bulletproof phone frame — image sized by width attr (height auto), centered.
    // No object-fit / overflow crop (Gmail strips those and blows the image up).
    const screenW = 240;
    const phone = `
    <tr><td align="center" style="padding:8px 24px 4px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
        <tr><td align="center" bgcolor="#0c0f16" style="padding:13px; background:#0c0f16; background:linear-gradient(160deg,#23272f 0%,#0a0d12 100%); border-radius:40px; box-shadow:0 20px 44px -14px rgba(12,15,22,0.55);">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-radius:26px; overflow:hidden; background:#000000; line-height:0; font-size:0;">
              <img src="${esc(src)}" width="${screenW}" alt="${esc(d.highlightsAlt || 'Release highlights')}" style="display:block; width:${screenW}px; max-width:${screenW}px; height:auto; border-radius:26px; border:0;">
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>`;
    return `
    <tr><td style="height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>
    ${title}
    ${phone}${caption}`;
  }

  function renderCTA(d) {
    if (!d.showCta) return '';
    const t = themeFor(d);
    const meta = (d.ctaMeta || '').trim()
      ? `<tr><td class="px" align="center" style="padding:13px 48px 4px 48px; font-family:'Inter',Arial,sans-serif; font-size:12px; line-height:18px; font-weight:500; color:#8a93a6;">${escMulti(d.ctaMeta)}</td></tr>`
      : '';
    return `
    <tr><td class="px" align="center" style="padding:30px 48px 6px 48px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(d.ctaUrl || '#')}" style="height:54px;v-text-anchor:middle;width:320px;" arcsize="50%" fillcolor="${t.base}" stroke="f">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(d.ctaLabel)} &rarr;</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-- -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
        <td align="center" style="border-radius:30px; background:${t.base}; background:${t.grad}; box-shadow:0 12px 26px -8px rgba(${t.rgb},0.6);">
          <a href="${esc(d.ctaUrl || '#')}" target="_blank" style="display:inline-block; padding:17px 42px; font-family:'Inter',Arial,sans-serif; font-size:15px; font-weight:700; letter-spacing:0.2px; color:#ffffff; border-radius:30px;">${esc(d.ctaLabel)}&nbsp;&nbsp;&rarr;</a>
        </td>
      </tr></table>
      <!--<![endif]-->
    </td></tr>${meta}`;
  }

  function renderFooter(d) {
    const team = (d.byName || d.byRole)
      ? ((d.byName || '').trim() ? `<tr><td align="center" style="font-family:'Inter',Arial,sans-serif; font-size:16px; font-weight:700; color:#ffffff; padding-bottom:3px;">${esc(d.byName)}</td></tr>` : '') +
        ((d.byRole || '').trim() ? `<tr><td align="center" style="font-family:'Inter',Arial,sans-serif; font-size:12px; font-weight:500; color:#8ea2bb; padding-bottom:18px;">${esc(d.byRole)}</td></tr>` : '')
      : '';
    const note = (d.footerNote || '').trim()
      ? `<tr><td align="center" style="font-family:'Inter',Arial,sans-serif; font-size:12px; line-height:20px; font-weight:500; color:#a9b2c4; padding-bottom:14px;">${escMulti(d.footerNote)}</td></tr>`
      : '';
    const copyright = (d.copyright || '').trim()
      ? `<tr><td align="center" style="font-family:'Inter',Arial,sans-serif; font-size:11px; color:#7e89a1; padding-top:10px;">${esc(d.copyright)}</td></tr>`
      : '';
    return `
    <tr><td style="background:#0c0f16; background:linear-gradient(160deg,#1c2330 0%,#0a0d13 100%); padding:34px 40px 30px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${team}${note}${copyright}
      </table>
    </td></tr>`;
  }

  // ---------- Top-level render ----------
  function renderEmail(d) {
    const pageBg = d.glass ? '#eaecf3' : '#eef0f5';
    const cardBg = '#ffffff';
    const preheader = (d.preheader || '').trim()
      ? `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${pageBg}; opacity:0;">${esc(d.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
      : '';
    return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${esc(d.documentTitle || 'OrangeHRM Mobile Newsletter')}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${headStyle(d)}</style>
</head>
<body class="bg" style="margin:0; padding:0; background-color:${pageBg};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background-color:${pageBg};"><tr>
<td align="center" style="padding:40px 12px;">
  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff"><tr><td><![endif]-->
  <table role="presentation" class="container glass-card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background:${cardBg}; border-radius:24px; overflow:hidden; border:1px solid rgba(56,69,93,0.06); box-shadow:0 2px 8px rgba(40,52,74,0.07);">
${renderMasthead(d)}
${renderHeadline(d)}
${renderHero(d)}
${renderIntro(d)}
${renderNumberedPanel(d, { show: d.showFeatures, title: d.featuresTitle, items: d.features, color: d.featuresColor })}
${renderNumberedPanel(d, { show: d.showImprovements, title: d.improvementsTitle, items: d.improvements, color: d.improvementsColor })}
${renderCompat(d)}
${renderCTA(d)}
${renderHighlights(d)}
    <tr><td style="height:30px; line-height:30px; font-size:0;">&nbsp;</td></tr>
${renderFooter(d)}
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</td>
</tr></table>
</body>
</html>`;
  }

  global.NewsletterTemplate = { render: renderEmail, THEMES, BLANK_HERO, BLANK_GIF };
})(window);
