const listEl = document.getElementById('list');
const statusEl = document.getElementById('statusText') || document.getElementById('status');
const searchEl = document.getElementById('search');
const containerEl = document.querySelector('.container');

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const modalPhoto = document.getElementById('modalPhoto');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalMeta = document.getElementById('modalMeta');
const textBtn = document.getElementById('textBtn');
const callBtn = document.getElementById('callBtn');
const emailBtn = document.getElementById('emailBtn');
const connectionStatusEl = document.getElementById('connectionStatus');
const updateNotice = document.getElementById('updateNotice');
const reloadAppBtn = document.getElementById('reloadAppBtn');
const backToTopBtn = document.getElementById('backToTopBtn');
const topbar = document.querySelector('.topbar');
const topbarActions = document.querySelector('.topbar-actions');

let residents = [];
let filtered = [];
let currentSort = 'address';
let searchTimer;
let directoryStatusText = '';
let lastProfileTrigger = null;
let waitingServiceWorker = null;
let reloadAfterServiceWorkerUpdate = false;
let refreshingForUpdate = false;
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
  return (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function digitsOnly(s) {
  return (s || '').toString().replace(/\D/g, '');
}

function phoneLinkValue(s) {
  return (s || '').toString().trim().replace(/[^\d+]/g, '');
}

function cleanEmail(s) {
  return (s || '').toString().trim();
}

function searchTerms(query) {
  return norm(query).split(/\s+/).filter(Boolean);
}

function residentSearchText(r) {
  return [
    getName(r),
    getAddress(r),
    r.phone,
    r.email,
    digitsOnly(r.phone),
  ].map(norm).join(' ');
}

function residentMatchesSearch(r, query) {
  const terms = searchTerms(query);
  if (!terms.length) return true;

  const haystack = residentSearchText(r);
  return terms.every(term => {
    const numericTerm = digitsOnly(term);
    return haystack.includes(term) || (numericTerm && haystack.includes(numericTerm));
  });
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
    const cachedAt = new Date().toISOString();
    window.localStorage.setItem(residentsCsvCacheKey, text);
    window.localStorage.setItem(residentsCsvCachedAtKey, cachedAt);
    return cachedAt;
  } catch {}

  return '';
}

function cachedResidentsDate() {
  try {
    const cachedAt = window.localStorage.getItem(residentsCsvCachedAtKey);
    if (!cachedAt) return null;

    const date = new Date(cachedAt);
    if (Number.isNaN(date.getTime())) return null;

    return date;
  } catch {
    return null;
  }
}

function cachedResidentsLabel() {
  const date = cachedResidentsDate();
  if (!date) return 'offline cached copy';

  return `offline cached copy from ${date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

function dataUpdatedLabel() {
  const date = cachedResidentsDate();
  if (!date) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `Updated ${day} ${month} ${year}, ${hour}:${minute}`;
}

function updateDataUpdatedLabel() {
  if (!dataUpdatedEl) return;

  dataUpdatedEl.textContent = dataUpdatedLabel();
  dataUpdatedEl.classList.toggle('hidden', !dataUpdatedEl.textContent);
  updateInstallUi();
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

function setDirectoryStatus(text) {
  directoryStatusText = text;
  if (statusEl) statusEl.textContent = text;
}

function render() {
  if (!listEl) return;

  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  const validResidents = filtered.filter(r => getName(r) !== '');

  if (!validResidents.length) {
    const li = document.createElement('li');
    li.className = 'empty-state';

    if (searchEl && searchEl.value.trim()) {
      const message = document.createElement('div');
      message.textContent = 'No residents found';

      const clearBtn = document.createElement('button');
      clearBtn.className = 'empty-clear';
      clearBtn.type = 'button';
      clearBtn.textContent = 'Clear Search';
      clearBtn.addEventListener('click', () => {
        searchEl.value = '';
        applySearchAndRender();
        searchEl.focus();
      });

      li.appendChild(message);
      li.appendChild(clearBtn);
    } else {
      li.textContent = 'No residents to display';
    }

    frag.appendChild(li);
    listEl.appendChild(frag);
    return;
  }

  for (const r of validResidents) {
    const residentName = getName(r);
    if (!residentName) continue;

    const li = document.createElement('li');
    li.className = 'card';
    if (isIceResident(r)) li.classList.add('ice-card');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Open resident details for ${residentName}`);
    btn.addEventListener('click', () => openProfile(r, btn));

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

