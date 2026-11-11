import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {JSDOM} from 'jsdom';
import {product,read,render} from './g31-selected-fixture.mjs';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const theme=read('assets/theme.js');
const native=theme.slice(theme.indexOf('var ProductForm ='),theme.indexOf('// js/common/product/product-form-listeners.js'));
async function setup(t,available=true,url='https://example.com/products/g31'){
 const dom=new JSDOM(render(product(available)),{runScripts:'outside-only',pretendToBeVisual:true,url});t.after(()=>dom.window.close());
 const w=dom.window;w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=()=>({matches:false});w.CSS={escape:s=>s};w.HTMLElement.prototype.scrollTo=function(){};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.Shopify={routes:{root:'/'}};w.themeVariables={settings:{cartType:'drawer',pageType:'product'}};w.eval(native);w.eval(read('assets/suntneew-g31-selected.js'));await tick();
 return{w,root:w.document.querySelector('[data-g31-pdp]'),form:w.document.forms[0],choose:pack=>w.document.querySelector(`input[name="pack"][value="${pack}"]`).click()};
}
test('merchant image order and five purchase highlights survive rendering, with original gallery and feature zoom',async t=>{
 const{root}=await setup(t);
 assert.deepEqual([...root.querySelectorAll('#gallery-content .image-button img')].map(img=>img.dataset.imageId),['G01','G02','G03','G04','G05','G06','G08','G07']);
 assert.deepEqual([...root.querySelectorAll('#feature-content .image-button img')].map(img=>img.dataset.imageId),['A02','A03','A04','A05','A08','A06','A09','A10','A11','A12','A15']);
 assert.equal(root.querySelectorAll('.gallery-thumbnails button').length,8);
 assert.equal(root.querySelectorAll('#feature-content .pair-track').length,2);
 assert.equal(root.querySelectorAll('.product-highlights li').length,5);
 for(const id of ['G01','A10']){
  root.querySelector(`.image-button[data-image-id="${id}"]`).click();
  assert.equal(root.querySelector('#image-dialog').open,true);
  assert.match(root.querySelector('#zoom-image').src,new RegExp(id.toLowerCase()+'-full\\.jpg$'));
  root.querySelector('#zoom-size').click();assert.equal(root.querySelector('#image-dialog').classList.contains('is-zoomed'),true);
  root.querySelector('[data-close]').click();
 }
});
test('fixed packs submit number of packs; custom quantity submits individual batteries and clamps to shared inventory',async t=>{
 const{w,root,form,choose}=await setup(t);choose('2 units');
 assert.equal(new w.FormData(form).get('id'),'101');assert.equal(new w.FormData(form).get('quantity'),'1');assert.equal(root.querySelector('#total-price').textContent,'$449.98');
 root.querySelector('#quantity-plus').click();assert.equal(new w.FormData(form).get('quantity'),'2');assert.equal(root.querySelector('#total-price').textContent,'$899.96');assert.match(root.querySelector('#quantity-summary').textContent,/4 batteries in total/);
 choose('4 units');assert.equal(new w.FormData(form).get('id'),'102');assert.equal(root.querySelector('#quantity').max,'3');
 root.querySelector('#quantity').value='100';root.querySelector('#quantity').dispatchEvent(new w.Event('change'));assert.equal(root.querySelector('#quantity').value,'3');
 choose('Any quantity');root.querySelector('#quantity').value='3';root.querySelector('#quantity').dispatchEvent(new w.Event('change'));
 assert.equal(new w.FormData(form).get('id'),'103');assert.equal(new w.FormData(form).get('quantity'),'3');assert.equal(root.querySelector('#total-price').textContent,'$689.97');
});
test('sold-out packs remain browsable but all native purchase routes stay disabled',async t=>{
 const{w,root,form,choose}=await setup(t,false);choose('4 units');
 assert.equal(root.querySelector('#chosen-pack').textContent,'4 units');assert.equal(root.querySelector('#total-price').textContent,'$879.96');
 assert.equal(new w.FormData(form).get('id'),null);
 for(const node of root.querySelectorAll('#quantity,#quantity-plus,#quantity-minus,#purchase-button,[data-suntneew-buy-now]'))assert.equal(node.disabled,true);
 assert.ok([...root.querySelectorAll('.sn-pack-choice__body')].every(card=>card.textContent.includes('Sold out')));
});
test('native cart lock preserves pack quantity, prevents duplicate requests and recovers after an inventory error',async t=>{
 const{w,root,form,choose}=await setup(t);choose('2 units');root.querySelector('#quantity-plus').click();let finish,submitted,calls=0;
 w.fetch=async(url,options)=>{calls++;submitted=[options.body.get('id'),options.body.get('quantity')];return new Promise(resolve=>{finish=resolve;});};
 const first=form._onSubmit({preventDefault(){}});await form._onSubmit({preventDefault(){}});await tick();assert.equal(calls,1);assert.deepEqual(submitted,['101','2']);assert.equal(root.querySelector('#purchase-button').disabled,true);
 finish({ok:false,json:async()=>({description:'Inventory changed. Please try a smaller quantity.'})});await first;await tick();
 assert.match(root.querySelector('.cart-feedback').textContent,/Inventory changed/);assert.equal(root.querySelector('#quantity').value,'2');assert.equal(root.querySelector('#purchase-button').disabled,false);
});
test('sticky price hides above and throughout the main price viewport, and while an image is enlarged',async t=>{
 const{w,root}=await setup(t);let top=100;
 root.querySelector('#total-price').getBoundingClientRect=()=>({top,bottom:top+30});
 root.querySelector('.product-nav').getBoundingClientRect=()=>({top:1000,bottom:1040});
 const scroll=async()=>{w.dispatchEvent(new w.Event('scroll'));await new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));};
 await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,true);
 top=1000;await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,true);
 top=-80;await scroll();assert.equal(root.querySelector('#sticky-buy').hidden,false);
 root.querySelector('.image-button').click();assert.equal(root.querySelector('#sticky-buy').hidden,true);
 root.querySelector('[data-close]').click();assert.equal(root.querySelector('#sticky-buy').hidden,false);
});
test('every selected original retains its recorded hash; the production template routes to the selected PDP and its real review app',()=>{
 const manifest=JSON.parse(read('tools/fixtures/g31-selected-assets-20261110.json'));
 for(const row of manifest.assets){const bytes=fs.readFileSync(new URL('../assets/'+row.full_asset,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),row.original_sha256);}
 const live=JSON.parse(read('templates/product.rv-g31.json').replace(/^\s*\/\*[\s\S]*?\*\/\s*/,''));assert.deepEqual(live.order,['main']);assert.equal(live.sections.main.type,'suntneew-g31-selected');assert.equal(Object.values(live.sections.main.blocks).filter(block=>block.type.startsWith('shopify://apps/judge-me-reviews/')).length,1);
});
