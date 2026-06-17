/* eslint-disable */
// ==UserScript==
// @name         Tax Helper — impots.gouv.fr Auto-Fill
// @namespace    https://github.com/hinosxz/tax-helper
// @version      1.0.0
// @description  Auto-fills impots.gouv.fr using data from the tax-helper local API
// @author       Pietro Dellino
// @match        https://cfspart.impots.gouv.fr/*
// @match        https://www.impots.gouv.fr/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      tax-helper-olive.vercel.app
// @run-at       document-idle
// ==/UserScript==

"use strict";

// ─── SECTION A: CONFIGURATION ──────────────────────────────────────────────

const API_URL = "https://tax-helper-olive.vercel.app/api/calculate";

// CSS selectors for every form field, organized by page type.
// Verified against the actual impots.gouv.fr HTML for Form 2074.
const SELECTORS = {
  mainDeclaration: {
    "1TT": {
      primary: 'input[id="1TT"], input[name="1TT"]',
      fallbacks: ['input[id*="1TT"]', 'input[data-code="1TT"]', "#case_1TT"],
    },
    "1TZ": {
      primary: 'input[id="1TZ"], input[name="1TZ"]',
      fallbacks: ['input[id*="1TZ"]', 'input[data-code="1TZ"]', "#case_1TZ"],
    },
    "1WZ": {
      primary: 'input[id="1WZ"], input[name="1WZ"]',
      fallbacks: ['input[id*="1WZ"]', 'input[data-code="1WZ"]', "#case_1WZ"],
    },
    "1AJ": {
      primary: 'input[id="1AJ"], input[name="1AJ"]',
      fallbacks: ['input[id*="1AJ"]', 'input[data-code="1AJ"]', "#case_1AJ"],
    },
    "3VG": {
      primary: 'input[id="3VG"], input[name="3VG"]',
      fallbacks: ['input[id*="3VG"]', 'input[data-code="3VG"]', "#case_3VG"],
    },
  },

  // Form 2074 Page 510 — one cession shown per page.
  // The site loops one entry at a time; the field names always use index [0].
  // The hidden input[name="_loopIndex"] (1-based) tells which API row is current.
  form2074Page510: {
    // Read this to know which row from the API to use (1-based)
    loopIndex: 'input[name="_loopIndex"]',
    // Click this to submit and advance to the next cession
    suivantBtn: "a.boutonDroite",
    // Field 511 is a <textarea>, not an <input>
    511: {
      primary:
        'textarea[name="listDec2074Cession[0].designationTitreIntFinancier"]',
      fallbacks: [],
    },
    512: {
      primary: 'input[name="listDec2074Cession[0].dateCession"]',
      fallbacks: [],
    },
    514: {
      primary: 'input[name="listDec2074Cession[0].mntUnitTitreCession"]',
      fallbacks: [],
    },
    515: {
      primary: 'input[name="listDec2074Cession[0].nbTitreCedes"]',
      fallbacks: [],
    },
    // 516 is readonly (site computes 514 × 515)
    516: {
      primary: 'input[name="listDec2074Cession[0].mntGlobal"]',
      fallbacks: [],
    },
    517: {
      primary: 'input[name="listDec2074Cession[0].mntFraisCession"]',
      fallbacks: [],
    },
    // 518 is readonly (site computes 516 − 517)
    518: {
      primary: 'input[name="listDec2074Cession[0].mntCessionNet"]',
      fallbacks: [],
    },
    520: {
      primary: 'input[name="listDec2074Cession[0].mntAcquisitionUnit"]',
      fallbacks: [],
    },
    521: {
      primary: 'input[name="listDec2074Cession[0].mntAcquisitionGlobal"]',
      fallbacks: [],
    },
    522: {
      primary: 'input[name="listDec2074Cession[0].mntFraisAcquisition"]',
      fallbacks: [],
    },
    // 523 is readonly (site computes 521 + 522)
    523: {
      primary: 'input[name="listDec2074Cession[0].mntRevient"]',
      fallbacks: [],
    },
    // 524 is readonly (site computes 518 − 523)
    524: {
      primary: 'input[name="listDec2074Cession[0].mntResultat"]',
      fallbacks: [],
    },
    525: {
      primary:
        'input[type="checkbox"][name="listDec2074Cession[0].indicImputPertPrealable"]',
      fallbacks: [],
    },
    526: {
      primary: 'input[name="listDec2074Cession[0].mntImputPertPrealable"]',
      fallbacks: [],
    },
  },

  form2074Page900: {
    "903_gains": {
      primary: 'input[id="f903g"], input[name="f903g"]',
      fallbacks: [
        'input[id*="903"][id*="gain"]',
        'input[id*="903_1"]',
        'input[id="903g"]',
      ],
    },
    "903_losses": {
      primary: 'input[id="f903p"], input[name="f903p"]',
      fallbacks: [
        'input[id*="903"][id*="perte"]',
        'input[id*="903_2"]',
        'input[id="903p"]',
      ],
    },
  },
  form2074Page11: {
    "1133_gains": {
      primary: 'input[id="f1133g"], input[name="f1133g"]',
      fallbacks: [
        'input[id*="1133"][id*="gain"]',
        'input[id*="1133_1"]',
        'input[id="1133g"]',
      ],
    },
    "1133_losses": {
      primary: 'input[id="f1133p"], input[name="f1133p"]',
      fallbacks: [
        'input[id*="1133"][id*="perte"]',
        'input[id*="1133_2"]',
        'input[id="1133p"]',
      ],
    },
  },
  pageDetection: {
    mainDeclaration: '[id*="2042"], form[name*="2042"]',
    // ancreBloc511 is a reliable landmark injected by the site on the Page 510 loop
    form2074Page510: '[id="ancreBloc511"]',
    form2074Page900: '[id*="p900"], [id*="page900"], [id*="f903"]',
    form2074Page11: '[id*="page11"], [id*="p11-"], [id*="f1133"]',
  },
};