function openProfile(r, trigger) {
  lastProfileTrigger = trigger || null;
  const residentName = getName(r);
  const phoneHref = phoneLinkValue(r.phone);
  const emailHref = cleanEmail(r.email);

  modalTitle.textContent = `${getAddress(r) ? getAddress(r) + ' — ' : ''}${residentName}`;
  modalPhoto.alt = `Photo of ${residentName}`;

  setImageWithFallback(
    modalPhoto,
    photoCandidates(r, 'profile').concat(photoCandidates(r, 'thumb')),
    residentName
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
    textBtn.href = phoneHref ? `sms:${phoneHref}` : '#';
    textBtn.style.display = phoneHref ? '' : 'none';
    textBtn.setAttribute('aria-label', `Text ${residentName}`);
  }

  if (callBtn) {
    callBtn.href = phoneHref ? `tel:${phoneHref}` : '#';
    callBtn.style.display = phoneHref ? '' : 'none';
    callBtn.setAttribute('aria-label', `Call ${residentName}`);
  }

  if (emailBtn) {
    emailBtn.href = emailHref ? `mailto:${emailHref}` : '#';
    emailBtn.style.display = emailHref ? '' : 'none';
    emailBtn.setAttribute('aria-label', `Email ${residentName}`);
  }

  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
    if (closeBtn) closeBtn.focus();
    updateBackToTop();
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

  modal.addEventListener('close', () => {
    if (lastProfileTrigger && typeof lastProfileTrigger.focus === 'function') {
      lastProfileTrigger.focus();
    }
    lastProfileTrigger = null;
    updateBackToTop();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal && modal.open) {
    modal.close();
  }
});

