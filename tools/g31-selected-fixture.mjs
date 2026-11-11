import fs from 'node:fs';
import { Liquid } from 'liquidjs';
export const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const engine=new Liquid();
engine.registerFilter('json',value=>JSON.stringify(value));
engine.registerFilter('money',cents=>`$${(Number(cents)/100).toFixed(2)}`);
engine.registerFilter('asset_url',value=>`/assets/${value}`);
engine.registerFilter('stylesheet_tag',value=>`<link rel="stylesheet" href="${value}">`);
engine.registerFilter('payment_type_svg_tag',value=>`<svg aria-label="${value}"></svg>`);
engine.registerFilter('t',(key,...args)=>key==='product.rating_count'?`${Object.fromEntries(args).count} reviews`:key);
export function product(available=true){
 const variants=['1 unit','2 units','4 units','Any quantity'].map((pack,index)=>({id:String(100+index),sku:`G31-${index}`,option1:pack,available,price:[22999,44998,87996,21800][index],compare_at_price:[32999,65998,131996,32999][index],quantity_rule:{min:1,increment:1,max:12},inventory_management:'shopify',inventory_policy:'deny',inventory_quantity:available?[12,6,3,12][index]:0,requires_components:index>0}));
 return {id:'10335382733095',variants,selected_or_first_available_variant:variants[0],metafields:{}};
}
export function render(source=product(),reviewsHTML=''){
 const template=read('sections/suntneew-g31-selected.liquid').split('{% schema %}')[0]
  .replace(/{% form [\s\S]*?%}/g,'<form is="product-form" id="{{ product_form_id }}">').replace(/{% endform %}/g,'</form>')
  .replace(/{% for block in section.blocks %}[\s\S]*?{% endfor %}/,reviewsHTML);
 return engine.parseAndRenderSync(template,{product:source,shop:{currency:'USD',enabled_payment_types:[]},cart:{currency:{iso_code:'USD'}},routes:{root_url:'/',cart_url:'/cart'},section:{id:'g31-selected-preview',blocks:[]}});
}
