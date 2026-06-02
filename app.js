const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const modalPhoto = document.getElementById('modalPhoto');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalMeta = document.getElementById('modalMeta');
const textBtn = document.getElementById('textBtn');
const callBtn = document.getElementById('callBtn');
const emailBtn = document.getElementById('emailBtn');

let residents = [];
let filtered = [];
let currentSort = 'address';
let searchTimer;
const residentsCsvCacheKey = 'residentsDirectoryCsvCache';
const residentsCsvCachedAtKey = 'residentsDirectoryCsvCachedAt';

function csvToRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const delim = text.slice(0, text.indexOf('\n')).includes('\t') ? '\t' : ',';

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delim && !inQuotes) {
      row.push(field.trim());
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(value => value !== '')) rows.push(row);
  if (!rows.length) return [];

  const headers = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));

  return rows.slice(1).map(cols => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] || '').trim();
    });
    return obj;
  });
}

function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

function getId(r) {
  const n = Number(String(r?.resident_id ?? '').trim());
  return Number.isFinite(n) ? n : NaN;
}

function getName(r) {
  return (r?.full_name || r?.fullname || r?.name || '').toString().trim();
}

function getAddress(r) {
  return (r?.Address || r?.address || '').toString().trim();
}

function isIceResident(r) {
  return /^ICE:/i.test(getName(r));
}

