#!/usr/bin/env python3
"""Generate the G31 section from the approved image sequence and frozen source settings."""
import json
import re
from html import escape
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
content = json.loads((repo / 'tools/fixtures/g31-selected-content-20261110.json').read_text())
manifest = json.loads((repo / 'tools/fixtures/g31-selected-assets-20261110.json').read_text())
assets = {row['id']:row for row in manifest['assets']}
a20 = (repo / 'sections/suntneew-a20-v8.liquid').read_text()
old = (repo / 'tools/fixtures/g31-approved-template-source-20261110.json').read_text()
template = json.loads(re.sub(r'^\s*/\*[\s\S]*?\*/\s*','',old))

def asset_url(name):
    return "{{ '" + name + "' | asset_url | json }}"

def picture(row, eager=False):
    asset = assets[row['id']]
    purpose = escape(row['purpose'], quote=True)
    return f'''<div class="image-module"><button class="image-button" type="button" data-image-id="{row['id']}" aria-label="Enlarge {purpose} image"><img src={asset_url(asset['display_asset'])} width="{asset['display_width']}" height="{asset['display_height']}" alt="SuntNeew G31 — {purpose}" loading="{'eager' if eager else 'lazy'}" decoding="async" draggable="false"{' fetchpriority="high"' if eager else ''}><span class="zoom-label" aria-hidden="true">+</span></button></div>'''

gallery_cards = ''.join(f'<article class="feature-card" data-image-id="{row["id"]}">{picture(row,i==0)}</article>' for i,row in enumerate(content['gallery']))
gallery = f'<div class="feature-pair gallery-pair"><div class="pair-track" role="region" aria-label="G31 product images">{gallery_cards}</div></div>'
feature_fallback = []
data = {'assets':[], 'gallery_assets':[], 'config':[]}
for i,row in enumerate(content['gallery']):
    item = assets[row['id']]
    data['gallery_assets'].append({**row, 'asset_id':row['id'], 'group':'gallery', 'option':f'{i+1:02}', 'src':item['display_asset'], 'zoom_src':item['full_asset'], 'thumb_src':item['thumb_asset'], 'width':item['display_width'], 'height':item['display_height']})
for group in content['features']:
    data['config'].append({key:value for key,value in group.items() if key!='images'})
    images = []
    for i,row in enumerate(group['images']):
        item = assets[row['id']]
        data['assets'].append({**row, 'asset_id':row['id'], 'group':group['group'], 'option':f'{i+1:02}', 'src':item['display_asset'], 'zoom_src':item['full_asset'], 'width':item['display_width'], 'height':item['display_height']})
        images.append(picture(row))
    heading = '' if group.get('kind')=='opening' else f'<div class="section-heading"><p class="eyebrow">{escape(group["eyebrow"])}</p><h2>{escape(group["heading"])}</h2><p>{escape(group["body"])}</p></div>'
    note = f'<p class="support-text">{escape(group["note"])}</p>' if group.get('note') else ''
    feature_fallback.append(f'<section class="{"feature-opening" if group.get("kind")=="opening" else "feature-section"}" data-group="{group["group"]}">{heading}{"".join(images)}{note}</section>')
asset_data = json.dumps(data, ensure_ascii=False, separators=(',',':'))
for row in manifest['assets']:
    for key in ['display_asset','full_asset','thumb_asset']:
        if row[key]:asset_data = asset_data.replace(json.dumps(row[key]), asset_url(row[key]))

def div_block(source, opening):
    start=source.index(opening);depth=0
    for tag in re.finditer(r'</?div\b[^>]*>',source[start:]):
        depth += -1 if tag.group().startswith('</') else 1
        if depth==0:return source[start:start+tag.end()]
    raise ValueError(opening)

