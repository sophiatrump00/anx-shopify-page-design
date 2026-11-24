/* A20 approved v8: selected Amazon artwork, native Shopify sales data and responsive assurances. */
(() => {
 const root=document.querySelector('[data-a20-pdp]');if(!root || root.dataset.initialized)return;root.dataset.initialized='true';
 (()=>{
'use strict';
const $=id=>root.querySelector('#'+id);
const config=[
 {group:'01',kind:'opening'},
 {group:'02',eyebrow:'01 / GET A JUMP',heading:'Get back to your day.',body:'A dead battery doesn’t have to leave you waiting for another car. A20 delivers 1,500A of peak current for compatible 12V vehicles with engines up to 6.0L gas or 3.0L diesel.'},
 {group:'03',eyebrow:'02 / SMART CLAMPS',heading:'Less guesswork under the hood.',body:'Check the smart clamp status lights before you start. The included clamps have built-in reverse-polarity and short-circuit protection.'},
 {group:'04',kind:'storage',eyebrow:'03 / EASY TO STOW',heading:'Keep a jump-start<br>in your glove box.',body:'At just 0.9 lb, A20 is easy to tuck into a glove box or center console. Keep it with your driving essentials, without giving up trunk space.'},
 {group:'05',kind:'pair',labels:['Phone charging','LED flashlight'],eyebrow:'04 / CHARGE & LIGHT',heading:'Useful between jump-starts, too.',body:'Charge your phone through the USB outputs, or turn on the LED for a better look under the hood after dark. Choose steady, flashing or SOS mode.'},
 {group:'06',kind:'pair',labels:['Temperature range','8,000mAh battery'],eyebrow:'05 / CHECK & RECHARGE',heading:'Check the charge.<br>Then hit the road.',body:'The digital display shows how much charge is left. Top off the 8,000mAh battery before a trip, and recharge after use so it’s ready for the next drive.',note:'Discharge temperature: −4°F to 140°F (−20°C to 60°C). Charging and storage limits differ; see the A20 manual.'},
 {group:'07',kind:'instructions',eyebrow:'06 / QUICK START GUIDE',heading:'How to jump-start in 4 easy steps.',body:'Follow the guided smart-clamp sequence before cranking your vehicle.'}
];
let selection, colour='orange', galleryPack='1 unit', focusReturn;
let disposePairs=[], disposeGallery=null;
let galleryController, galleryZoomRows=[], galleryZoomIndex=0;
const params=new URLSearchParams(location.search);
const initialProduct=JSON.parse(root.querySelector('[data-a20-product]').textContent);
const selectedInitial=initialProduct.variants.find(v=>v.id===(params.get('variant') || initialProduct.selectedId));
if(selectedInitial){
 colour=selectedInitial.colour;
 if(selectedInitial.pack && selectedInitial.pack!=='Any quantity')galleryPack=selectedInitial.pack;
}
if(params.get('colour')==='red'||params.get('colour')==='orange')colour=params.get('colour');
const initParamPack={'1':'1 unit','2':'2 units','4':'4 units'}[params.get('pack')];
if(initParamPack && !params.get('variant'))galleryPack=initParamPack;


const BLANK_IMG="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E";
function paragraph(text,className){const p=document.createElement('p');p.textContent=text;if(className)p.className=className;return p;}
function picture(asset,eager=false,deferLoad=false){
 const f=document.createElement('div');f.className='image-module';
 const button=document.createElement('button');button.className='image-button';button.type='button';
 button.setAttribute('aria-label',`Enlarge ${asset.purpose} image`);
 const im=document.createElement('img');
 im.loading=eager?'eager':'lazy';im.decoding='async';im.draggable=false;
 if(eager)im.fetchPriority='high';
 im.width=asset.width;im.height=asset.height;im.alt=`SuntNeew A20 ${colour} 8000mAh — ${asset.purpose}`;
 if(deferLoad){im.src=BLANK_IMG;im.dataset.src=asset.src;}else{im.src=asset.src;}
 const icon=document.createElement('span');icon.className='zoom-label';icon.textContent='+';icon.setAttribute('aria-hidden','true');
 button.append(im,icon);button.addEventListener('click',()=>zoom(asset,button));f.append(button);return f;
}
function heading(c){
 const d=document.createElement('div');d.className='section-heading';d.append(paragraph(c.eyebrow,'eyebrow'));
 const h=document.createElement('h2');h.innerHTML=c.heading;d.append(h,paragraph(c.body));return d;
}
function pair(c,assets,{gallery=false}={}){
 const wrapper=document.createElement('div');wrapper.className=gallery?'feature-pair gallery-pair':'feature-pair';
 const nav=document.createElement('div');nav.className='pair-tabs';nav.setAttribute('aria-label','Choose a feature');
 const track=document.createElement('div');track.className='pair-track';track.id='pair-'+c.group;track.tabIndex=0;track.setAttribute('role','region');track.setAttribute('aria-label',c.labels.join(' and '));
 const footer=document.createElement('div');footer.className='pair-controls';
 const hint=paragraph('','pair-hint');const desktopHint=document.createElement('span');desktopHint.className='pair-hint-desktop';desktopHint.textContent='Drag to explore';const mobileHint=document.createElement('span');mobileHint.className='pair-hint-mobile';mobileHint.textContent='Swipe to explore';hint.append(desktopHint,mobileHint);
 const counter=document.createElement('span');counter.className='pair-counter';counter.setAttribute('aria-live','polite');counter.setAttribute('aria-atomic','true');
 const arrows=document.createElement('div');arrows.className='pair-arrows';
 const previous=document.createElement('button');previous.type='button';previous.textContent='←';previous.setAttribute('aria-label',gallery?'Previous product image':'Previous feature');previous.setAttribute('aria-controls',track.id);
 const next=document.createElement('button');next.type='button';next.textContent='→';next.setAttribute('aria-label',gallery?'Next product image':'Next feature');next.setAttribute('aria-controls',track.id);
 arrows.append(previous,next);footer.append(hint,counter,arrows);
 const caption=paragraph('','gallery-current');
 if(gallery){nav.classList.add('gallery-thumbnails');nav.setAttribute('aria-label','Product image thumbnails');track.setAttribute('aria-label','A20 product images');}
 const cards=[],tabs=[];let active=-1,frame=0;
 function hydrateNear(index){
  if(!gallery)return;
  const from=Math.max(0,index-1),to=Math.min(cards.length-1,index+1);
  for(let j=from;j<=to;j++){
   const im=cards[j]?.querySelector('img[data-src]');
   if(im&&im.dataset.src){im.src=im.dataset.src;im.removeAttribute('data-src');}
  }
 }
 function update(index){
  const current=Math.max(0,Math.min(cards.length-1,index));if(current===active)return;active=current;
  hydrateNear(active);
  tabs.forEach((tab,i)=>tab.setAttribute('aria-pressed',String(i===active)));
  counter.textContent=`${active+1} / ${cards.length}`;
  previous.disabled=active===0;next.disabled=active===cards.length-1;
  if(gallery){
   caption.textContent=c.labels[active];
   const tab=tabs[active];
   nav.scrollTo({left:tab.offsetLeft-nav.offsetLeft-nav.clientWidth/2+tab.clientWidth/2,behavior:'smooth'});
  }
 }
 function go(index){
  const target=Math.max(0,Math.min(cards.length-1,index));
  hydrateNear(target);
  const left=cards[target].getBoundingClientRect().left-cards[0].getBoundingClientRect().left;
  track.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 assets.forEach((asset,i)=>{
  const card=document.createElement('article');card.className='feature-card';card.id=`feature-${c.group}-${asset.option.toLowerCase()}`;
  const label=document.createElement('h3');label.className='card-title';const number=document.createElement('span');number.className='card-number';number.textContent=String(i+1).padStart(2,'0');label.append(number,document.createTextNode(c.labels[i]));
  card.append(label,picture(asset,gallery&&i===0,gallery&&i>=2));cards.push(card);track.append(card);
  const tab=document.createElement('button');tab.type='button';tab.setAttribute('aria-controls',card.id);
  if(gallery){
   tab.setAttribute('aria-label',`Show image ${i+1}: ${c.labels[i]}`);tab.title=c.labels[i];
   const thumb=document.createElement('img');thumb.loading='lazy';thumb.decoding='async';thumb.draggable=false;thumb.alt='';thumb.width=88;thumb.height=88;thumb.src=asset.thumb_src;tab.append(thumb);
  }else tab.textContent=c.labels[i];
  tab.addEventListener('click',()=>go(i));tabs.push(tab);nav.append(tab);
 });
 previous.addEventListener('click',()=>go(active-1));next.addEventListener('click',()=>go(active+1));
 track.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||track.scrollWidth<=track.clientWidth+2)return;
  event.preventDefault();go(event.key==='Home'?0:event.key==='End'?cards.length-1:active+(event.key==='ArrowRight'?1:-1));
 });
 function onScroll(){
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const step=cards.length>1?cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left:1;
   update(Math.round(track.scrollLeft/Math.max(step,1)));
  });
 }
 track.addEventListener('scroll',onScroll,{passive:true});
 // Touch and trackpad use native scrolling. Add mouse dragging without opening zoom.
 let drag=null,suppressClick=false;
 function step(){return cards[1].getBoundingClientRect().left-cards[0].getBoundingClientRect().left;}
 track.addEventListener('pointerdown',event=>{
  suppressClick=false;
  if(event.pointerType!=='mouse'||event.button!==0)return;
  drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft,moved:false};
 });
 track.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x;
  if(!drag.moved&&Math.abs(dx)>7){drag.moved=true;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');}
  if(drag.moved){event.preventDefault();track.scrollLeft=drag.left-dx;}
 });
 function finishDrag(event){
  if(!drag||event.pointerId!==drag.id)return;
  const moved=drag.moved,distance=track.scrollLeft-drag.left,width=Math.max(step(),1);
  const index=Math.abs(distance)>Math.min(60,width*.15)?Math.round(drag.left/width)+Math.sign(distance):Math.round(track.scrollLeft/width);drag=null;
  if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
  if(moved){suppressClick=true;go(index);track.classList.remove('is-dragging');}
 }
 track.addEventListener('pointerup',finishDrag);track.addEventListener('pointercancel',finishDrag);
 track.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null;});
 track.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
 if(gallery){
  const centerActiveThumbnail=()=>{const tab=tabs[active];if(tab)nav.scrollTo({left:tab.offsetLeft-nav.offsetLeft-nav.clientWidth/2+tab.clientWidth/2,behavior:'instant'});};
  wrapper.addEventListener('pointerenter',()=>{hydrateNear(Math.max(1,active));requestAnimationFrame(centerActiveThumbnail);});
  wrapper.addEventListener('touchstart',()=>hydrateNear(Math.max(1,active)),{passive:true});
  wrapper.addEventListener('focusin',()=>requestAnimationFrame(centerActiveThumbnail));
  galleryController={go,focusAt:index=>cards[index]?.querySelector('.image-button').focus({preventScroll:true})};
 }
 const observer=new ResizeObserver(onScroll);observer.observe(track);
 const cleanup=()=>{observer.disconnect();cancelAnimationFrame(frame);};
 if(gallery){if(disposeGallery)disposeGallery();disposeGallery=cleanup;}else disposePairs.push(cleanup);
 update(0);if(gallery)wrapper.append(track,caption,footer,nav);else wrapper.append(nav,track,footer);return wrapper;
}
function instructions(assets){
 const wrapper=document.createElement('div');wrapper.className='instructions-layout';
 const procedure=assets.find(a=>a.option==='A');
 const details=document.createElement('details');details.className='starting-details';
 const summary=document.createElement('summary');
 const label=document.createElement('span');label.append(document.createTextNode('How to jump-start your vehicle'),paragraph('See the connection steps','details-caption'));
 const icon=document.createElement('span');icon.className='details-icon';icon.textContent='+';icon.setAttribute('aria-hidden','true');summary.append(label,icon);
 const body=document.createElement('div');body.className='starting-content';body.append(paragraph('Read the model instructions before use. Check vehicle compatibility and follow the smart clamp indicators.','steps-note'),picture(procedure));
 details.append(summary,body);wrapper.append(details);return wrapper;
}
function getGalleryRows(){
 const baseRows=selection.gallery_assets.filter(a=>a.colour===colour);
 const packOverride=selection.pack_gallery_assets?.[`${colour}:${galleryPack}`];
 if(!packOverride || !baseRows.length)return baseRows;
 return [{...baseRows[0],...packOverride},...baseRows.slice(1)];
}
function renderGalleryOnly(){
 if(!selection)return;
 const galleryRows=getGalleryRows();
 $('gallery-content').replaceChildren(pair({group:'gallery',labels:galleryRows.map(a=>a.purpose)},galleryRows,{gallery:true}));$('gallery-content').setAttribute('aria-busy','false');
}
function render(){
 disposePairs.forEach(dispose=>dispose());disposePairs=[];
 const rows=selection.assets.filter(a=>a.colour===colour);
 const casesBand=$('a20-cases');
 renderGalleryOnly();
 const fragment=document.createDocumentFragment();
 for(const c of config){
  const assets=rows.filter(a=>a.group===c.group);const section=document.createElement('section');section.dataset.group=c.group;section.id='feature-'+c.group;section.setAttribute('aria-label',c.kind==='opening'?'A20 product introduction':c.heading.replace(/<br>/g,' '));
  if(c.kind==='opening'){section.className='feature-opening';section.append(picture(assets[0]));}
  else if(c.kind==='storage'){
   section.className='storage-section';const split=document.createElement('div');split.className='storage-layout';const copy=document.createElement('div');copy.className='storage-copy';const h=document.createElement('h2');h.innerHTML=c.heading;
   copy.append(paragraph(c.eyebrow,'eyebrow'),h,paragraph(c.body));
   const media=picture(assets[0]);media.className='storage-image';split.append(copy,media);section.append(split);
  }else{
   section.className='feature-section';section.append(heading(c));
   if(c.kind==='pair')section.append(pair(c,assets));
   else if(c.kind==='instructions')section.append(instructions(assets));
   else for(const a of assets)section.append(picture(a));
   if(c.note)section.append(paragraph(c.note,'support-text'));
  }
  fragment.append(section);
  if(c.group==='03'&&casesBand)fragment.append(casesBand);
 }
 $('feature-content').replaceChildren(fragment);$('feature-content').setAttribute('aria-busy','false');
 const boxDiagram=$('a20-box-diagram');
 const boxAsset=rows.find(a=>a.group==='07'&&a.option==='B');
 if(boxDiagram&&boxAsset){boxDiagram.src=boxAsset.src;if(boxAsset.alt)boxDiagram.alt=boxAsset.alt;}
 $('chosen-colour').textContent=colour==='orange'?'Orange':'Red';
 root.querySelectorAll('[data-colour]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.colour===colour)));
}
function zoom(asset,trigger){
 focusReturn=trigger;
 if(asset.group==='gallery'){
  galleryZoomRows=getGalleryRows();
  galleryZoomIndex=galleryZoomRows.findIndex(a=>a.asset_id===asset.asset_id);
  $('image-dialog').classList.add('gallery-lightbox');
  root.querySelector('.zoom-gallery-controls').hidden=false;
  root.querySelector('.zoom-hint').textContent='Use the arrows to browse. Select + for the full-resolution image.';
  root.querySelector('.zoom-hint').lang='en';
  showGalleryZoom(galleryZoomIndex);
 }else{
  const im=$('zoom-image');im.src=asset.src;im.alt=`SuntNeew A20 — ${asset.purpose}`;im.width=asset.width;im.height=asset.height;$('image-title').textContent=asset.purpose;
 }
 $('image-dialog').showModal();
}
function showGalleryZoom(index){
 galleryZoomIndex=Math.max(0,Math.min(galleryZoomRows.length-1,index));
 const asset=galleryZoomRows[galleryZoomIndex],im=$('zoom-image');
 im.removeAttribute('width');im.removeAttribute('height');
 im.src=asset.zoom_src;im.alt=`SuntNeew A20 ${colour} — ${asset.purpose}`;
 $('image-title').textContent=asset.purpose;
 $('zoom-counter').textContent=`${galleryZoomIndex+1} / ${galleryZoomRows.length}`;
 $('zoom-previous').disabled=galleryZoomIndex===0;
 $('zoom-next').disabled=galleryZoomIndex===galleryZoomRows.length-1;
 $('image-dialog').classList.remove('is-zoomed');
 $('zoom-size').setAttribute('aria-pressed','false');$('zoom-size').setAttribute('aria-label','View at original size');$('zoom-size').textContent='+';
 root.querySelector('.zoom-scroll').scrollTo({left:0,top:0,behavior:'instant'});
 galleryController?.go(galleryZoomIndex);
}
$('zoom-previous').addEventListener('click',()=>showGalleryZoom(galleryZoomIndex-1));
$('zoom-next').addEventListener('click',()=>showGalleryZoom(galleryZoomIndex+1));
$('zoom-size').addEventListener('click',()=>{
 const expanded=$('image-dialog').classList.toggle('is-zoomed');
 $('zoom-size').setAttribute('aria-pressed',String(expanded));$('zoom-size').setAttribute('aria-label',expanded?'Fit image to screen':'View at original size');$('zoom-size').textContent=expanded?'−':'+';
});
$('image-dialog').addEventListener('keydown',event=>{
 if(!$('image-dialog').classList.contains('gallery-lightbox')||$('image-dialog').classList.contains('is-zoomed'))return;
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();showGalleryZoom(event.key==='Home'?0:event.key==='End'?galleryZoomRows.length-1:galleryZoomIndex+(event.key==='ArrowRight'?1:-1));
});
let zoomDrag=null;
const zoomScroller=root.querySelector('.zoom-scroll');
zoomScroller.addEventListener('pointerdown',event=>{
 if(!$('image-dialog').classList.contains('gallery-lightbox')||$('image-dialog').classList.contains('is-zoomed')||event.button!==0)return;
 zoomDrag={id:event.pointerId,x:event.clientX,y:event.clientY};
});
zoomScroller.addEventListener('pointerup',event=>{
 if(!zoomDrag||zoomDrag.id!==event.pointerId)return;
 const dx=event.clientX-zoomDrag.x,dy=event.clientY-zoomDrag.y;zoomDrag=null;
 if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.2)showGalleryZoom(galleryZoomIndex+(dx<0?1:-1));
});
zoomScroller.addEventListener('pointercancel',()=>{zoomDrag=null;});
root.addEventListener('a20:colour',event=>{colour=event.detail.colour;if(selection)render();});
root.addEventListener('a20:sale-update',event=>{
 const nextPack=event.detail?.pack;
 const nextColour=event.detail?.colour;
 if(!nextPack)return;
 if(nextColour && nextColour!==colour){colour=nextColour;galleryPack=nextPack;if(selection)render();return;}
 if(nextPack!==galleryPack){galleryPack=nextPack;renderGalleryOnly();}
});
for(const d of root.querySelectorAll('dialog')){d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{
 if(d.classList.contains('gallery-lightbox')){
  d.classList.remove('gallery-lightbox','is-zoomed');document.querySelector('.zoom-gallery-controls').hidden=true;
  root.querySelector('.zoom-hint').textContent='Use + to view the full-resolution image. Press Esc to close.';root.querySelector('.zoom-hint').lang='en';
  zoomDrag=null;galleryController?.focusAt(galleryZoomIndex);
 }else if(focusReturn?.isConnected)focusReturn.focus({preventScroll:true});
});}
selection=JSON.parse(root.querySelector('[data-a20-assets]').textContent);render();

})();
'use strict';
// Pack totals use the current Shopify variant price and the number of packs.
const A20Sales = (() => {
 const packSize = pack => pack === 'Any quantity' ? 1 : Math.max(1, Number.parseInt(pack, 10) || 1);
 const findVariant = (variants, capacity, colour, pack) => variants.find(v => v.capacity === capacity && v.colour === colour && v.pack === pack);
 function quantity(value) {
  const parsed = Math.floor(Number(value));
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : 1;
 }
 function line(variant, value = 1) {
  if (!variant) return null;
  const count = quantity(value), size = packSize(variant.pack);
  const discounted = Number.isInteger(variant.compareAtCents) && variant.compareAtCents > variant.priceCents;
  return {
   variantId: variant.id, sku: variant.sku, quantity: count, packSize: size,
   totalUnits: size * count, total: variant.priceCents * count,
   unitPrice: variant.priceCents / size,
   compareTotal: discounted ? variant.compareAtCents * count : null,
   compareUnit: discounted ? variant.compareAtCents / size : null,
   unitSaving: discounted ? (variant.compareAtCents - variant.priceCents) / size : null,
   totalSaving: discounted ? (variant.compareAtCents - variant.priceCents) * count : null,
   custom: variant.pack === 'Any quantity', available: variant.available,
  };
 }
 return { packSize, findVariant, quantity, line };
})();