const PAGE_PATTERNS = {
  mainDeclaration: [
    /cfspart\.impots\.gouv\.fr\/.*2042/i,
    /cfspart\.impots\.gouv\.fr\/.*revenus/i,
  ],
  form2074Page510: [
    /cfspart\.impots\.gouv\.fr\/.*2074.*510/i,
    /cfspart\.impots\.gouv\.fr\/.*cession/i,
  ],
  form2074Page900: [
    /cfspart\.impots\.gouv\.fr\/.*2074.*900/i,
    /cfspart\.impots\.gouv\.fr\/.*recapitulatif/i,
  ],
  form2074Page11: [
    /cfspart\.impots\.gouv\.fr\/.*2074.*page.?11/i,
    /cfspart\.impots\.gouv\.fr\/.*2074.*11[^0-9]/i,
  ],
};

const PAGE_LABELS = {
  mainDeclaration: "Form 2042 — Main declaration",
  form2074Page510: "Form 2074 — Page 510 (sell entries)",
  form2074Page900: "Form 2074 — Page 900 (summary)",
  form2074Page11: "Form 2074 — Page 11 (line 1133)",
};

// ─── SECTION B: PAGE DETECTION ─────────────────────────────────────────────

function detectPageType() {
  for (const [type, patterns] of Object.entries(PAGE_PATTERNS)) {
    if (patterns.some((p) => p.test(location.href))) return type;
  }
  for (const [type, sel] of Object.entries(SELECTORS.pageDetection)) {
    if (document.querySelector(sel)) return type;
  }
  return null;
}

// ─── SECTION C: DOM UTILITIES ───────────────────────────────────────────────

function resolveElement(selectorDef) {
  const trySelector = (s) => document.querySelector(s);
  const el = trySelector(selectorDef.primary);
  if (el) return el;
  for (const fb of selectorDef.fallbacks || []) {
    const el2 = trySelector(fb);
    if (el2) return el2;
  }
  return null;
}

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value",
).set;
const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  "value",
).set;