function addressNumber(addressRaw) {
  const m = String(addressRaw || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
}

function photoCandidates(r, kind) {
  const fromCsv = kind === 'profile' ? r.photo_profile : r.photo_thumb;
  return fromCsv ? [fromCsv] : [];
}

function residentInitials(name) {
  const cleaned = String(name || '')
    .replace(/^ICE:\s*/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (!parts.length) return '?';

  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

function initialsColor(name) {
  const colors = ['#245c73', '#6a4f9b', '#2f6f5e', '#8a4d32', '#6b5b2f', '#5c6f2f'];
  const text = String(name || '');
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash + text.charCodeAt(i) * (i + 1)) % colors.length;
  }

  return colors[hash];
}

function initialsPlaceholder(name) {
  const initials = residentInitials(name);
  const background = initialsColor(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="${background}"/><text x="48" y="55" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff">${initials}</text></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function setImageWithFallback(img, candidates, fallbackName) {
  const valid = (candidates || []).filter(Boolean);
  img.onerror = null;

  if (!valid.length) {
    img.src = initialsPlaceholder(fallbackName);
    img.style.display = '';
    return;
  }

  img.style.display = '';
  let i = 0;

  function tryNext() {
    if (i >= valid.length) {
      img.src = initialsPlaceholder(fallbackName);
      img.style.display = '';
      return;
    }

    img.onerror = function () {
      i += 1;
      tryNext();
    };

    img.src = valid[i];
  }

  tryNext();
}

function splitMainAddendum(arr) {
  const main = [];
  const addendum = [];

  for (const r of arr) {
    const id = getId(r);
    if (Number.isFinite(id) && id >= 227 && id <= 242) {
      addendum.push(r);
    } else {
      main.push(r);
    }
  }

  return { main, addendum };
}

function sortMain(mainArr) {
  if (currentSort === 'full_name') {
    mainArr.sort((a, b) =>
      getName(a).localeCompare(getName(b), undefined, { sensitivity: 'base' })
    );
    return;
  }

  if (currentSort === 'address') {
    mainArr.sort((a, b) => {
      const na = addressNumber(getAddress(a));
      const nb = addressNumber(getAddress(b));
      return na - nb;
    });
    return;
  }

  mainArr.sort((a, b) => {
    const ia = getId(a);
    const ib = getId(b);

    if (!Number.isFinite(ia) && !Number.isFinite(ib)) return 0;
    if (!Number.isFinite(ia)) return 1;
    if (!Number.isFinite(ib)) return -1;
    return ia - ib;
  });
}

function applySortKeepingAddendum(arr) {
  const { main, addendum } = splitMainAddendum(arr);
  sortMain(main);
  return [...main, ...addendum];
}

function readCachedResidentsCsv() {
  try {
    return window.localStorage.getItem(residentsCsvCacheKey) || '';
  } catch {
    return '';
  }
}

function saveCachedResidentsCsv(text) {
  try {
    window.localStorage.setItem(residentsCsvCacheKey, text);
    window.localStorage.setItem(residentsCsvCachedAtKey, new Date().toISOString());
  } catch {}
}

function cachedResidentsLabel() {
  try {
    const cachedAt = window.localStorage.getItem(residentsCsvCachedAtKey);
    if (!cachedAt) return 'offline cached copy';

    const date = new Date(cachedAt);
    if (Number.isNaN(date.getTime())) return 'offline cached copy';

    return `offline cached copy from ${date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  } catch {
    return 'offline cached copy';
  }
}

function setResidentsFromCsv(text) {
  residents = csvToRows(text).filter(r => {
    const name = getName(r);
    const phone = (r.phone || '').trim();
    const email = (r.email || '').trim();
    return name !== '' || phone !== '' || email !== '';
  });

  residents = applySortKeepingAddendum(residents);
  filtered = residents.slice();
}

function render() {
  if (!listEl) return;

  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  const validResidents = filtered.filter(r => getName(r) !== '');

  for (const r of validResidents) {
    const residentName = getName(r);
    if (!residentName) continue;

    const li = document.createElement('li');
    li.className = 'card';
    if (isIceResident(r)) li.classList.add('ice-card');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.addEventListener('click', () => openProfile(r));

    const img = document.createElement('img');
    img.className = 'avatar';
    img.alt = '';
    img.loading = 'lazy';
    setImageWithFallback(img, photoCandidates(r, 'thumb'), residentName);
    btn.appendChild(img);

    if (isIceResident(r)) {
      const badge = document.createElement('span');
      badge.className = 'ice-badge';
      badge.textContent = 'ICE';
      btn.appendChild(badge);
    }

    const row = document.createElement('div');
    row.className = 'row';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${getAddress(r) ? getAddress(r) + ' — ' : ''}${residentName}`;

    const sub = document.createElement('div');
    sub.className = 'sub';
    const bits = [];
    if (r.phone) bits.push(r.phone);
    if (r.email) bits.push(r.email);
    sub.textContent = bits.join(' • ');

    row.appendChild(name);
    row.appendChild(sub);

    btn.appendChild(row);
    li.appendChild(btn);
    frag.appendChild(li);
  }

  listEl.appendChild(frag);
}

function openProfile(r) {
  modalTitle.textContent = `${getAddress(r) ? getAddress(r) + ' — ' : ''}${getName(r)}`;

  setImageWithFallback(
    modalPhoto,
    photoCandidates(r, 'profile').concat(photoCandidates(r, 'thumb')),
    getName(r)
  );

  const bits = [];
  if (r.phone) bits.push(r.phone);
  if (r.email) bits.push(r.email);
  modalSub.textContent = bits.join(' • ');

  if (modalMeta) {
    modalMeta.textContent = '';
    modalMeta.style.display = 'none';
  }

  if (textBtn) {
    textBtn.href = r.phone ? `sms:${r.phone}` : '#';
    textBtn.style.display = r.phone ? '' : 'none';
  }

  if (callBtn) {
    callBtn.href = r.phone ? `tel:${r.phone}` : '#';
    callBtn.style.display = r.phone ? '' : 'none';
  }

  if (emailBtn) {
    emailBtn.href = r.email ? `mailto:${r.email}` : '#';
    emailBtn.style.display = r.email ? '' : 'none';
  }

  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
  }
}

if (closeBtn && modal) {
  closeBtn.addEventListener('click', () => modal.close());
}

if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.close();
    }
  });

  modal.addEventListener('cancel', () => {
    modal.close();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal && modal.open) {
    modal.close();
  }
});

