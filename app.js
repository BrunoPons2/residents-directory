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
let currentSort = 'default';

function csvToRows(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length);
  if (!lines.length) return [];

  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map(h => h.trim().replace(/^\uFEFF/, ''));

  return lines.slice(1).map(line => {
    const cols = line.split(delim);
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
  return (r?.full_name || '').toString().trim();
}

function getAddress(r) {
  return (r?.Address || '').toString().trim();
}

function addressNumber(addressRaw) {
  const m = String(addressRaw || '').match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
}

function photoCandidates(r, kind) {
  const fromCsv = kind === 'profile' ? r.photo_profile : r.photo_thumb;
  return fromCsv ? [fromCsv] : [];
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
      if (na !== nb) return na - nb;
      return getName(a).localeCompare(getName(b), undefined, { sensitivity: 'base' });
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

function render() {
  if (!listEl) return;

  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const r of filtered) {
    const name = (r.full
    if (!getName(r)) continue;
    
    const li = document.createElement('li');
    li.className = 'card';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.addEventListener('click', () => openProfile(r));

    const img = document.createElement('img');
    img.className = 'avatar';
    img.alt = '';
    img.loading = 'lazy';
    setImageWithFallback(img, photoCandidates(r, 'thumb'));
    btn.appendChild(img);

    const row = document.createElement('div');
    row.className = 'row';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = `${getName(r) || '(no name)'}${getAddress(r) ? ' — ' + getAddress(r) : ''}`;

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
  modalTitle.textContent = `${getName(r) || ''}${getAddress(r) ? ' — ' + getAddress(r) : ''}`;

  setImageWithFallback(
    modalPhoto,
    photoCandidates(r, 'profile').concat(photoCandidates(r, 'thumb'))
  );

  const bits = [];
  if (r.phone) bits.push(r.phone);
  if (r.email) bits.push(r.email);
  modalSub.textContent = bits.join(' • ');

  if (modalMeta) {
    modalMeta.textContent = '';
    modalMeta.style.display = 'none';
  }

  callBtn.href = r.phone ? `tel:${r.phone}` : '#';
  emailBtn.href = r.email ? `mailto:${r.email}` : '#';

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  }
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => modal.close());
}

async function loadData() {
  if (statusEl) statusEl.textContent = 'Loading…';

  const res = await fetch('data/residents.csv', { cache: 'no-store' });
  const text = await res.text();

  residents = csvToRows(text).filter(r => {
  const name = (r.full_name || '').trim();
  const phone = (r.phone || '').trim();
  const email = (r.email || '').trim();
  return name !== '' || phone !== '' || email !== '';
});
  .filter(r => (r.full_name || '').trim() !== '');

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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

loadData();