function setInputValue(el, value) {
  if (!el || el.disabled) return false;

  if (el.type === "checkbox") {
    el.checked = Boolean(value);
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  if (el.readOnly) return false;

  // Use native prototype setters so jQuery/framework event listeners fire correctly.
  // Field 511 (designation) is a <textarea>; all others are <input>.
  if (el.tagName === "TEXTAREA") {
    nativeTextareaValueSetter.call(el, String(value));
  } else {
    nativeInputValueSetter.call(el, String(value));
  }
  el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  // blur triggers the site's onblur handlers (replacePointParVirgule, calculFormulaire, etc.)
  el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  return true;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── SECTION D: STATE MACHINE ───────────────────────────────────────────────

let currentState = "idle";
let taxData = null;
let currentPageType = null;
let fillProgress = { current: 0, total: 0 };

function loadPersistedData() {
  const raw = GM_getValue("taxHelperData", null);
  if (raw) {
    try {
      taxData = JSON.parse(raw);
      currentState = "ready";
    } catch {
      GM_deleteValue("taxHelperData");
    }
  }
}

function persistData(data) {
  taxData = data;
  GM_setValue("taxHelperData", JSON.stringify(data));
  GM_setValue("taxHelperState", "ready");
}

function resetData() {
  taxData = null;
  currentState = "idle";
  GM_deleteValue("taxHelperData");
  GM_deleteValue("taxHelperState");
  GM_deleteValue("taxHelperError");
  GM_deleteValue("taxHelperFilledPages");
}

function markPageFilled(pageType) {
  const filled = JSON.parse(GM_getValue("taxHelperFilledPages", "[]"));
  if (!filled.includes(pageType)) {
    filled.push(pageType);
    GM_setValue("taxHelperFilledPages", JSON.stringify(filled));
  }
}

function getFilledPages() {
  return JSON.parse(GM_getValue("taxHelperFilledPages", "[]"));
}

function savePanelPosition(x, y) {
  GM_setValue("taxHelperPanelPos", JSON.stringify({ x, y }));
}

function loadPanelPosition() {
  const raw = GM_getValue("taxHelperPanelPos", null);
  return raw ? JSON.parse(raw) : null;
}

// ─── SECTION E: FILL FUNCTIONS ──────────────────────────────────────────────

// Fields filled per Page 510 entry (skipping 519 which is a label, and auto-computed readonly ones)
const PAGE_510_FILL_ORDER = [
  "511",
  "512",
  "514",
  "515",
  "517",
  "520",
  "521",
  "522",
  "525",
  "526",
];

function countFieldsForPage(pageType) {
  if (pageType === "mainDeclaration") return 5;
  if (pageType === "form2074Page510") return PAGE_510_FILL_ORDER.length;
  if (pageType === "form2074Page900") return 2;
  if (pageType === "form2074Page11") return 2;
  return 0;
}

// Returns the 0-based index into Page 510 array for the currently shown cession.
function getCurrentPage510Index() {
  const el = document.querySelector(SELECTORS.form2074Page510.loopIndex);
  return el ? Math.max(0, parseInt(el.value, 10) - 1) : 0;
}

async function fillMainDeclaration(data, onProgress) {
  const boxes = ["1TT", "1TZ", "1WZ", "1AJ", "3VG"];
  for (const box of boxes) {
    const el = resolveElement(SELECTORS.mainDeclaration[box]);
    if (el) {
      setInputValue(el, Math.floor(data[box]));
    } else {
      console.warn(`[TaxHelper] Selector not found for box ${box}`);
    }
    onProgress();
    await delay(80);
  }
}

async function fillForm2074Page510(data, onProgress) {
  const rows = data["Form 2074"]["Page 510"];
  const rowIndex = getCurrentPage510Index();

  if (rowIndex >= rows.length) {
    console.warn(
      "[TaxHelper] _loopIndex exceeds number of data rows — nothing to fill",
    );
    return;
  }

  const rowData = rows[rowIndex];

  for (const fieldKey of PAGE_510_FILL_ORDER) {
    const value = rowData[fieldKey];
    if (value === undefined) {
      onProgress();
      continue;
    }

    const selDef = SELECTORS.form2074Page510[fieldKey];
    if (!selDef) {
      onProgress();
      continue;
    }

    const el = resolveElement(selDef);
    if (!el) {
      console.warn(
        `[TaxHelper] Page 510 entry ${rowIndex + 1} field ${fieldKey}: element not found`,
      );
      onProgress();
      continue;
    }

    setInputValue(el, value);
    onProgress();
    await delay(80);
  }
}

async function fillForm2074Page900(data, onProgress) {
  const { gains, losses } = data["Form 2074"]["Page 900"]["903"];
  const gainsEl = resolveElement(SELECTORS.form2074Page900["903_gains"]);
  const lossesEl = resolveElement(SELECTORS.form2074Page900["903_losses"]);
  if (gainsEl) setInputValue(gainsEl, Math.floor(gains));
  else console.warn("[TaxHelper] 903 gains field not found");
  onProgress();
  await delay(80);
  if (lossesEl) setInputValue(lossesEl, Math.floor(losses));
  else console.warn("[TaxHelper] 903 losses field not found");
  onProgress();
}

async function fillForm2074Page11(data, onProgress) {
  const { gains, losses } = data["Form 2074"]["page 11"]["1133"];
  const gainsEl = resolveElement(SELECTORS.form2074Page11["1133_gains"]);
  const lossesEl = resolveElement(SELECTORS.form2074Page11["1133_losses"]);
  if (gainsEl) setInputValue(gainsEl, Math.floor(gains));
  else console.warn("[TaxHelper] 1133 gains field not found");
  onProgress();
  await delay(80);
  if (lossesEl) setInputValue(lossesEl, Math.floor(losses));
  else console.warn("[TaxHelper] 1133 losses field not found");
  onProgress();
}

async function fillPageFields(pageType, data, onProgress) {
  switch (pageType) {
    case "mainDeclaration":
      return fillMainDeclaration(data, onProgress);
    case "form2074Page510":
      return fillForm2074Page510(data, onProgress);
    case "form2074Page900":
      return fillForm2074Page900(data, onProgress);
    case "form2074Page11":
      return fillForm2074Page11(data, onProgress);
  }
}

// ─── SECTION F: API CALL ────────────────────────────────────────────────────

function callLocalApi(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    GM_xmlhttpRequest({
      method: "POST",
      url: API_URL,
      data: formData,
      timeout: 30000,
      onload(res) {
        if (res.status === 200) {
          try {
            resolve(JSON.parse(res.responseText));
          } catch {
            reject(new Error("Invalid JSON response from API"));
          }
        } else {
          let message = `API error ${res.status}`;
          try {
            const body = JSON.parse(res.responseText);
            if (body.error) message = body.error;
          } catch {
            /* ignore */
          }
          reject(new Error(message));
        }
      },
      onerror() {
        reject(new Error("Network error — could not reach the API"));
      },
      ontimeout() {
        reject(new Error("Request timed out after 30s"));
      },
    });
  });
}

