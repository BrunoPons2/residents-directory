const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const modalPhoto = document.getElementById('modalPhoto');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalMeta = document.getElementById('modalMeta');
const callBtn = document.getElementById('callBtn');
const emailBtn = document.getElementById('emailBtn');

let residents = [];
let filtered = [];
let currentSort = 'default'; // DEFAULT on load = resident_id

function csvToRows(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) return [];

  // Detect delimiter: TAB if present, else comma
  const delim = lines[0].includes('\t') ? '\t' : ',';

  const headers = lines[0].split(delim).map(h => h.trim());

  return lines.slice(1).map(line => {
    const cols = line.split(delim);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] || '').trim()));
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
  return (r?.full_name || '').toString().trim();
}
function getAddress(r) {
  // Your header uses capital A: Address
  return (r?.Address || '').toString().trim();
}

function slugifyName(name) {
  return (name || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function (r, kind) {

  const folder = kind === 'profile'
    ? 'photos/profile/'
    : 'photos/thumb/';

  const id = Number(r.resident_id);
  const full = r.full_name || '';
  const slug = slugifyName(full);

  const fromCsv = kind === 'profile'
    ? r.photo_profile
    : r.photo_thumb;

  const list = [];

  if (fromCsv) list.push(fromCsv);                     // CSV path
  if (Number.isFinite(id)) list.push(folder + id + '.jpg');      // 1.jpg
  if (Number.isFinite(id)) list.push(folder + (id + 1000) + '.jpg'); // 1001.jpg
  if (slug) list.push(folder + slug + '.jpg');         // cheryl-hall.jpg

  return list;
}

function setImageWithFallback(img, candidates) {
  const valid = (candidates || []).filter(Boolean);

  img.onerror = null;

  if (!valid.length) {
    img.removeAttribute('src');
    img.style.display = 'none';
    return;
  }

  img.style.display = '';
  let i = 0;

  function tryNext() {
    if (i >= valid.length) {
      img.removeAttribute('src');
      img.style.display = 'none';
      return;
    }

    img.onerror = function () {
      i++;
      tryNext();
    };

    img.src = valid[i];
  }

  tryNext();
}

function addressNumber(addressRaw) {
  const m = String(addressRaw || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
}

// Main: 1–226, Addendum: 227–242 pinned at bottom, never sorted
function splitMainAddendum(arr) {
  const main = [];
  const addendum = [];
  for (const r of arr) {
    const id = getId(r);
    if (Number.isFinite(id) && id >= 227 && id <= 242) addendum.push(r);
    else main.push(r);
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
      if (na !== nb) return na - nb;
      // tie-breaker: name (keeps 2–4 people at same address stable)
      return getName(a).localeCompare(getName(b), undefined, { sensitivity: 'base' });
    });
    return;
  }

  // default
  mainArr.sort((a, b) => {
    const ia = getId(a);
    const ib = getId(b);
    // keep non-numeric IDs at the bottom of the MAIN block (shouldn't happen, but safe)
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

function render() {
  if (!listEl) return;
  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const r of filtered) {
    const li = document.createElement('li');
    li.className = 'card';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.addEventListener('click', () => openProfile(r));

    const img = document.createElement('img');
    img.className = 'avatar';
    img.alt = '';
    img.loading = 'lazy';
    setImageWithFallback(img, [r.photo_thumb]);
    btn.appendChild(img);

    const row = document.createElement('div');
    row.className = 'row';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${getAddress(r) || ''}${getAddress(r) && getName(r) ? ' - ' : ''}${getName(r) || '(no name)'}`;

    row.appendChild(name);

    btn.appendChild(row);
    li.appendChild(btn);
    frag.appendChild(li);
  }

  listEl.appendChild(frag);
}
function openProfile(r) {
  modalTitle.textContent = `${getName(r) || ''}${getAddress(r) ? ' — ' + getAddress(r) : ''}`;

  setImageWithFallback(
  modalPhoto,
  [r.photo_profile, r.photo_thumb]
  );

  const bits = [];
  if (r.phone) bits.push(r.phone);
  if (r.email) bits.push(r.email);
  modalSub.textContent = bits.join(' • ');

  if (modalMeta) modalMeta.textContent = '';

  callBtn.href = r.phone ? `tel:${r.phone}` : '#';
  emailBtn.href = r.email ? `mailto:${r.email}` : '#';

  if (typeof modal.showModal === 'function') modal.showModal();
}

if (closeBtn) closeBtn.addEventListener('click', () => modal.close());

async function loadData() {
  if (statusEl) statusEl.textContent = 'Loading…';

  // always fetch latest data
  const res = await fetch('data/residents.csv', { cache: 'no-store' });
  const text = await res.text();

  residents = csvToRows(text);
  residents = applySortKeepingAddendum(residents);

  filtered = residents.slice();
  if (statusEl) statusEl.textContent = `${residents.length} residents`;
  render();
}

if (searchEl) {
  searchEl.addEventListener('input', () => {
    const q = norm(searchEl.value);
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
  });
}

if (sortEl) {
  sortEl.value = currentSort;
  sortEl.addEventListener('change', () => {
    currentSort = sortEl.value || 'default';

    residents = applySortKeepingAddendum(residents);

    // Keep current search applied
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
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

loadData();