async function loadData() {
  try {
    if (statusEl) statusEl.textContent = 'Loading…';

    const res = await fetch('data/residents.csv', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load residents.csv (${res.status})`);

    const text = await res.text();
    saveCachedResidentsCsv(text);

    setResidentsFromCsv(text);

    if (statusEl) statusEl.textContent = `${residents.length} residents`;
    render();
  } catch (error) {
    console.error(error);
    const cachedCsv = readCachedResidentsCsv();

    if (cachedCsv) {
      setResidentsFromCsv(cachedCsv);
      if (statusEl) statusEl.textContent = `${residents.length} residents - ${cachedResidentsLabel()}`;
    } else {
      residents = [];
      filtered = [];
      if (statusEl) statusEl.textContent = 'Unable to load residents directory.';
    }

    render();
  }
}

function applySearchAndRender() {
  const q = norm(searchEl?.value);

  if (!q) {
    filtered = residents.slice();
  } else {
    const matches = residents.filter(r =>
      norm(getName(r)).includes(q) ||
      norm(getAddress(r)).includes(q) ||
      norm(r.phone).includes(q) ||
      norm(r.email).includes(q)
    );
    filtered = applySortKeepingAddendum(matches);
  }

  render();
}

if (searchEl) {
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearchAndRender, 150);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
// Add to Home Screen / Install App button
let deferredInstallPrompt = null;

const installBtn = document.getElementById('installBtn');
const printPdfBtn = document.getElementById('printPdfBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const refreshDataBtn = document.getElementById('refreshDataBtn');
const pdfUpdatedEl = document.getElementById('pdfUpdated');
const installStateKey = 'residentsDirectoryInstalled';
const pdfDocumentUrl = 'documents/residents-directory-hard-copy.pdf';
const pdfMetadataUrl = 'documents/residents-directory-hard-copy.json';
let pdfDocumentVersion = '';

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function hasRememberedInstall() {
  try {
    return window.localStorage.getItem(installStateKey) === 'yes';
  } catch {
    return false;
  }
}

function rememberInstall() {
  try {
    window.localStorage.setItem(installStateKey, 'yes');
  } catch {}
}

function shouldHideInstallButton() {
  return isInStandaloneMode() || hasRememberedInstall();
}

function updateInstallUi() {
  const installed = shouldHideInstallButton();
  if (installBtn) installBtn.classList.toggle('hidden', installed);
  if (printPdfBtn) printPdfBtn.classList.toggle('hidden', !installed);
  if (downloadPdfBtn) downloadPdfBtn.classList.toggle('hidden', !installed);
  if (refreshDataBtn) refreshDataBtn.classList.toggle('hidden', !installed);
  if (pdfUpdatedEl) pdfUpdatedEl.classList.toggle('hidden', !installed || !pdfUpdatedEl.textContent);
}

function currentPdfUrl() {
  const version = pdfDocumentVersion || Date.now().toString();
  return `${pdfDocumentUrl}?v=${encodeURIComponent(version)}`;
}

function updatePdfDownloadUrl() {
  if (downloadPdfBtn) downloadPdfBtn.href = currentPdfUrl();
}

async function loadPdfMetadata() {
  try {
    const res = await fetch(pdfMetadataUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load PDF metadata (${res.status})`);

    const meta = await res.json();
    pdfDocumentVersion = meta.generatedAt || '';
    if (pdfUpdatedEl) pdfUpdatedEl.textContent = meta.generatedDisplay ? `PDF updated ${meta.generatedDisplay}` : '';
  } catch {
    pdfDocumentVersion = '';
    if (pdfUpdatedEl) pdfUpdatedEl.textContent = '';
  }

  updatePdfDownloadUrl();
  updateInstallUi();
}

function printPdfDocument() {
  const printFrameId = 'residentPdfPrintFrame';
  const existingFrame = document.getElementById(printFrameId);
  if (existingFrame) existingFrame.remove();

  const frame = document.createElement('iframe');
  frame.id = printFrameId;
  frame.src = currentPdfUrl();
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '1px';
  frame.style.height = '1px';
  frame.style.border = '0';

  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch {
      window.open(currentPdfUrl(), '_blank', 'noopener');
    }
  };

  document.body.appendChild(frame);
}

if (downloadPdfBtn) {
  updatePdfDownloadUrl();
}

if (printPdfBtn) {
  printPdfBtn.addEventListener('click', printPdfDocument);
}

if (refreshDataBtn) {
  refreshDataBtn.addEventListener('click', async () => {
    await loadData();
    await loadPdfMetadata();

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) registration.update().catch(() => {});
    }
  });
}

if (installBtn) {
  updateInstallUi();
  loadPdfMetadata();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUi();
  });

  installBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();

      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;

      if (choice && choice.outcome === 'accepted') {
        rememberInstall();
        updateInstallUi();
      }

      return;
    }

    if (isIosDevice()) {
      alert('To add this Residents Directory to your Home Screen:\n\n1. Open this page in Safari.\n2. Tap the Share button.\n3. Tap Add to Home Screen.\n4. Tap Add.');
      return;
    }

    alert('To add this Residents Directory to your Home Screen:\n\nUse your browser menu and choose Add to Home screen or Install app.');
  });

  window.addEventListener('appinstalled', () => {
    rememberInstall();
    updateInstallUi();
    deferredInstallPrompt = null;
  });
}
loadData();
