import fs from 'node:fs';
import { Liquid } from 'liquidjs';
export const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const engine = new Liquid();
engine.registerFilter('json', value => JSON.stringify(value));
engine.registerFilter('money', cents => `$${(Number(cents)/100).toFixed(2)}`);
engine.registerFilter('asset_url', value => `/assets/${value}`);
engine.registerFilter('stylesheet_tag', value => `<link rel="stylesheet" href="${value}">`);
engine.registerFilter('payment_type_svg_tag', value => `<svg aria-label="${value}"></svg>`);
engine.registerFilter('t', (key,...args) => key==='product.rating_count' ? `${Object.fromEntries(args).count} reviews` : key.includes('sold_out') ? 'Sold out' : key);
const groups=[['8000mAh','Orange'],['8000mAh','Red'],['12000mAh','Orange'],['16000mAh','Orange']];
export function product(available=true) {
 const variants=groups.flatMap(([capacity,color],g)=>['1 unit','2 units','4 units','Any quantity'].map((pack,p)=>({id:100+g*10+p,sku:`A20-${g}-${p}`,option1:capacity,option2:color,option3:pack,available,price:[6699,13398,26796,6699][p],compare_at_price:null,quantity_rule:{min:1,increment:1,max:12},inventory_management:'shopify',inventory_policy:'deny',inventory_quantity:available?12:0})));
 return {id:10335382962471,variants,selected_or_first_available_variant:variants[0],options_with_values:[{name:'Capacity',values:['8000mAh','12000mAh','16000mAh']},{name:'Color',values:['Orange','Red']},{name:'Pack',values:['1 unit','2 units','4 units','Any quantity']}],metafields:{reviews:{rating:{value:{rating:4.72,scale_max:5}},rating_count:{value:18}}}};
}
export function render(source=product()) {
 let template=read('sections/suntneew-a20-v8.liquid').split('{% schema %}')[0].replace(/{% form [\s\S]*?%}/g,'<form is="product-form" id="{{ product_form_id }}">').replace(/{% endform %}/g,'</form>').replace(/{% for block in section.blocks %}[\s\S]*?{% endfor %}/,'<div id="judgeme_product_reviews">Customer reviews</div>');
 return engine.parseAndRenderSync(template,{product:source,shop:{currency:'USD',enabled_payment_types:['visa','paypal']},cart:{currency:{iso_code:'USD'}},routes:{root_url:'/',cart_url:'/cart',collections_url:'/collections'},section:{id:'test',blocks:[]}});
}
