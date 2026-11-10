import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { read, product, render } from './a20-pdp-fixture.mjs';
const theme=read('assets/theme.js');
const formCode=theme.slice(theme.indexOf('var ProductForm ='),theme.indexOf('// js/common/product/product-form-listeners.js'));
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
async function setup(t,available=true){
 const dom=new JSDOM(render(product(available)),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.com/products/a20'});t.after(()=>dom.window.close());
 const intersections=[];const w=dom.window;w.ResizeObserver=class{observe(){}disconnect(){}};w.IntersectionObserver=class{constructor(callback){this.callback=callback;intersections.push(this);}observe(target){this.target=target;}disconnect(){}};w.matchMedia=()=>({matches:false});w.CSS={escape:s=>s};w.HTMLElement.prototype.scrollTo=function(){};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.Shopify={routes:{root:'/'}};w.themeVariables={settings:{cartType:'drawer',pageType:'product'}};w.eval(formCode);w.eval(read('assets/suntneew-a20-v8.js'));await tick();
 return {w,intersections,root:w.document.querySelector('[data-a20-pdp]'),form:w.document.forms[0],choose:(name,value)=>{const input=w.document.querySelector(`input[name="${name}"][value="${value}"]`);input.click();}};
}
test('A20 pack selection submits the matching SKU and number of packs, with live totals',async t=>{
 const{w,root,form,choose}=await setup(t);choose('pack','2 units');
 assert.equal(new w.FormData(form).get('id'),'101');assert.equal(new w.FormData(form).get('quantity'),'1');assert.equal(root.querySelector('#total-price').textContent,'$133.98');
 root.querySelector('#quantity-plus').click();assert.equal(new w.FormData(form).get('quantity'),'2');assert.equal(root.querySelector('#total-price').textContent,'$267.96');assert.match(root.querySelector('#quantity-summary').textContent,/4 units in total/);
 choose('pack','4 units');assert.equal(new w.FormData(form).get('id'),'102');assert.equal(new w.FormData(form).get('quantity'),'1');
 choose('pack','Any quantity');root.querySelector('#quantity').value='3';root.querySelector('#quantity').dispatchEvent(new w.Event('change'));assert.equal(new w.FormData(form).get('id'),'103');assert.equal(new w.FormData(form).get('quantity'),'3');assert.equal(root.querySelector('#total-price').textContent,'$200.97');assert.equal(root.querySelector('#compare-price').hidden,true);
});
test('confirmed unavailable capacities block every purchase route and recover the correct color/SKU',async t=>{
 const{w,root,form,choose}=await setup(t);root.querySelector('[data-colour="red"]').click();choose('pack','2 units');assert.equal(form.elements.namedItem('id').value,'111');
 for(const capacity of ['12000mAh','16000mAh']){choose('capacity',capacity);assert.equal(root.querySelector('#stock-status').textContent,`${Number.parseInt(capacity).toLocaleString('en-US')}mAh is currently out of stock.`);for(const node of root.querySelectorAll('#purchase-button,[data-suntneew-buy-now],#quantity,#quantity-minus,#quantity-plus'))assert.equal(node.disabled,true);assert.equal(form.elements.namedItem('id').disabled,true);assert.equal(new w.FormData(form).get('id'),null);assert.equal(root.querySelector('[data-colour="red"]').disabled,true);assert.ok([...root.querySelectorAll('.sn-pack-choice__body')].every(card=>card.textContent.includes('Out of stock')));}
 choose('capacity','8000mAh');assert.equal(form.elements.namedItem('id').value,'101');assert.equal(form.elements.namedItem('id').disabled,false);assert.equal(root.querySelector('#purchase-button').disabled,false);assert.equal(root.querySelector('#quantity').value,'1');
});
test('Shopify sold-out state remains authoritative for 8000mAh',async t=>{const{root,form}=await setup(t,false);assert.equal(root.querySelector('#purchase-button').disabled,true);assert.equal(root.querySelector('[data-suntneew-buy-now]').disabled,true);assert.equal(form.elements.namedItem('id').disabled,true);assert.equal(root.querySelector('#purchase-label').textContent,'Sold out');});
test('returning from Features to the gallery hides the lower price before the main price is reached',async t=>{
 const{w,root,intersections}=await setup(t);let priceTop=-60;
 intersections.find(observer=>observer.target.id==='total-price').callback([{isIntersecting:false,boundingClientRect:{bottom:-30}}]);
 root.querySelector('#total-price').getBoundingClientRect=()=>({top:priceTop,bottom:priceTop+30});
 const scroll=async()=>{w.dispatchEvent(new w.Event('scroll'));await new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));};
 await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,false);
 priceTop=1000;await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,true);
 priceTop=200;await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,true);
});
test('native cart lock sends one request, preserves pack quantity and recovers after an inventory error',async t=>{
 const{w,root,form,choose}=await setup(t);choose('pack','2 units');root.querySelector('#quantity-plus').click();let finish,calls=0,submitted;
 w.fetch=async(url,options)=>{calls++;submitted=[options.body.get('id'),options.body.get('quantity')];return new Promise(resolve=>{finish=resolve;});};
 const first=form._onSubmit({preventDefault(){}});await form._onSubmit({preventDefault(){}});await tick();assert.equal(calls,1);assert.deepEqual(submitted,['101','2']);assert.equal(root.querySelector('#purchase-button').disabled,true);
 finish({ok:false,json:async()=>({description:'Inventory changed. Please try a smaller quantity.'})});await first;await tick();assert.match(root.querySelector('.cart-feedback').textContent,/Inventory changed/);assert.equal(root.querySelector('#purchase-button').disabled,false);assert.equal(root.querySelector('#quantity').value,'2');assert.equal(root.querySelector('#quantity').disabled,false);assert.equal(root.querySelector('input[name="capacity"]').disabled,false);
});
test('each color keeps all selected gallery and story assets with full-resolution zoom',async t=>{
 const{root}=await setup(t);for(const color of ['orange','red']){root.querySelector(`[data-colour="${color}"]`).click();assert.equal(root.querySelectorAll('.gallery-thumbnails button').length,8);assert.equal(root.querySelectorAll('#feature-content img').length,10);assert.equal(root.querySelectorAll('#feature-content .pair-track').length,2);assert.ok([...root.querySelectorAll('#feature-content img')].every(img=>img.src.includes(color)||img.src.includes('orange-aplus-10')));root.querySelector('.gallery-pair .image-button').click();assert.match(root.querySelector('#zoom-image').src,/-full\.jpg$/);assert.equal(root.querySelector('#image-dialog').open,true);root.querySelector('#image-dialog [data-close]').click();}
 assert.equal(root.querySelectorAll('[data-capacity-match="8000mAh"]:not([hidden])').length>0,true);
});