'use strict';
(() => {
 const byId = id => root.querySelector('#'+id);
 function synchronize(detail) {
  const capacity = detail.capacity || '8000mAh';
  root.querySelectorAll('.pdp-section [data-capacity-match]').forEach(row => {row.hidden = !!row.dataset.capacityMatch && row.dataset.capacityMatch !== capacity;});
  byId('sticky-total').textContent = byId('total-price').textContent;
  const qtySuffix = detail.count > 1 ? ` × ${detail.count}` : '';
  byId('sticky-options').textContent = `${Number.parseInt(capacity, 10).toLocaleString('en-US')}mAh · ${detail.colour === 'red' ? 'Red' : 'Orange'} · ${detail.pack || '1 unit'}${qtySuffix}`;
  byId('box-quantity-note').textContent = detail.pricing && detail.pricing.totalUnits > 1 ? `The list shows one unit’s package. Your selection contains ${detail.pricing.totalUnits} units.` : 'Package contents listed per unit.';
 }
 root.addEventListener('a20:sale-update', event => synchronize(event.detail));
 synchronize({capacity:new URLSearchParams(location.search).get('capacity') || '8000mAh',colour:new URLSearchParams(location.search).get('colour') || 'orange',pack:document.querySelector('#chosen-pack')?.textContent});
 const updateBar = () => {
  const shell=getComputedStyle(document.documentElement);
  const pixels=name=>parseFloat(shell.getPropertyValue(name))||0;
  const reserved=pixels('--header-height')*pixels('--sticky-header-enabled')+pixels('--announcement-bar-height')*pixels('--sticky-announcement-bar-enabled');
  root.style.setProperty('--review-height',reserved+'px');
 };
 const header=document.querySelector('store-header') || document.querySelector('header');
 if(header)new ResizeObserver(updateBar).observe(header);updateBar();window.addEventListener('resize',updateBar,{passive:true});
 // Instant anchor jumps can move the purchase button across the viewport without an intersection event.
 const highlightsList = byId('product-highlights');
 const highlightsToggle = byId('highlights-toggle');
 if (highlightsList && highlightsToggle) {
  highlightsToggle.addEventListener('click', () => {
   const isCollapsed = highlightsList.dataset.collapsed === 'true';
   highlightsList.dataset.collapsed = isCollapsed ? 'false' : 'true';
   highlightsToggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
   highlightsToggle.textContent = isCollapsed ? 'Show fewer highlights ▴' : '+ 2 more highlights ▾';
  });
 }
 root.querySelectorAll('[data-open-auth-prompt]').forEach((btn) => {
  btn.addEventListener('click', () => {
   document.dispatchEvent(new CustomEvent('suntneew:open-auth-prompt'));
  });
 });
 const stickyAnchor = byId('purchase-button') || byId('total-price');
 function updateSticky() {
  const stickyBar = byId('sticky-buy');
  if (!stickyBar || !stickyAnchor) return;
  if (root.querySelector('dialog[open]')) { stickyBar.hidden = true; return; }
  const rect = stickyAnchor.getBoundingClientRect();
  const isCompactViewport = window.innerWidth < 1000 || Boolean(root.querySelector('.preview-frame.is-mobile'));
  const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
  stickyBar.hidden = isCompactViewport ? inViewport : rect.bottom > 0;
 }
 const stickyObserver = new IntersectionObserver(updateSticky, {threshold:0});
 if (stickyAnchor) stickyObserver.observe(stickyAnchor);
 updateSticky();
 root.querySelectorAll('dialog').forEach(d => { d.addEventListener('close', updateSticky); new MutationObserver(updateSticky).observe(d, {attributes:true,attributeFilter:['open']}); });
 let stickyFrame;
 const scheduleSticky = () => { if (!stickyFrame) stickyFrame = requestAnimationFrame(() => { stickyFrame = undefined; updateSticky(); }); };
 window.addEventListener('scroll', scheduleSticky, {passive:true});
 window.addEventListener('resize', scheduleSticky, {passive:true});

 const frameEl = root.querySelector('.preview-frame');
 const nav = root.querySelector('.product-nav');
 const navTabs = [...root.querySelectorAll('.product-nav [data-pdp-tab]')];
 const tabPanels = [...root.querySelectorAll('.pdp-tab-panel[data-tab-panel]')];
 const nextTabLinks = [...root.querySelectorAll('[data-pdp-next]')];
 const panelsContainer = root.querySelector('.pdp-tab-panels');
 const defaultTabId = navTabs[0]?.dataset.pdpTab || 'features';
 const mobileMedia = window.matchMedia?.('(max-width: 700px)');
 const isMobileLayout = () => Boolean(mobileMedia?.matches || frameEl?.classList.contains('is-mobile') || (frameEl?.clientWidth > 0 && frameEl.clientWidth <= 700));
 let mobileSpecsCollapsedOnce = false;

 function updateNavOffset() {
  if (nav && nav.offsetHeight > 0) {
   root.style.setProperty('--nav-offset', `${nav.offsetHeight}px`);
  }
 }

 function collapseMobileSpecsIfNeeded() {
  if (isMobileLayout() && !mobileSpecsCollapsedOnce) {
   mobileSpecsCollapsedOnce = true;
   root.querySelectorAll('#specs details.more-details[open]').forEach((detail) => { detail.open = false; });
  }
  updateNavOffset();
 }

 function syncLayoutMode() {
  collapseMobileSpecsIfNeeded();
  requestAnimationFrame(updateNavOffset);
 }

 function activateTab(tabId, { scroll = false, updateHash = false } = {}) {
  const activeTab = navTabs.find(tab => tab.dataset.pdpTab === tabId);
  if (!activeTab) return false;
  navTabs.forEach(tab => {
   const isCurrent = tab === activeTab;
   tab.classList.toggle('active', isCurrent);
   tab.setAttribute('role', 'tab');
   tab.setAttribute('aria-selected', String(isCurrent));
   tab.setAttribute('tabindex', isCurrent ? '0' : '-1');
   if (isCurrent) tab.setAttribute('aria-current', 'location');
   else tab.removeAttribute('aria-current');
  });
  tabPanels.forEach(panel => {
   panel.setAttribute('role', 'tabpanel');
   panel.hidden = panel.dataset.tabPanel !== tabId;
  });
  nextTabLinks.forEach(item => {
   item.hidden = item.dataset.pdpNext === tabId;
  });
  updateNavOffset();
  if (!isMobileLayout() && nav && typeof nav.scrollTo === 'function') {
   const left = Math.max(0, activeTab.offsetLeft - nav.clientWidth / 2 + activeTab.clientWidth / 2);
   const behavior = Math.abs(nav.scrollLeft - left) < 4 ? 'auto' : (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
   nav.scrollTo({ left, behavior });
  }
  const targetHash = '#' + tabId;
  if (updateHash && location.hash !== targetHash) history.pushState(null, '', targetHash);
  if (scroll) panelsContainer?.scrollIntoView({ block: 'start', behavior: 'auto' });
  updateSticky();
  return true;
 }

 function syncFromHash(hash) {
  if (!hash || hash === '#') return false;
  const id = hash.slice(1);
  const directTab = navTabs.find(tab => tab.dataset.pdpTab === id || tab.hash === hash);
  if (directTab) return activateTab(directTab.dataset.pdpTab, { scroll: false, updateHash: false });
  const target = root.querySelector('#' + CSS.escape(id));
  if (!target) return false;
  const ownerPanel = target.closest('[data-tab-panel]');
  if (ownerPanel) activateTab(ownerPanel.dataset.tabPanel, { scroll: false, updateHash: false });
  const detailsEl = target.tagName === 'DETAILS' ? target : target.closest('details');
  if (detailsEl) { detailsEl.hidden = false; detailsEl.open = true; }
  return true;
 }

 nav?.setAttribute('role', 'tablist');
 nav?.addEventListener('keydown', event => {
  const index = navTabs.indexOf(document.activeElement);
  if (index === -1 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? navTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + navTabs.length) % navTabs.length;
  const nextTab = navTabs[nextIndex];
  if (!nextTab) return;
  nextTab.focus({ preventScroll: true });
  activateTab(nextTab.dataset.pdpTab, { scroll: false, updateHash: true });
 });
 root.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const jumpTab = link.dataset.pdpTab || link.dataset.pdpNext;
  if (jumpTab) {
   event.preventDefault();
   activateTab(jumpTab, { scroll: true, updateHash: true });
   return;
  }
  const target = link.hash.length > 1 && root.querySelector('#' + CSS.escape(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  const ownerPanel = target.closest('[data-tab-panel]');
  if (ownerPanel) activateTab(ownerPanel.dataset.tabPanel, { scroll: false, updateHash: false });
  const detailsEl = target.tagName === 'DETAILS' ? target : target.closest('details');
  if (detailsEl) { detailsEl.hidden = false; detailsEl.open = true; }
  if (location.hash !== link.hash) history.pushState(null, '', link.hash);
  updateNavOffset();
  target.scrollIntoView({ block: 'start', behavior: link.getAttribute('href') === '#sales-summary' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  updateSticky();
 }));
 root.querySelectorAll('[data-manual-download]').forEach(link => link.addEventListener('click', async event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = link.href || link.getAttribute('href');
  if (!href || typeof window.fetch !== 'function' || typeof URL.createObjectURL !== 'function') return;
  event.preventDefault();
  try {
   const response = await window.fetch(href, { mode: 'cors' });
   if (!response.ok) throw new Error('Download failed');
   const blobUrl = URL.createObjectURL(await response.blob());
   const temp = document.createElement('a');
   temp.href = blobUrl;
   temp.download = link.getAttribute('download') || 'user-manual.pdf';
   temp.style.display = 'none';
   document.body.append(temp);
   temp.click();
   temp.remove();
   setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  } catch {
   window.open(href, '_blank', 'noopener');
  }
 }));
 window.addEventListener('hashchange', () => syncFromHash(location.hash));
 window.addEventListener('popstate', () => {
  if (!syncFromHash(location.hash)) {
   activateTab(defaultTabId, { scroll: false, updateHash: false });
  }
 });
 if (frameEl && typeof MutationObserver === 'function') {
  new MutationObserver(syncLayoutMode).observe(frameEl, { attributes: true, attributeFilter: ['class'] });
 }
 if (frameEl && typeof ResizeObserver === 'function') {
  new ResizeObserver(syncLayoutMode).observe(frameEl);
 }
 if (nav && typeof ResizeObserver === 'function') {
  new ResizeObserver(updateNavOffset).observe(nav);
 }
 if (mobileMedia?.addEventListener) mobileMedia.addEventListener('change', syncLayoutMode);
 else mobileMedia?.addListener?.(syncLayoutMode);
 window.addEventListener('resize', syncLayoutMode, { passive: true });
 syncLayoutMode();
 if (!syncFromHash(location.hash)) activateTab(defaultTabId, { scroll: false, updateHash: false });
 updateSticky();
})();

'use strict';
(() => {
 const frame = root.querySelector('.preview-frame');
 const gallery = root.querySelector('.product-gallery');
 const help = root.querySelector('.gallery-help');
 const assurances = root.querySelector('#'+'purchase-assurances');
 const desktopSlot = root.querySelector('#'+'gallery-assurances-slot');
 const mobileSlot = root.querySelector('#'+'mobile-assurances-slot');
 let desktop = false, measurePending = false;

 function measureChrome() {
  measurePending = false;
  if (!desktop) return;
  const pair = gallery.querySelector('.gallery-pair');
  if (!pair) return;
  const chrome = Math.ceil(gallery.getBoundingClientRect().height - pair.getBoundingClientRect().height);
  const value = `${chrome}px`;
  if (frame.style.getPropertyValue('--gallery-chrome-height') !== value) frame.style.setProperty('--gallery-chrome-height', value);
 }
 function scheduleMeasure() {
  if (!measurePending) {measurePending = true; requestAnimationFrame(measureChrome);}
 }
 function synchronizeLayout() {
  desktop = frame.clientWidth >= 1000;
  const slot = desktop ? desktopSlot : mobileSlot;
  if (assurances.parentElement !== slot) {
   const focused = assurances.contains(document.activeElement) ? document.activeElement : null;
   slot.append(assurances);
   focused?.focus({preventScroll:true});
  }
  frame.classList.toggle('is-desktop-layout', desktop);
  scheduleMeasure();
 }

 const observer = new ResizeObserver(synchronizeLayout);
 observer.observe(frame);
 new ResizeObserver(scheduleMeasure).observe(assurances);
 new ResizeObserver(scheduleMeasure).observe(help);
 
 synchronizeLayout();
 window.addEventListener('resize', scheduleMeasure, {passive:true});

 assurances.querySelectorAll('details').forEach(details => {
  details.addEventListener('toggle', () => {
   if (details.open) assurances.querySelectorAll('details[open]').forEach(other => {if (other !== details) other.open = false;});
  });
  details.querySelector('.assurance-close').addEventListener('click', () => {
   details.open = false;
   details.querySelector('summary').focus({preventScroll:true});
  });
 });
 document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || root.querySelector('dialog[open]')) return;
  const open = assurances.querySelector('details[open]');
  if (open) {open.open = false;open.querySelector('summary').focus({preventScroll:true});}
 });
 document.addEventListener('pointerdown', event => {
  if (desktop && !assurances.contains(event.target)) assurances.querySelectorAll('details[open]').forEach(details => {details.open = false;});
 });
})();

