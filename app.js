const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');

const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const modalPhoto = document.getElementById('modalPhoto');
const modalName = document.getElementById('modalName');
const modalMeta = document.getElementById('modalMeta');
const callBtn = document.getElementById('callBtn');
const emailBtn = document.getElementById('emailBtn');

let residents = [];
let filtered = [];
let currentSort = 'address';

// Naive CSV parser (OK because your fields are comma-free)
function csvToRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length);
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] || '').trim()));
    return obj;
  });
}

function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

function addressSortKey(addressRaw) {
  const a = norm(addressRaw);
  const m = a.match(/\d+/);
  const num = m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
  const street = a.replace(/^\s*\d+\s*/, '').trim();
  return { street, num };
}

function splitMainAddendum(arr) {
  const main = [];
  const addendum = [];

  for (const r of arr) {
    const id =
      Number(r.resident_id) ||
      Number(r.ResidentID) ||
      Number(r.residentId) ||
      0;

    if (id >= 227 && id <= 242) {
      addendum.push(r);
    } else {
      main.push(r);
    }
  }

  return { main, addendum };
}

// ResidentID 1–226 sortable, 227–242 fixed addendum at bottom
function splitMainAddendum(arr) {
  const main = [];
  const addendum = [];
  for (const r of arr) {
    const id = Number(r.resident_id);
    if (id >= 227) addendum.push(r);
    else main.push(r);
  }
  return { main, addendum };
}

function applySortKeepingAddendum(arr) {

  const { main, addendum } = splitMainAddendum(arr);

  if (currentSort === 'full_name') {

    main.sort((a, b) =>
      (a.full_name || '').localeCompare(b.full_name || '', undefined, { sensitivity: 'base' })
    );

  } else {

    main.sort((a, b) => {

      const ax = addressSortKey(a.address);
      const ay = addressSortKey(b.address);

      if (ax.street < ay.street) return -1;
      if (ax.street > ay.street) return 1;

      return ax.num - ay.num;

    });

  }

  return [...main, ...addendum];
}

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
    img.src = r.photo_thumb ? r.photo_thumb : '';
    btn.appendChild(img);

    const row = document.createElement('div');
    row.className = 'row';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = r.full_name || '(no name)';

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
  modalName.textContent = r.full_name || '';
  modalPhoto.src = r.photo_profile || r.photo_thumb || '';
  modalMeta.textContent = [
    r.phone ? `Phone: ${r.phone}` : '',
    r.email ? `Email: ${r.email}` : '',
    r.address ? `Address: ${r.address}` : '',
    r.resident_id ? `ResidentID: ${r.resident_id}` : ''
  ].filter(Boolean).join(' • ');

  callBtn.href = r.phone ? `tel:${r.phone}` : '#';
  emailBtn.href = r.email ? `mailto:${r.email}` : '#';

  if (typeof modal.showModal === 'function') modal.showModal();
}

if (closeBtn) closeBtn.addEventListener('click', () => modal.close());

async function loadData() {
  if (statusEl) statusEl.textContent = 'Loading…';

  // You already wanted no-store for the CSV (keep it)
  const res = await fetch('data/residents.csv', { cache: 'no-store' });
  const text = await res.text();

  residents = csvToRows(text);

// Keep addendum (227–242) always at the bottom (never sorted)
const mainResidents = residents.filter(r => Number(r.resident_id) <= 226);
const addendumResidents = residents.filter(r => Number(r.resident_id) >= 227 && Number(r.resident_id) <= 242);

// Apply the current sort to MAIN only (address sort won't do anything until address exists)
if (currentSort === 'full_name') {
  mainResidents.sort((a, b) =>
    (a.full_name || '').localeCompare((b.full_name || ''), undefined, { sensitivity: 'base' })
  );
}

residents = [...mainResidents, ...addendumResidents];
filtered = residents.slice();
  
  residents = applySortKeepingAddendum(residents);
  filtered = residents.slice();

  if (statusEl) statusEl.textContent = `${residents.length} residents`;
  render();
}

// Search
if (searchEl) {
  searchEl.addEventListener('input', () => {
    const q = norm(searchEl.value);
    if (!q) {
      filtered = residents.slice();
    } else {
      const matches = residents.filter(r =>
        norm(r.full_name).includes(q) || norm(r.address).includes(q) || norm(r.phone).includes(q) || norm(r.email).includes(q)
      );
      filtered = applySortKeepingAddendum(matches);
    }
    render();
  });
}

// Sort dropdown
if (sortEl) {
  sortEl.value = currentSort;
  sortEl.addEventListener('change', () => {
    currentSort = sortEl.value || 'address';
    residents = applySortKeepingAddendum(residents);
    // reapply current search
    const q = norm(searchEl?.value);
    if (!q) filtered = residents.slice();
    else filtered = applySortKeepingAddendum(residents.filter(r => norm(r.full_name).includes(q) || norm(r.address).includes(q)));
    render();
  });
}

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

loadData();