async function loadData(options = {}) {
  const isRefresh = options.reason === 'refresh';

  try {
    if (statusEl) statusEl.textContent = isRefresh ? 'Refreshing data...' : 'Loading...';

    const res = await fetch('data/residents.csv', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load residents.csv (${res.status})`);

    const text = await res.text();
    saveCachedResidentsCsv(text);

    setResidentsFromCsv(text);
    updateDataUpdatedLabel();

    setDirectoryStatus(isRefresh ? `Refreshed - ${residents.length} residents` : `${residents.length} residents`);
    render();
    return 'live';
  } catch (error) {
    console.error(error);
    const cachedCsv = readCachedResidentsCsv();

    if (cachedCsv) {
      setResidentsFromCsv(cachedCsv);
      updateDataUpdatedLabel();
      setDirectoryStatus(isRefresh
        ? `Could not refresh - showing ${cachedResidentsLabel()}`
        : `${residents.length} residents - ${cachedResidentsLabel()}`
      );
    } else {
      residents = [];
      filtered = [];
      setDirectoryStatus('Unable to load residents directory.');
    }

    render();
    return cachedCsv ? 'cached' : 'failed';
  }
}

function updateSearchStatus(query) {
  if (!statusEl) return;

  if (!query) {
    statusEl.textContent = directoryStatusText || `${residents.length} residents`;
    return;
  }

  const count = filtered.length;
  statusEl.textContent = count === 1
    ? '1 matching resident'
    : `${count} matching residents`;
}

function scrollResultsToTop() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTarget = containerEl || document.scrollingElement || document.documentElement;
  scrollTarget.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

function applySearchAndRender() {
  const q = norm(searchEl?.value);

  if (!q) {
    filtered = residents.slice();
  } else {
    const matches = residents.filter(r => residentMatchesSearch(r, q));
    filtered = applySortKeepingAddendum(matches);
  }

  updateSearchStatus(q);
  render();
  scrollResultsToTop();
}

function focusSearchFromLaunch() {
  if (!searchEl) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('focus') !== 'search') return;

  searchEl.focus();
}

if (searchEl) {
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearchAndRender, 150);
  });

  searchEl.addEventListener('keydown', event => {
    if (event.key === 'Escape' && searchEl.value) {
      event.preventDefault();
      clearTimeout(searchTimer);
      searchEl.value = '';
      applySearchAndRender();
      return;
    }

    if (event.key !== 'Enter') return;

    clearTimeout(searchTimer);
    applySearchAndRender();

    const firstMatch = filtered.find(r => getName(r) !== '');
    if (!firstMatch) return;

    event.preventDefault();
    openProfile(firstMatch, searchEl);
  });
}

function updateConnectionStatus() {
  if (!connectionStatusEl) return;

  const offline = window.navigator.onLine === false;
  connectionStatusEl.textContent = offline ? 'Offline' : '';
  connectionStatusEl.classList.toggle('hidden', !offline);
  updateTopbarActionsVisibility();
  updateTopbarHeight();
}

function updateBackToTop() {
  if (!backToTopBtn) return;

  const scrollTarget = containerEl || document.scrollingElement || document.documentElement;
  const isNearTop = scrollTarget.scrollTop < 400;
  const modalOpen = Boolean(modal?.open);
  const updateNoticeVisible = Boolean(updateNotice && !updateNotice.classList.contains('hidden'));

  backToTopBtn.classList.toggle('hidden', isNearTop || modalOpen || updateNoticeVisible);
}

function updateTopbarActionsVisibility() {
  if (!topbarActions) return;

  const hasVisibleControl = Array.from(topbarActions.children).some(child => (
    !child.classList.contains('hidden')
  ));
  topbarActions.classList.toggle('hidden', !hasVisibleControl);
}

function updateTopbarHeight() {
  if (!topbar) return;

  document.documentElement.style.setProperty('--topbar-height', `${Math.ceil(topbar.offsetHeight)}px`);
}

function showUpdateNotice(worker) {
  waitingServiceWorker = worker;
  if (updateNotice) updateNotice.classList.remove('hidden');
  updateBackToTop();
}

function watchInstallingWorker(worker) {
  if (!worker) return;

  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      showUpdateNotice(worker);
    }
  });
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
if (containerEl) {
  containerEl.addEventListener('scroll', updateBackToTop, { passive: true });
} else {
  window.addEventListener('scroll', updateBackToTop, { passive: true });
}
window.addEventListener('resize', updateTopbarHeight);

if (topbar && 'ResizeObserver' in window) {
  new ResizeObserver(updateTopbarHeight).observe(topbar);
}

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', scrollResultsToTop);
}

if (reloadAppBtn) {
  reloadAppBtn.addEventListener('click', () => {
    if (!waitingServiceWorker) return;
    reloadAfterServiceWorkerUpdate = true;
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadAfterServiceWorkerUpdate || refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        if (registration.waiting) {
          showUpdateNotice(registration.waiting);
        }

        watchInstallingWorker(registration.installing);

        registration.addEventListener('updatefound', () => {
          watchInstallingWorker(registration.installing);
        });
      })
      .catch(() => {});
  });
}

updateConnectionStatus();
updateBackToTop();

// Add to Home Screen / Install App button
let deferredInstallPrompt = null;

const installBtn = document.getElementById('installBtn');
const printPdfBtn = document.getElementById('printPdfBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const refreshDataBtn = document.getElementById('refreshDataBtn');
const dataUpdatedEl = document.getElementById('dataUpdated');
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

function fitDesktopAppWindow() {
  const isDesktop = window.matchMedia('(pointer: fine)').matches && window.screen?.availWidth >= 800;
  if (!isDesktop || isInStandaloneMode()) return;

  const appContentWidth = 460;
  const horizontalChrome = Math.max(0, window.outerWidth - window.innerWidth);
  const targetWidth = Math.min(window.screen.availWidth, appContentWidth + horizontalChrome);
  const targetHeight = window.screen.availHeight;
  const targetLeft = window.screen.availLeft || 0;
  const targetTop = window.screen.availTop || 0;

  try {
    window.moveTo(targetLeft, targetTop);
    window.resizeTo(targetWidth, targetHeight);
  } catch {}
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

function forgetRememberedInstall() {
  try {
    window.localStorage.removeItem(installStateKey);
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
  if (dataUpdatedEl) dataUpdatedEl.classList.toggle('hidden', !dataUpdatedEl.textContent);
  updateTopbarActionsVisibility();
  updateTopbarHeight();
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
  } catch {
    pdfDocumentVersion = '';
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
    const originalLabel = refreshDataBtn.textContent;

    refreshDataBtn.disabled = true;
    refreshDataBtn.textContent = 'Refreshing...';

    try {
      await loadData({ reason: 'refresh' });
      await loadPdfMetadata();

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) registration.update().catch(() => {});
      }
    } finally {
      refreshDataBtn.disabled = false;
      refreshDataBtn.textContent = originalLabel;
    }
  });
}

if (installBtn) {
  if (new URLSearchParams(window.location.search).has('reset-install')) {
    forgetRememberedInstall();
  }

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

    if (confirm('To add this Residents Directory to your Home Screen:\n\nUse your browser menu and choose Add to Home screen or Install app.\n\nIf you have already installed it, click OK now to show the installed-app controls.\n\nIf you have not installed it yet, click Cancel and install it from your browser menu first.')) {
      rememberInstall();
      updateInstallUi();
    }
  });

  window.addEventListener('appinstalled', () => {
    rememberInstall();
    updateInstallUi();
    deferredInstallPrompt = null;
  });
}

window.addEventListener('load', fitDesktopAppWindow, { once: true });
loadData().then(focusSearchFromLaunch);
