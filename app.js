// Simple PWA-ready directory (prototype)
const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
let currentSort = 'address';
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const modalPhoto = document.getElementById('modalPhoto');
const modalName = document.getElementById('modalName');
const modalMeta = document.getElementById('modalMeta');
const callBtn = document.getElementById('callBtn');
const emailBtn = document.getElementById('emailBtn');

let residents = [];
let filtered = [];

function csvToRows(csvText){
  const lines = csvText.split(/\r?\n/).filter(l=>l.trim().length);
  const headers = lines[0].split(',').map(h=>h.trim());
  return lines.slice(1).map(line=>{
    // naive CSV parser: good enough for our fields (no commas expected)
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i)=>obj[h]= (cols[i]||'').trim());
    return obj;
  });
}

function getAddendumSplit(arr) {
  const main = arr.filter(r => Number(r.resident_id) <= 226);
  const addendum = arr.filter(r => Number(r.resident_id) >= 227);
  return { main, addendum };
}

function addressSortKey(addressRaw) {
  const a = (addressRaw || '').trim().toLowerCase();
  const m = a.match(/\d+/);
  const num = m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
  const street = a.replace(/^\s*\d+\s*/, '').trim();
  return { street, num };
}

function applySortToMainOnly(arr) {
  const { main, addendum } = getAddendumSplit(arr);

  if (currentSort === 'full_name') {
    main.sort((x, y) => (x.full_name || '').localeCompare((y.full_name || ''), undefined, { sensitivity: 'base' }));
  } else {
    main.sort((x, y) => {
      const ax = addressSortKey(x.address);
      const ay = addressSortKey(y.address);
      if (ax.street < ay.street) return -1;
      if (ax.street > ay.street) return 1;
      return ax.num - ay.num;
    });
  }

  return [...main, ...addendum];
}

async function loadData(){
  statusEl.textContent = 'Loading…';
  const res = await fetch('data/residents.csv', {cache:'no-store'});
  const text = await res.text();
  residents = csvToRows(text);
  residents = applySortToMainOnly(residents);

// Split residents and addendum
const mainResidents = residents.filter(r => Number(r.resident_id) <= 226);
const addendumResidents = residents.filter(r => Number(r.resident_id) >= 227);

// Default sort by address
mainResidents.sort((a,b) => {
  const numA = parseInt(a.address);
  const numB = parseInt(b.address);
  return numA - numB;
});

// Recombine
residents = [...mainResidents, ...addendumResidents];

filtered = residents.slice();
  filtered = residents;
  statusEl.textContent = `${residents.length} residents`;
  render();
}

function render(){
  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  filtered.forEach(r=>{
    const li = document.createElement('li');
    li.className = 'card';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.addEventListener('click', ()=>openProfile(r));
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
  });
  listEl.appendChild(frag);
}

function openProfile(r){
  modalName.textContent = r.full_name || '';
  modalPhoto.src = r.photo_profile || r.photo_thumb || '';
  modalMeta.textContent = [
    r.phone ? `Phone: ${r.phone}` : '',
    r.email ? `Email: ${r.email}` : '',
    r.resident_id ? `ResidentID: ${r.resident_id}` : ''
  ].filter(Boolean).join(' • ');

  callBtn.href = r.phone ? `tel:${r.phone}` : '#';
  callBtn.setAttribute('aria-disabled', r.phone ? 'false' : 'true');
  emailBtn.href = r.email ? `mailto:${r.email}` : '#';
  emailBtn.setAttribute('aria-disabled', r.email ? 'false' : 'true');

  if (typeof modal.showModal === 'function') modal.showModal();
  else alert(`${r.full_name}\n${modalMeta.textContent}`);
}

closeBtn.addEventListener('click', ()=>modal.close());
modal.addEventListener('click', (e)=>{
  const rect = modal.querySelector('.modal-inner').getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) modal.close();
});

searchEl.addEventListener('input', ()=>{
  const q = (searchEl.value || '').toLowerCase().trim();
  if(!q){ filtered = residents; statusEl.textContent = `${residents.length} residents`; render(); return; }
  filtered = residents.filter(r => (r.full_name||'').toLowerCase().includes(q));
  statusEl.textContent = `${filtered.length} match${filtered.length===1?'':'es'}`;
  render();
});

if (sortEl) {
  sortEl.value = currentSort;

  sortEl.addEventListener('change', () => {
    currentSort = sortEl.value || 'address';

    // Re-sort with new mode, keeping addendum fixed at the bottom
    residents = applySortToMainOnly(residents);

    // Re-apply search filter (if any), and keep addendum pinned in the filtered view too
    const q = (searchEl.value || '').trim().toLowerCase();
    if (!q) {
      filtered = residents.slice();
    } else {
      filtered = residents.filter(r => ((r.full_name || '').toLowerCase().includes(q)) || ((r.address || '').toLowerCase().includes(q)));
      filtered = applySortToMainOnly(filtered);
    }

    render();
  });
}

const sortEl = document.getElementById('sort');

if (sortEl){
  sortEl.addEventListener('change', () => {

    const mainResidents = residents.filter(r => Number(r.resident_id) <= 226);
    const addendumResidents = residents.filter(r => Number(r.resident_id) >= 227);

    if (sortEl.value === 'full_name'){
      mainResidents.sort((a,b)=>a.full_name.localeCompare(b.full_name));
    } else {
      mainResidents.sort((a,b)=>parseInt(a.address) - parseInt(b.address));
    }

    filtered = [...mainResidents, ...addendumResidents];
    render();
  });
}

// Register service worker (works when hosted over HTTPS / localhost)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

loadData();