// ─── SECTION G: PANEL UI ────────────────────────────────────────────────────

const PANEL_CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; }
  #panel {
    width: 320px;
    background: #1e293b;
    color: #f1f5f9;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    user-select: none;
    overflow: hidden;
  }
  #drag-handle {
    background: #0f172a;
    padding: 9px 12px;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #334155;
  }
  #drag-title { font-weight: 700; font-size: 14px; letter-spacing: .01em; }
  #drag-actions { display: flex; gap: 6px; align-items: center; }
  .icon-btn {
    cursor: pointer; opacity: .55; font-size: 16px; line-height: 1;
    background: none; border: none; color: #f1f5f9; padding: 0 2px;
    transition: opacity .15s;
  }
  .icon-btn:hover { opacity: 1; }
  #body { padding: 12px; }
  #page-indicator {
    font-size: 11px; color: #94a3b8; margin-bottom: 8px;
    padding: 4px 8px; background: #0f172a; border-radius: 4px;
    min-height: 26px; display: flex; align-items: center; gap: 6px;
  }
  .pi-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    background: #475569;
  }
  .pi-dot.known { background: #22c55e; }
  .pi-dot.filled { background: #3b82f6; }

  /* Disclaimer */
  #disclaimer {
    font-size: 10px; color: #64748b; font-style: italic;
    line-height: 1.4; margin-bottom: 8px;
  }

  /* Drop zone */
  #drop-zone {
    position: relative;
    border: 2px dashed #475569; border-radius: 7px;
    padding: 18px 12px; text-align: center; cursor: pointer;
    transition: border-color .2s, background .2s;
    margin-bottom: 8px;
  }
  #drop-zone:hover, #drop-zone.drag-over {
    border-color: #60a5fa; background: rgba(96,165,250,.06);
  }
  #drop-zone .dz-icon { font-size: 24px; margin-bottom: 6px; }
  #drop-zone .dz-main { font-weight: 600; font-size: 13px; }
  #drop-zone .dz-sub  { font-size: 11px; color: #64748b; margin-top: 3px; }

  /* Spinner */
  .spinner {
    width: 28px; height: 28px; border: 3px solid #334155;
    border-top-color: #60a5fa; border-radius: 50%;
    animation: spin .7s linear infinite; margin: 8px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Data summary */
  #data-summary { margin: 8px 0; }
  .field-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 3px 0; border-bottom: 1px solid #1e3a5f;
  }
  .field-row:last-child { border-bottom: none; }
  .fn { color: #94a3b8; font-size: 12px; }
  .fv { font-weight: 700; font-size: 13px; color: #e2e8f0; }
  .section-header {
    font-size: 10px; font-weight: 700; letter-spacing: .08em;
    color: #64748b; text-transform: uppercase;
    margin: 10px 0 4px;
  }

  /* Error */
  #error-box {
    background: #450a0a; color: #fca5a5; padding: 9px 10px;
    border-radius: 6px; font-size: 12px; line-height: 1.4;
    margin-bottom: 8px;
  }

  /* Progress */
  #progress-wrap { margin: 8px 0 4px; }
  #progress-label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; text-align: center; }
  #progress-bar-bg {
    background: #334155; border-radius: 4px; height: 6px; overflow: hidden;
  }
  #progress-bar {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    height: 6px; border-radius: 4px;
    transition: width .25s ease;
  }

  /* Buttons */
  button.th-btn {
    width: 100%; padding: 9px; border-radius: 7px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: none; margin-top: 6px; transition: background .15s, opacity .15s;
  }
  .btn-fill   { background: #2563eb; color: #fff; }
  .btn-fill:hover:not(:disabled) { background: #1d4ed8; }
  .btn-fill:disabled { opacity: .35; cursor: default; }
  .btn-refill   { background: #166534; color: #bbf7d0; }
  .btn-refill:hover { background: #15803d; }
  .btn-next   { background: #7c3aed; color: #ede9fe; }
  .btn-next:hover { background: #6d28d9; }
  .btn-reset  { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
  .btn-reset:hover { background: #334155; color: #f1f5f9; }

  /* Done check */
  #done-check { font-size: 28px; text-align: center; margin: 6px 0 2px; }
  #done-msg   { font-size: 12px; color: #86efac; text-align: center; margin-bottom: 6px; }

  /* Loading message */
  #loading-msg { text-align: center; color: #94a3b8; font-size: 12px; margin: 4px 0 8px; }
`;

function formatEur(n) {
  return Math.floor(n).toLocaleString("fr-FR") + " €";
}

function buildDataSummaryHTML(data) {
  const rows510 = data["Form 2074"]["Page 510"];
  const p900 = data["Form 2074"]["Page 900"]["903"];
  const p11 = data["Form 2074"]["page 11"]["1133"];

  const boxes = [
    { key: "1TT", label: "1TT — RSU gains >300K€" },
    { key: "1TZ", label: "1TZ — RSU gains <300K€ (50% rebate)" },
    { key: "1WZ", label: "1WZ — Acquisition rebate" },
    { key: "1AJ", label: "1AJ — Non-qualified gains" },
    { key: "3VG", label: "3VG — Capital gains" },
  ];

  let html = '<div class="section-header">Main declaration (Form 2042)</div>';
  for (const { key, label } of boxes) {
    html += `<div class="field-row"><span class="fn">${label}</span><span class="fv">${formatEur(data[key])}</span></div>`;
  }

  html += '<div class="section-header">Form 2074 — Page 510</div>';
  html += `<div class="field-row"><span class="fn">Sell entries</span><span class="fv">${rows510.length} rows</span></div>`;

  html += '<div class="section-header">Form 2074 — Page 900 (box 903)</div>';
  html += `<div class="field-row"><span class="fn">Gains</span><span class="fv">${formatEur(p900.gains)}</span></div>`;
  html += `<div class="field-row"><span class="fn">Losses</span><span class="fv">${formatEur(p900.losses)}</span></div>`;

  html += '<div class="section-header">Form 2074 — Page 11 (line 1133)</div>';
  html += `<div class="field-row"><span class="fn">Gains</span><span class="fv">${formatEur(p11.gains)}</span></div>`;
  html += `<div class="field-row"><span class="fn">Losses</span><span class="fv">${formatEur(p11.losses)}</span></div>`;

  return html;
}

function createPanel() {
  const host = document.createElement("div");
  host.id = "__taxHelper__";
  host.style.cssText = "position:fixed;z-index:2147483647;top:20px;right:20px;";

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${PANEL_CSS}</style>
    <div id="panel">
      <div id="drag-handle">
        <span id="drag-title">🇫🇷 Tax Helper</span>
        <div id="drag-actions">
          <button class="icon-btn" id="minimize-btn" title="Minimize">−</button>
        </div>
      </div>
      <div id="body">
        <div id="page-indicator"><div class="pi-dot" id="pi-dot"></div><span id="pi-text">Detecting page...</span></div>

        <!-- idle state -->
        <div id="view-idle">
          <div id="disclaimer">🚔 By uploading this file you acknowledge that the author is a developer, not an accountant, and waive all rights to blame anyone but yourself in the event of an audit, a fine, or an unannounced visit from the fiscal police.</div>
          <div id="drop-zone">
            <div class="dz-icon">📂</div>
            <div class="dz-main">Drop E-Trade XLSX here</div>
            <div class="dz-sub">or click to browse</div>
            <!-- Overlay the input over the entire drop zone so the click is a
                 direct user gesture — calling .click() programmatically inside
                 a Shadow DOM handler does not count as one in Chrome/Firefox. -->
            <input type="file" id="file-input" accept=".xlsx"
                   style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer">
          </div>
        </div>

        <!-- loading state -->
        <div id="view-loading" style="display:none">
          <div class="spinner"></div>
          <div id="loading-msg">Calculating taxes…</div>
        </div>

        <!-- error state -->
        <div id="view-error" style="display:none">
          <div id="error-box"></div>
          <button class="th-btn btn-reset" id="error-reset-btn">Try again</button>
        </div>

        <!-- ready / filling / done state -->
        <div id="view-ready" style="display:none">
          <div id="data-summary"></div>
          <div id="done-check" style="display:none">✅</div>
          <div id="done-msg" style="display:none">Page filled!</div>
          <div id="progress-wrap" style="display:none">
            <div id="progress-label">Filling…</div>
            <div id="progress-bar-bg"><div id="progress-bar" style="width:0%"></div></div>
          </div>
          <button class="th-btn btn-fill" id="fill-btn" disabled>Fill this entry</button>
          <button class="th-btn btn-next" id="fill-next-btn" disabled style="display:none">Fill &amp; Next →</button>
          <button class="th-btn btn-refill" id="refill-btn" style="display:none">Re-fill this entry</button>
          <button class="th-btn btn-reset" id="reset-btn">Reset data</button>
        </div>
      </div>
    </div>
  `;
  return { host, shadow };
}

function attachDrag(host, handle) {
  let dragging = false;
  let ox = 0,
    oy = 0;

  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = host.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const x = e.clientX - ox;
    const y = e.clientY - oy;
    host.style.left = x + "px";
    host.style.top = y + "px";
    host.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    savePanelPosition(parseInt(host.style.left), parseInt(host.style.top));
  });
}

// ─── SECTION H: PANEL CONTROLLER ────────────────────────────────────────────

function initPanel(shadow) {
  const $ = (id) => shadow.getElementById(id);

  const views = {
    idle: $("view-idle"),
    loading: $("view-loading"),
    error: $("view-error"),
    ready: $("view-ready"),
  };

  function showView(name) {
    for (const [k, el] of Object.entries(views)) {
      el.style.display = k === name ? "" : "none";
    }
  }

  function updatePageIndicator() {
    const dot = $("pi-dot");
    const text = $("pi-text");
    const filled = getFilledPages();
    if (currentPageType) {
      let label = PAGE_LABELS[currentPageType] || currentPageType;
      if (currentPageType === "form2074Page510" && taxData) {
        const total = taxData["Form 2074"]["Page 510"].length;
        const current = getCurrentPage510Index() + 1;
        label += ` — entry ${current} of ${total}`;
      }
      text.textContent = label;
      dot.className = filled.includes(currentPageType)
        ? "pi-dot filled"
        : "pi-dot known";
    } else {
      text.textContent = "Unknown page — navigate to a form";
      dot.className = "pi-dot";
    }
  }

  function updateFillButton() {
    const canFill = !!(currentPageType && currentState === "ready");
    $("fill-btn").disabled = !canFill;
    const fillNextBtn = $("fill-next-btn");
    // Show Fill & Next only on Page 510 when there are more entries after this one
    if (currentPageType === "form2074Page510" && taxData) {
      const total = taxData["Form 2074"]["Page 510"].length;
      const current = getCurrentPage510Index() + 1;
      fillNextBtn.style.display = "";
      fillNextBtn.disabled = !(canFill && current < total);
    } else {
      fillNextBtn.style.display = "none";
    }
  }

  function render() {
    updatePageIndicator();
    if (currentState === "idle") {
      showView("idle");
    } else if (currentState === "loading") {
      showView("loading");
    } else if (currentState === "error") {
      showView("error");
    } else if (currentState === "ready" || currentState === "done") {
      showView("ready");
      $("data-summary").innerHTML = taxData
        ? buildDataSummaryHTML(taxData)
        : "";
      $("done-check").style.display = currentState === "done" ? "" : "none";
      $("done-msg").style.display = currentState === "done" ? "" : "none";
      $("progress-wrap").style.display = "none";
      $("fill-btn").style.display = currentState === "done" ? "none" : "";
      $("refill-btn").style.display = currentState === "done" ? "" : "none";
      // Fill & Next is shown/hidden by updateFillButton; keep it hidden when done
      if (currentState === "done") $("fill-next-btn").style.display = "none";
      updateFillButton();
    } else if (currentState === "filling") {
      showView("ready");
      $("fill-btn").style.display = "none";
      $("fill-next-btn").style.display = "none";
      $("refill-btn").style.display = "none";
      $("done-check").style.display = "none";
      $("done-msg").style.display = "none";
      $("progress-wrap").style.display = "";
    }
  }

  // File upload handling
  const dropZone = $("drop-zone");
  const fileInput = $("file-input");

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("drag-over"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  async function handleFile(file) {
    currentState = "loading";
    render();
    try {
      const data = await callLocalApi(file);
      persistData(data);
      currentState = "ready";
      render();
    } catch (err) {
      currentState = "error";
      GM_setValue("taxHelperError", err.message);
      $("error-box").textContent = err.message;
      render();
    }
  }

  // Error reset
  $("error-reset-btn").addEventListener("click", () => {
    currentState = "idle";
    render();
  });

  // Reset data
  $("reset-btn").addEventListener("click", () => {
    resetData();
    render();
  });

  // Fill button
  $("fill-btn").addEventListener("click", () => startFill(false));
  $("refill-btn").addEventListener("click", () => startFill(false));
  $("fill-next-btn").addEventListener("click", () => startFill(true));

  async function startFill(andNext) {
    if (!currentPageType || !taxData) return;
    currentState = "filling";
    fillProgress.current = 0;
    fillProgress.total = countFieldsForPage(currentPageType);
    render();

    const updateProgress = () => {
      fillProgress.current++;
      const pct =
        fillProgress.total > 0
          ? Math.round((fillProgress.current / fillProgress.total) * 100)
          : 100;
      $("progress-bar").style.width = pct + "%";
      $("progress-label").textContent =
        `Filling… ${fillProgress.current}/${fillProgress.total}`;
    };

    try {
      await fillPageFields(currentPageType, taxData, updateProgress);
      markPageFilled(currentPageType);
      if (andNext && currentPageType === "form2074Page510") {
        // Click "Suivant" to submit and advance to the next cession
        const suivant = document.querySelector(
          SELECTORS.form2074Page510.suivantBtn,
        );
        if (suivant) {
          await delay(200);
          suivant.click();
          return; // page will reload; the script re-initialises on the new page
        }
      }
      currentState = "done";
      render();
    } catch (err) {
      currentState = "error";
      $("error-box").textContent = err.message;
      GM_setValue("taxHelperError", err.message);
      showView("error");
    }
  }

  // Minimize
  let minimized = false;
  $("minimize-btn").addEventListener("click", () => {
    minimized = !minimized;
    $("body").style.display = minimized ? "none" : "";
    $("minimize-btn").textContent = minimized ? "+" : "−";
  });

  // Public: refresh page detection and re-render relevant parts
  function refresh() {
    currentPageType = detectPageType();
    updatePageIndicator();
    updateFillButton();
    // If we were in 'done' state for a different page, go back to 'ready'
    if (currentState === "done") {
      currentState = "ready";
      render();
    }
  }

  return { render, refresh };
}

// ─── SECTION I: NAVIGATION LISTENER ────────────────────────────────────────

let panelController = null;
let mutationDebounce = null;

function onNavigate() {
  if (panelController) panelController.refresh();
}

function onBodyMutation() {
  clearTimeout(mutationDebounce);
  mutationDebounce = setTimeout(onNavigate, 200);
}

// ─── SECTION J: ENTRY POINT ─────────────────────────────────────────────────

function main() {
  loadPersistedData();
  currentPageType = detectPageType();

  const { host, shadow } = createPanel();

  // Restore drag position
  const pos = loadPanelPosition();
  if (pos) {
    host.style.left = pos.x + "px";
    host.style.top = pos.y + "px";
    host.style.right = "auto";
  }

  document.body.appendChild(host);

  attachDrag(host, shadow.getElementById("drag-handle"));
  panelController = initPanel(shadow);
  panelController.render();

  window.addEventListener("popstate", onNavigate);
  window.addEventListener("hashchange", onNavigate);
  new MutationObserver(onBodyMutation).observe(document.body, {
    childList: true,
    subtree: false, // only direct children to avoid excessive firing
  });
}

main();