'use strict';
(() => {
 const form=root.querySelector('form[is="product-form"]');
 const buyNowButtons=[...root.querySelectorAll('[data-suntneew-buy-now]')];
 const busy=()=>form.dataset.purchaseBusy==='true';
 const el = id => root.querySelector('#'+id);
 let stickyFeedbackTimer;
 const query = new URLSearchParams(location.search);
 // Merchant-confirmed unavailable capacities; 8000mAh follows live Shopify availability.
 const outOfStockCapacities = new Set(['12000mAh', '16000mAh']);
 let data, capacity = '8000mAh', colour = query.get('colour') === 'red' ? 'red' : 'orange', pack = '1 unit', count = 1;
 const money = cents => new Intl.NumberFormat('en-US', {style:'currency', currency:data.currency}).format(cents / 100);
 const capacityLabel = value => `${Number.parseInt(value, 10).toLocaleString('en-US')}mAh`;
 const variant = () => A20Sales.findVariant(data.variants, capacity, colour, pack);
 function persist() {
  const url = new URL(location.href);
  url.searchParams.set('colour', colour);
  url.searchParams.set('capacity', capacity);
  url.searchParams.set('pack', pack === 'Any quantity' ? 'any' : String(A20Sales.packSize(pack)));
  url.searchParams.set('quantity', String(count));
  const current = variant();
  if (current) url.searchParams.set('variant', current.id); else url.searchParams.delete('variant');
  history.replaceState(null, '', url);
 }
 function updatePrice() {
  const current=variant();
  const min=Math.max(1,Number(current?.min)||1), step=Math.max(1,Number(current?.step)||1);
  const max=Math.max(min,Number(current?.max)||min);
  count=Math.min(min+Math.floor((max-min)/step)*step,Math.max(min,min+Math.round((count-min)/step)*step));
  Object.assign(el('quantity'),{min:String(min),max:String(max),step:String(step)});
  const pricing = A20Sales.line(current,count);
  el('sales-summary').dataset.variantId = current?.id || '';
  el('sales-summary').dataset.sku = current?.sku || '';
  el('selected-variant').value = current?.id || '';
  el('total-price').textContent = pricing ? money(pricing.total) : 'Unavailable';
  el('compare-price').hidden = !pricing?.compareTotal;
  el('compare-price').textContent = pricing?.compareTotal ? money(pricing.compareTotal) : '';
  el('total-saving').hidden = !pricing?.totalSaving;
  el('total-saving').textContent = pricing?.totalSaving ? `You save ${money(pricing.totalSaving)} in total vs. regular price` : '';
  el('quantity').value = String(count);
  const available = !!pricing?.available;
  el('quantity').disabled = !available || busy();
  el('quantity-minus').disabled = !available || busy() || count <= Number(current?.min || 1);
  el('quantity-plus').disabled = !available || busy() || count >= Math.max(Number(current?.min || 1),Number(current?.max || 1));
  el('quantity-label').textContent = pricing && pricing.packSize > 1 ? 'Number of packs' : 'Number of units';
  el('quantity-summary').textContent = !pricing ? '' : pricing.packSize > 1
   ? `${count} × ${pricing.packSize}-unit ${count === 1 ? 'pack' : 'packs'} · ${pricing.totalUnits} units in total`
   : `${count} ${count === 1 ? 'unit' : 'units'} · ${money(pricing.unitPrice)} per unit`;
  const labelText = !current ? 'Unavailable' : !available ? (outOfStockCapacities.has(capacity) ? 'Out of stock' : 'Sold out') : 'Add to cart';
  el('purchase-label').textContent = labelText;
  if (el('sticky-purchase-label')) el('sticky-purchase-label').textContent = labelText;
  el('purchase-button').disabled=!available || busy();
  if (el('sticky-purchase-button')) el('sticky-purchase-button').disabled=!available || busy();
  buyNowButtons.forEach(btn => { btn.disabled = !available || busy(); });
  el('selected-variant').disabled=!current || !available;
  form.dataset.variantState=current ? 'ready' : 'error';
  root.querySelectorAll('.capacity-choices input').forEach(input=>{input.disabled=busy();});
  el('stock-status').hidden = available;
  el('stock-status').textContent = !current ? 'This combination is unavailable.' : !available
   ? outOfStockCapacities.has(capacity) ? `${capacityLabel(capacity)} is currently out of stock.` : 'This capacity is currently sold out.' : '';
  persist();
  root.dispatchEvent(new CustomEvent('a20:sale-update', {detail:{capacity, colour, pack, count, variant:current, pricing}}));
 }
 function renderPacks() {
  el('chosen-pack').textContent = pack;
  const fragment = document.createDocumentFragment();
  for (const option of data.options.find(o => o.name === 'Pack').values.filter(v => v !== 'Any quantity')) {
   const current = A20Sales.findVariant(data.variants, capacity, colour, option), pricing = A20Sales.line(current);
   const label = document.createElement('label');
   label.className = 'sn-pack-choice';
   label.classList.toggle('is-disabled', !current?.available);
   const input = document.createElement('input');
   input.type = 'radio'; input.name = 'pack'; input.value = option; input.checked = pack === option; input.disabled = !current || busy();
   input.dataset.variantId = current?.id || ''; input.dataset.sku = current?.sku || '';
   const card = document.createElement('span'); card.className = 'sn-pack-choice__body';
   const title = document.createElement('strong'); title.textContent = option; card.append(title);
   if (pricing) {
    const prices = document.createElement('span'); prices.className = 'sn-pack-prices';
    const price = document.createElement('span'); price.className = 'sn-pack-prices__price';
    const unit = document.createElement('small'); unit.textContent = ' / unit'; price.append(document.createTextNode(money(pricing.unitPrice)), unit); prices.append(price);
    card.append(prices);
    if (!current.available) {const sold = document.createElement('small'); sold.textContent = outOfStockCapacities.has(capacity) ? 'Out of stock' : 'Sold out'; card.append(sold);}
   } else {const missing = document.createElement('small'); missing.textContent = 'Unavailable'; card.append(missing);}
   input.addEventListener('change', () => {if(busy())return;pack = option; count = 1; el('chosen-pack').textContent = pack; updatePrice();});
   label.append(input, card); fragment.append(label);
  }
  el('pack-choices').replaceChildren(fragment);
 }
 function renderOptions() {
  for (const input of el('capacity-choices').querySelectorAll('input')) input.checked = input.value === capacity;
  root.querySelectorAll('[data-colour]').forEach(button => {
   const exists = !!A20Sales.findVariant(data.variants, capacity, button.dataset.colour, pack);
   button.disabled = !exists || busy();
   button.setAttribute('aria-pressed', String(button.dataset.colour === colour));
   button.title = exists ? '' : 'Unavailable with this capacity';
  });
  el('chosen-colour').textContent = colour === 'orange' ? 'Orange' : 'Red';
  el('model-eyebrow').textContent = `A20 / ${capacityLabel(capacity)}`;
  const peaks = {'8000mAh':'1,500A','12000mAh':'3,000A','16000mAh':'4,000A'};
  el('product-specs').textContent = `12V · ${peaks[capacity]} peak · ${capacityLabel(capacity)}`;
  el('product-highlights').hidden = false;
  el('product-highlights').querySelectorAll('[data-capacity-match]').forEach(item => {item.hidden = !!item.dataset.capacityMatch && item.dataset.capacityMatch !== capacity;});
  renderPacks(); updatePrice();
 }
 function changeColour(next, fromToolbar = false) {
  if(busy())return;
  if (fromToolbar) capacity = '8000mAh';
  if (!A20Sales.findVariant(data.variants, capacity, next, pack)) return;
  if (colour !== next || fromToolbar) count = 1;
  colour = next;
  root.dispatchEvent(new CustomEvent('a20:colour', {detail:{colour}}));
  renderOptions();
 }
 function updateQuantity(delta = 0) {
  if (busy() || !variant()?.available) return;
  count = A20Sales.quantity(Number(el('quantity').value) + delta * Math.max(1, Number(variant()?.step)||1)); updatePrice();
 }
 Promise.resolve(JSON.parse(root.querySelector('[data-a20-product]').textContent)).then(snapshot => {
  data = {...snapshot, variants: snapshot.variants.map(current => outOfStockCapacities.has(current.capacity) ? {...current, available: false} : current)};
  const requestedByVariant = query.get('variant') ? data.variants.find(v => v.id === query.get('variant')) : null;
  const requested = requestedByVariant || data.variants.find(v => v.id === snapshot.selectedId);
  const capacityValues = data.options.find(o => o.name === 'Capacity').values;
  if (requestedByVariant) { ({capacity, colour, pack} = requestedByVariant); if (pack === 'Any quantity') pack = '1 unit'; }
  else {
   if (requested) { ({capacity, colour, pack} = requested); if (pack === 'Any quantity') pack = '1 unit'; }
   if (capacityValues.includes(query.get('capacity'))) capacity = query.get('capacity');
   const requestedPack = {'1':'1 unit','2':'2 units','4':'4 units'}[query.get('pack')];
   if (requestedPack) pack = requestedPack;
   if (!variant()) {
    const fallbackVariant = data.variants.find(v => v.capacity === capacity && v.pack === pack);
    colour = fallbackVariant ? fallbackVariant.colour : 'orange';
   }
  }
  count = A20Sales.quantity(query.get('quantity'));
  const visibleCapacities = capacityValues.filter(value => !outOfStockCapacities.has(value) || value === capacity);
  const capFieldset = el('capacity-choices').closest('fieldset');
  if (capFieldset) capFieldset.hidden = visibleCapacities.length <= 1;
  el('capacity-choices').replaceChildren();
  for (const value of visibleCapacities) {
   const label = document.createElement('label'), input = document.createElement('input'), body = document.createElement('span');
   label.classList.toggle('is-out-of-stock', outOfStockCapacities.has(value));
   input.type = 'radio'; input.name = 'capacity'; input.value = value;
   const text = document.createElement('span'); text.textContent = capacityLabel(value); body.append(text);
   if (!data.variants.some(v => v.capacity === value && v.available)) {const sold = document.createElement('small'); sold.textContent = outOfStockCapacities.has(value) ? 'Out of stock' : 'Sold out'; body.append(sold);}
   input.addEventListener('change', () => {
    if(busy())return;capacity = value; count = 1;
    if (!variant()) colour = data.variants.find(v => v.capacity === capacity && v.pack === pack).colour;
    root.dispatchEvent(new CustomEvent('a20:colour', {detail:{colour}})); renderOptions();
   });
   label.append(input, body); el('capacity-choices').append(label);
  }
  
  root.querySelectorAll('[data-colour]').forEach(button => button.addEventListener('click', () => changeColour(button.dataset.colour)));
  el('quantity-minus').addEventListener('click', () => updateQuantity(-1));
  el('quantity-plus').addEventListener('click', () => updateQuantity(1));
  el('quantity').addEventListener('change', () => updateQuantity());
  el('quantity').addEventListener('input', () => {const n = Number(el('quantity').value); if (!busy() && variant()?.available && Number.isSafeInteger(n) && n >= 1) {count = n; updatePrice();}});
  root.dispatchEvent(new CustomEvent('a20:colour', {detail:{colour}}));
  renderOptions(); el('sales-summary').setAttribute('aria-busy', 'false');
  form.addEventListener('purchase:idle',()=>{renderOptions();});
  const busyObserver=new MutationObserver(()=>{renderPacks();updatePrice();});
  busyObserver.observe(form,{attributes:true,attributeFilter:['data-purchase-busy']});
  form.addEventListener('cart:error',event=>{const err=event.detail?.error || 'Check your cart before trying again.';const note=root.querySelector('.cart-feedback');note.textContent=err;note.hidden=false;root.querySelector('.cart-feedback-link').hidden=false;const checkoutLink=root.querySelector('.cart-checkout-link');if(checkoutLink)checkoutLink.hidden=true;const stickyCheckout=root.querySelector('.sticky-checkout-link');if(stickyCheckout)stickyCheckout.hidden=true;const sNote=el('sticky-feedback');if(sNote){clearTimeout(stickyFeedbackTimer);sNote.textContent=err;sNote.hidden=false;}});
  form.addEventListener('variant:add',()=>{const note=root.querySelector('.cart-feedback');note.textContent='Added to your cart.';note.hidden=false;root.querySelector('.cart-feedback-link').hidden=false;const checkoutLink=root.querySelector('.cart-checkout-link');if(checkoutLink)checkoutLink.hidden=false;const stickyCheckout=root.querySelector('.sticky-checkout-link');if(stickyCheckout)stickyCheckout.hidden=false;const sNote=el('sticky-feedback');if(sNote){sNote.textContent='Added to your cart.';sNote.hidden=false;clearTimeout(stickyFeedbackTimer);stickyFeedbackTimer=setTimeout(()=>{sNote.hidden=true;},4000);}try{const drawer=document.getElementById('cart-drawer');if(drawer&&typeof drawer.show==='function'&&!drawer.open)drawer.show();}catch(_){}});
  window.addEventListener('popstate',()=>{const requested=data.variants.find(v=>v.id===new URLSearchParams(location.search).get('variant'));if(requested){({capacity,colour,pack}=requested);if(pack==='Any quantity')pack='1 unit';count=1;root.dispatchEvent(new CustomEvent('a20:colour',{detail:{colour}}));renderOptions();}});
 }).catch(error => {console.error(error);form.dataset.variantState='error';el('selected-variant').disabled=true;el('purchase-button').disabled=true;if(el('sticky-purchase-button'))el('sticky-purchase-button').disabled=true;buyNowButtons.forEach(btn=>{btn.disabled=true;});const note=root.querySelector('.cart-feedback');note.hidden=false;note.textContent='Product options could not be loaded. Please refresh the page.';});
})();

})();
