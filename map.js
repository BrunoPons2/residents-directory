(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const map = byId('villageMap'), svg = byId('mapSvg'), viewport = byId('mapViewport');
  const search = byId('mapSearch'), results = byId('mapResults'), household = byId('mapHousehold');
  const status = byId('mapStatus'), profileMap = byId('mapBtn');
  let houses = [], currentResident = null, ready = null, origin = null;
  let view = {x:0,y:0,size:1600};
  const pointers = new Map();
  let gesture = null, moved = false;
  const houseNumber = r => {
    const match = getAddress(r).match(/^\s*(\d+)\b/);
    const n = match ? Number(match[1]) : null;
    return houses.some(h => h.number === n) ? n : null;
  };
  const occupants = n => residents.filter(r => !isIceResident(r) && houseNumber(r) === n);
  function label(n) {
    const entries = occupants(n);
    const h = houses.find(h => h.number === n);
    return entries.length ? getAddress(entries[0]) : `House ${n}${h ? ' — ' + h.mapStreet : ''}`;
  }
  function draw() {
    const margin = 100;
    view.x = Math.max(-margin, Math.min(1600-view.size+margin,view.x));
    view.y = Math.max(-margin, Math.min(1600-view.size+margin,view.y));
    svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.size} ${view.size}`);
  }
  function fit() {view = {x:0,y:0,size:1600};draw();}
  function zoom(factor, anchor = {x:view.x+view.size/2,y:view.y+view.size/2}) {
    const size = Math.max(260,Math.min(1600,view.size*factor));
    const ratio = size/view.size;
    view.x = anchor.x-(anchor.x-view.x)*ratio;
    view.y = anchor.y-(anchor.y-view.y)*ratio;
    view.size=size;draw();
  }
  // Keep the point beneath the mouse stationary, including in a letterboxed SVG.
  viewport.addEventListener('wheel',event=>{
    if(!map.open || pointers.size || !event.deltaY)return;
    const matrix=svg.getScreenCTM();
    if(!matrix)return;
    event.preventDefault();
    const anchor=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const unit=event.deltaMode===1 ? 16 : event.deltaMode===2 ? viewport.clientHeight : 1;
    const factor=Math.exp(Math.max(-0.2,Math.min(0.2,event.deltaY*unit*0.0007)));
    zoom(factor,anchor);
  },{passive:false});
  function select(n, focusHouse = true) {
    const h=houses.find(h=>h.number===n);if(!h)return;
    svg.querySelectorAll('.map-plot').forEach(el=>el.classList.toggle('selected',Number(el.dataset.number)===n));
    if(focusHouse){view={x:h.x+h.width/2-210,y:h.y+h.height/2-210,size:420};draw();}
    household.replaceChildren();
    const title=document.createElement('h3');title.textContent=label(n);household.append(title);
    const entries=occupants(n);
    if(!entries.length){const p=document.createElement('p');p.textContent='No resident details listed';household.append(p);}
    entries.forEach(r=>{
      const button=document.createElement('button');button.type='button';button.textContent=getName(r);
      button.addEventListener('click',()=>{
        // Reopen the shared profile above the map, preserving the map view below it.
        if(modal.open)modal.close();
        setTimeout(()=>openProfile(r,button),0);
      });household.append(button);
    });
    status.textContent=`${label(n)} — ${entries.length ? `${entries.length} listed resident${entries.length===1?'':'s'}` : 'No resident details listed'}`;
  }
  async function load() {
    const response=await fetch('maps/houses.json');if(!response.ok)throw new Error('Map locations unavailable');
    const data=await response.json();houses=data.houses;
    houses.forEach(h=>{
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      for(const key of ['x','y','width','height'])rect.setAttribute(key,h[key]);
      rect.dataset.number=h.number;rect.setAttribute('class','map-plot');rect.setAttribute('role','button');rect.setAttribute('tabindex','0');rect.setAttribute('aria-label',`House ${h.number}`);
      rect.addEventListener('click',()=>{if(!moved)select(h.number);});
      rect.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(h.number);}});
      rect.addEventListener('focus',()=>{if(map.open && rect.matches(':focus-visible'))select(h.number,true);});svg.append(rect);
    });
    updateProfileButton();status.textContent='Select a house or search above. Drag to pan; scroll, pinch or use + and − to zoom.';
  }
  function updateProfileButton(){profileMap.hidden=!currentResident||houseNumber(currentResident)===null;}
  async function open(r,trigger) {
    if(map.open){if(modal.open)modal.close();map.focus();return;}
    origin=trigger;search.value='';results.replaceChildren();map.showModal();updateBackToTop();
    try{await (ready ||= load());if(r&&houseNumber(r)!==null)select(houseNumber(r));else{fit();household.replaceChildren();}}
    catch(error){ready=null;status.textContent='Unable to load the village map. Close and reopen to retry.';}
    search.focus();
  }
  window.addEventListener('resident-profile-open',event=>{currentResident=event.detail;updateProfileButton();});
  // Load coordinates early so Map is available when the first profile opens.
  ready=load().catch(()=>{ready=null;});
  profileMap.addEventListener('click',()=>open(currentResident,profileMap));
  byId('villageMapBtn').addEventListener('click',event=>open(null,event.currentTarget));
  byId('closeMap').addEventListener('click',()=>map.close());
  map.addEventListener('click',event=>{if(event.target===map){const b=map.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)map.close();}});
  map.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
  map.addEventListener('close',()=>{pointers.clear();gesture=null;updateBackToTop();if(origin?.isConnected)origin.focus();});
  byId('mapZoomIn').addEventListener('click',()=>zoom(.75));byId('mapZoomOut').addEventListener('click',()=>zoom(1.333333));byId('mapFit').addEventListener('click',fit);
  search.addEventListener('input',()=>{
    results.replaceChildren();const q=norm(search.value);if(!q)return;
    let matches;
    if(/^\d+$/.test(q))matches=houses.filter(h=>h.number===Number(q));
    else {
      const terms=searchTerms(q);
      const addressNorm=s=>norm(s).replace(/\bstreet\b/g,'st').replace(/\bdrive\b/g,'drv').replace(/\bavenue\b/g,'ave').replace(/\broad\b/g,'rd');
      matches=houses.filter(h=>{const haystacks=[`${h.number} ${h.mapStreet}`, ...h.addresses, ...occupants(h.number).map(r=>`${getName(r)} ${getAddress(r)}`)];return haystacks.some(text=>terms.every(t=>/^\d+$/.test(t) ? h.number===Number(t) : addressNorm(text).includes(addressNorm(t))));});
    }
    if(!matches.length){results.textContent='No matching houses or residents found.';return;}
    matches.forEach(h=>{const b=document.createElement('button');b.type='button';b.textContent=`${label(h.number)}${occupants(h.number).length?' — '+occupants(h.number).map(getName).join(', '):''}`;b.addEventListener('click',()=>{select(h.number);results.replaceChildren();viewport.focus();});results.append(b);});
  });
  search.addEventListener('keydown',event=>{if(event.key==='Enter'){const b=results.querySelector('button');if(b){event.preventDefault();b.click();}}});
  viewport.addEventListener('keydown',event=>{
    if(event.target!==viewport)return;
    const step=view.size*.12;
    if(event.key==='ArrowLeft')view.x-=step;else if(event.key==='ArrowRight')view.x+=step;else if(event.key==='ArrowUp')view.y-=step;else if(event.key==='ArrowDown')view.y+=step;else if(event.key==='+'||event.key==='=')zoom(.75);else if(event.key==='-')zoom(1.333333);else return;
    event.preventDefault();draw();
  });
  const metric=()=>{const a=[...pointers.values()];return a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}:{...a[0],d:0};};
  viewport.addEventListener('pointerdown',event=>{pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});moved=false;gesture={...metric(),view:{...view}};});
  viewport.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId)||!gesture)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const m=metric();const scale=Math.min(viewport.clientWidth,viewport.clientHeight);
    const dx=m.x-gesture.x,dy=m.y-gesture.y;
    if(Math.hypot(dx,dy)>5||Math.abs(m.d-gesture.d)>5)moved=true;
    if(!moved)return;
    if(!viewport.hasPointerCapture(event.pointerId))viewport.setPointerCapture(event.pointerId);
    let size=gesture.view.size;
    if(m.d&&gesture.d)size=Math.max(260,Math.min(1600,size*gesture.d/m.d));
    view={size,x:gesture.view.x-dx*gesture.view.size/scale+(gesture.view.size-size)/2,y:gesture.view.y-dy*gesture.view.size/scale+(gesture.view.size-size)/2};draw();
  });
  function end(event){pointers.delete(event.pointerId);gesture=pointers.size?{...metric(),view:{...view}}:null;}
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
  document.addEventListener('pointerup',end);
})();
