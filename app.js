// Simple PWA-ready directory (prototype)
const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');

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

async function loadData(){
  statusEl.textContent = 'Loading…';
  const res = await fetch('data/residents.csv', {cache:'no-store'});
  const text = await res.text();
  residents = csvToRows(text);
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

// Register service worker (works when hosted over HTTPS / localhost)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

loadData();