assurances=div_block(a20,'<div class="assurances"').replace('a20-assurance','g31-assurance').replace('A20','G31').replace('support-a20','support-rv-g31')
highlights=[
 ('Power for the way you travel.','12.8V 100Ah and 1,280Wh for RV house loads, compatible trolling motors and solar storage.'),
 ('A quick check from your phone.','Bluetooth monitoring puts charge level, voltage, current and temperature close at hand.'),
 ('Built for repeat trips.','LiFePO4 cells rated for 4,000+ cycles at 100% depth of discharge.'),
 ('Protection built in.','100A BMS, low-temperature charge protection and an IP65 enclosure.'),
 ('Lighter to lift. Room to expand.','About 21.2 lb, with support for matched batteries in up to a 4P4S bank.')
]
points=''.join(f'<li><span><strong>{escape(title)}</strong> {escape(text)}</span></li>' for title,text in highlights)
specs=[]
for key in template['sections']['main']['block_order']:
    block=template['sections']['main']['blocks'][key]
    if block['type']=='spec':specs.append(f'<div><dt>{escape(block["settings"]["label"])}</dt><dd>{escape(block["settings"]["value"])}</dd></div>')
review_source="""{% for block in section.blocks %}{% if block.type == '@app' %}{% render block %}{% endif %}{% endfor %}"""
rating=a20[a20.index('{%- assign rating ='):a20.index('<p class="product-description">')]
dialog=a20[a20.index('<dialog id="image-dialog"'):a20.index('<noscript>')].replace('A20','G31')
schema={'name':'G31 selected PDP','tag':'section','class':'g31-selected-product-section','settings':[],'blocks':[{'type':'@app'}],'max_blocks':5}
section="""{% comment %}G31 selected PDP. Shared SHOP product images are preserved; reviews render through the existing app block.{% endcomment %}
{{ 'suntneew-g31-selected.css' | asset_url | stylesheet_tag }}
<script src={{ 'suntneew-g31-selected.js' | asset_url | json }} defer></script>
<script src={{ 'suntneew-purchase-panel.js' | asset_url | json }} defer></script>
{% liquid
 assign selected_variant = product.selected_or_first_available_variant
 assign product_form_id = 'g31-selected-form-' | append: section.id
 assign selected_min = selected_variant.quantity_rule.min | default: 1
 if selected_variant.option1 == 'Any quantity'
  assign selected_min = selected_min | at_least: 5
 endif
%}
<div class="sn-g31-pdp" data-g31-pdp data-form="{{ product_form_id }}">
<script type="application/json" data-g31-product>{"currency":{{ cart.currency.iso_code | default: shop.currency | json }},"selectedId":{{ selected_variant.id | append: '' | json }},"variants":[{% for variant in product.variants %}{% liquid
 assign variant_min = variant.quantity_rule.min | default: 1
 if variant.option1 == 'Any quantity'
  assign variant_min = variant_min | at_least: 5
 endif
 assign variant_max = variant.quantity_rule.max | default: 999
 if variant.requires_components or variant.inventory_management != blank and variant.inventory_policy == 'deny'
  assign variant_max = variant_max | at_most: variant.inventory_quantity
 endif
%}{"id":{{ variant.id | append: '' | json }},"sku":{{ variant.sku | json }},"pack":{{ variant.option1 | json }},"available":{{ variant.available | json }},"priceCents":{{ variant.price | json }},"compareAtCents":{{ variant.compare_at_price | default: 0 | json }},"min":{{ variant_min | json }},"max":{{ variant_max | json }},"step":{{ variant.quantity_rule.increment | default: 1 | json }}}{% unless forloop.last %},{% endunless %}{% endfor %}]}</script>
"""+f'<script type="application/json" data-g31-assets>{asset_data}</script>\n'+"""
<div class="preview-frame" id="frame"><div class="storefront" id="top">
  <div class="breadcrumb content"><a href="{{ routes.root_url }}">Home</a><span>›</span><a href="/pages/shop#rv-batteries">RV Batteries</a><span>›</span><span>Group 31</span></div>
  <section id="gallery" class="product-hero" aria-labelledby="product-title">
    <div class="product-gallery"><div id="gallery-content" aria-busy="false">"""+gallery+"""</div><p class="gallery-help"><span class="gallery-help-desktop">Move over the image to browse photos. Click to enlarge.</span><span class="gallery-help-mobile">Swipe to explore · Tap an image to enlarge.</span></p><div class="gallery-assurances-slot" id="gallery-assurances-slot">"""+assurances+"""</div></div>
    <div class="product-summary" id="sales-summary">
      <p class="eyebrow">SUNTNEEW / GROUP 31</p><h1 id="product-title">Group 31<br> LiFePO4 RV Battery</h1>
      <p class="product-spec-line">12.8V · 100Ah · 1,280Wh · Bluetooth</p>
      """+rating+"""
      <p class="product-description">House power for the road. Deep-cycle power for the water. One lighter battery for your next setup.</p>
      <ul class="product-highlights" aria-label="Product highlights">"""+points+"""</ul>
      <div class="sn-pack-total" id="main-price" aria-live="polite" aria-atomic="true"><p class="sn-pack-total__label">Total price</p><div class="sn-pack-total__amounts"><strong id="total-price">{{ selected_variant.price | money }}</strong><del id="compare-price" hidden></del><span>{{ cart.currency.iso_code | default: shop.currency }}</span></div><p class="sn-pack-total__saving" id="total-saving" hidden></p></div>
      <p class="product-tax">Taxes calculated at checkout.</p>
      <div class="product-options"><fieldset class="pack-options"><legend>Pack: <span id="chosen-pack">{{ selected_variant.option1 | escape }}</span></legend><div class="pack-choices" id="pack-choices">{% for variant in product.variants %}<label class="sn-pack-choice"><input type="radio" name="pack" value="{{ variant.option1 | escape }}"{% if variant.id == selected_variant.id %} checked{% endif %}><span class="sn-pack-choice__body"><strong>{{ variant.option1 | escape }}</strong></span></label>{% endfor %}</div></fieldset></div>
      {% form 'product', product, is: 'product-form', id: product_form_id %}
        <p class="quantity-label"><label id="quantity-label" for="quantity">Number of units</label></p>
        <div class="purchase-row"><div class="quantity-control"><button id="quantity-minus" type="button" aria-label="Decrease quantity" disabled>−</button><input id="quantity" name="quantity" type="number" min="{{ selected_min }}" step="1" value="{{ selected_min }}" inputmode="numeric" aria-describedby="quantity-summary" disabled><button id="quantity-plus" type="button" aria-label="Increase quantity" disabled>+</button></div><button id="purchase-button" class="purchase-button" type="submit"{% unless selected_variant.available %} disabled{% endunless %}><span id="purchase-label">{% if selected_variant.available %}Add to cart{% else %}Sold out{% endif %}</span></button></div>
        <button type="button" class="buy-now" data-suntneew-buy-now{% unless selected_variant.available %} disabled{% endunless %}>Buy now</button><input type="hidden" name="id" id="selected-variant" value="{{ selected_variant.id }}">
      {% endform %}
      <p class="cart-feedback" role="status" aria-live="polite" hidden></p><a class="cart-feedback-link" href="{{ routes.cart_url }}" hidden>View your cart →</a>
      <p class="quantity-summary" id="quantity-summary" aria-live="polite" aria-atomic="true"></p><p class="stock-status" id="stock-status" role="status"{% if selected_variant.available %} hidden{% endif %}>Currently sold out.</p>
      <a class="fit-help" href="#specs">Check dimensions &amp; system fit →</a>
      <div class="purchase-trust" aria-label="Payment and purchase support"><p class="payment-title">Pay securely with</p><ul class="payment-icons" aria-label="Accepted payment methods">{% for type in shop.enabled_payment_types %}<li title="{{ type | replace: '_', ' ' | escape }}">{{ type | payment_type_svg_tag }}</li>{% endfor %}</ul><div class="mobile-assurances-slot" id="mobile-assurances-slot"></div></div>
      <div class="product-links"><a href="#manuals">G31 manual ↗</a><a href="/pages/support-rv-g31" target="_blank" rel="noopener">Product support ↗</a></div>
    </div>
  </section>
  <nav class="product-nav content" aria-label="Product information"><a href="#features">Features</a><a href="#specs">Specifications</a><a href="#box">In the box</a><a href="#manuals">User Manual</a><a href="#reviews">Reviews</a><a href="#support">Support</a><a href="#faq">FAQ</a></nav>
  <div class="intro content" id="features"><p class="eyebrow">GROUP 31 / AT HOME OFF THE GRID</p><h2 class="features-title">Power for wherever you park.</h2><p class="lead">A closer look at the battery behind your next trip.</p></div>
  <div id="feature-content" aria-busy="false">"""+''.join(feature_fallback)+"""</div>
  <section class="pdp-section detail-grid" id="specs"><div><p class="eyebrow">KNOW YOUR G31</p><h2>Check the fit.<br>Plan your system.</h2><p class="section-intro">Key dimensions and ratings for your installation.</p><a class="text-link" href="#manuals">Manuals &amp; documents →</a></div><div><dl class="spec-table">"""+''.join(specs[:4]+specs[19:21])+"""</dl><details class="more-details"><summary>More specifications</summary><dl class="spec-table">"""+''.join(specs[4:19]+specs[21:])+"""</dl></details><details class="more-details" id="manuals"><summary>Manuals &amp; documents</summary><div class="manual-list"><a href="{{ 'suntneew-rv-g31-manual-en-fr-de.pdf' | asset_url }}" target="_blank" rel="noopener">Group 31 user manual · EN / FR / DE (PDF) ↗</a><a href="/pages/support-rv-g31#certifications" target="_blank" rel="noopener">Model documents &amp; compliance references ↗</a></div></details></div></section>
  <section class="pdp-section detail-grid" id="box"><div><p class="eyebrow">YOUR KIT</p><h2>What comes with your G31.</h2><p class="section-intro">Package contents listed per battery.</p></div><div><ul class="package-list"><li><span class="item-number">01</span><span>Group 31 LiFePO4 battery × 1</span></li><li><span class="item-number">02</span><span>Terminal screws × 2</span></li><li><span class="item-number">03</span><span>Terminal washers × 2</span></li><li><span class="item-number">04</span><span>Insulating caps × 2</span></li><li><span class="item-number">05</span><span>User manual × 1</span></li></ul><p class="package-note" id="box-quantity-note">Package contents listed per battery.</p></div></section>
  <section class="pdp-section" id="reviews" aria-label="Customer reviews">"""+review_source+"""</section>
  <section class="support-section" id="support"><div class="pdp-section support-grid"><div><p class="eyebrow">SUNTNEEW, AFTER THE SALE</p><span class="warranty-number">5<small>YEAR</small></span><h2>Here for the road ahead.</h2><p class="support-copy">A five-year limited warranty for eligible defects under normal use, with product support for setup and use.</p><a class="text-link" href="/pages/warranty" target="_blank" rel="noopener">Warranty &amp; service details ↗</a></div><div class="support-links"><a href="/pages/shipping-policy" target="_blank" rel="noopener"><span><strong>Free U.S. standard shipping.</strong><small>To the contiguous 48 states and Washington, DC.</small></span><span class="link-arrow">↗</span></a><a href="/pages/return-policy" target="_blank" rel="noopener"><span><strong>14 days to request a return.</strong><small>Contact us for approval before returning eligible items.</small></span><span class="link-arrow">↗</span></a><a href="/pages/support-rv-g31" target="_blank" rel="noopener"><span><strong>Questions now. Support later.</strong><small>Help with product selection, setup and use.</small></span><span class="link-arrow">↗</span></a><a href="/pages/contact-us" target="_blank" rel="noopener"><strong>Talk to SuntNeew</strong><span class="link-arrow">↗</span></a></div></div></section>
  <section class="pdp-section detail-grid" id="faq"><div><p class="eyebrow">BEFORE YOU GO</p><h2>A few useful answers.</h2><p class="section-intro">More questions about your G31?</p><a class="text-link" href="/pages/support-rv-g31" target="_blank" rel="noopener">We’re here to help ↗</a></div><div class="faq-group"><details><summary>Can this battery start my RV engine?</summary><div class="faq-answer"><p>No. G31 is a LiFePO4 deep-cycle battery for auxiliary and energy-storage systems. It is not an engine-starting battery.</p></div></details><details><summary>Will it fit every Group 31 battery tray?</summary><div class="faq-answer"><p>Check the 339 × 185 × 218mm case dimensions, hold-down arrangement, terminal access and cable clearance. Group size alone does not confirm physical fit.</p></div></details><details><summary>Can I use my existing lead-acid charger?</summary><div class="faq-answer"><p>Use compatible 14.4–14.6V LiFePO4 charging as specified in the manual. A charger with a lead-acid-only mode may not be suitable.</p></div></details><details><summary>Can I charge it below freezing?</summary><div class="faq-answer"><p>The low-temperature protection stops charging below 0°C (32°F); charging resumes above 5°C (41°F). It does not heat the battery. Follow the temperature limits in the manual.</p></div></details><details><summary>Does IP65 mean the battery can be submerged?</summary><div class="faq-answer"><p>No. IP65 covers dust and water-jet protection under the applicable rating conditions. It is not an immersion rating.</p></div></details></div></section>
  <section class="closing-banner"><div><p class="eyebrow">SUNTNEEW / GROUP 31</p><h2>Make more of the road.</h2></div><a class="orange-link" href="#sales-summary">Choose your G31 ↑</a></section>
</div></div>
<aside class="sticky-buy" id="sticky-buy" aria-label="Quick product options" hidden><div class="sticky-buy-inner"><span class="sticky-product"><strong>Group 31</strong><small id="sticky-options"></small></span><strong class="sticky-price" id="sticky-total">{{ selected_variant.price | money }}</strong><a class="orange-link" href="#sales-summary">Choose your options ↑</a></div></aside>
"""+dialog+"""
<noscript><p>Enable JavaScript to browse images and choose your G31 pack.</p></noscript></div>
{% schema %}
"""+json.dumps(schema,indent=2)+"\n{% endschema %}\n"
(repo/'sections/suntneew-g31-selected.liquid').write_text(section)
review_block = template['sections']['main']['blocks']['judge_me_reviews_review_widget_rvg31']
preview = {'sections':{'main':{'type':'suntneew-g31-selected','blocks':{'g31_reviews':review_block},'block_order':['g31_reviews'],'settings':{}}},'order':['main']}
(repo/'templates/product.g31-selected-preview.json').write_text(json.dumps(preview,indent=2)+'\n')
css=(repo/'assets/suntneew-a20-v8.css').read_text().replace('.sn-a20-pdp','.sn-g31-pdp').replace('.a20-approved-product-section','.g31-selected-product-section')
css += '\n/* G31 images retain their original aspect ratios without cropping. */\n.sn-g31-pdp .gallery-pair .image-module,.sn-g31-pdp .gallery-pair .image-button{height:100%}\n.sn-g31-pdp .gallery-pair .image-button img{width:100%;height:100%;object-fit:contain}\n.sn-g31-pdp .gallery-lightbox .zoom-scroll img{object-fit:contain}\n.sn-g31-pdp .feature-card .image-button img{background:#fff}\n'
(repo/'assets/suntneew-g31-selected.css').write_text(css)
print('Built G31 section, styles and unassigned preview template.')
