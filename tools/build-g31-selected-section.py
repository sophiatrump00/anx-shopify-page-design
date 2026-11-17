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
<script src={{ 'suntneew-progressive-faq.js' | asset_url | json }} defer></script>
{% liquid
 assign selected_variant = product.selected_or_first_available_variant
 if selected_variant.option1 == 'Any quantity'
  for candidate in product.variants
   if candidate.option1 != 'Any quantity' and candidate.available
    assign selected_variant = candidate
    break
   endif
  endfor
  if selected_variant.option1 == 'Any quantity'
   for candidate in product.variants
    if candidate.option1 != 'Any quantity'
     assign selected_variant = candidate
     break
    endif
   endfor
  endif
 endif
 assign product_form_id = 'g31-selected-form-' | append: section.id
 assign selected_min = selected_variant.quantity_rule.min | default: 1
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
  <div class="breadcrumb content" role="navigation" aria-label="Breadcrumb"><a href="{{ routes.root_url }}">Home</a><span aria-hidden="true">›</span><a href="/pages/shop#shop-rv-batteries">RV Batteries</a><span aria-hidden="true">›</span><a href="#sales-summary" aria-current="page">Group 31</a></div>
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
      <div class="product-options"><fieldset class="pack-options"><legend>Pack: <span id="chosen-pack">{{ selected_variant.option1 | escape }}</span></legend><div class="pack-choices" id="pack-choices">{% for variant in product.variants %}{% unless variant.option1 == 'Any quantity' %}<label class="sn-pack-choice"><input type="radio" name="pack" value="{{ variant.option1 | escape }}"{% if variant.id == selected_variant.id %} checked{% endif %}><span class="sn-pack-choice__body"><strong>{{ variant.option1 | escape }}</strong></span></label>{% endunless %}{% endfor %}</div></fieldset></div>
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
  <section class="pdp-section sn-faq-section" id="faq"><div class="sn-faq-head"><p class="eyebrow">BEFORE YOU GO</p><h2>Questions before you order.</h2><p class="section-intro">Quick technical and compatibility checks for your G31.</p><a class="text-link" href="/pages/support-rv-g31" target="_blank" rel="noopener">Full G31 support guide ↗</a></div><div class="sn-faq-list-wrap"><div class="faq-group" data-progressive-faq>
    <details data-faq-id="g31-q1"><summary>Can G31 start my RV or boat engine?</summary><div class="faq-answer"><p>No. G31 is a deep-cycle 12.8V 100Ah house battery (100A max continuous, 1,280W) built for RV appliances, solar storage, and 30–55 lb thrust trolling motors—not engine cranking.</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q1" hidden><summary>What can 1,280Wh run on a trip?</summary><div class="faq-answer"><p>Expect roughly 1,000–1,150Wh of usable AC power after inverter efficiency (~85–90%)—for example, ~16–20 hours on a typical 60W 12V fridge, or ~1 hour at 1,000W. Keep continuous draw within 1,280W (100A) and switch the inverter off before connecting to avoid a capacitor spark.</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q1" hidden><summary>Can I wire multiple G31 batteries together?</summary><div class="faq-answer"><p>Yes, up to 4S or 4P (4P4S max: 51.2V 400Ah / 20.48kWh). Connect only identical SuntNeew G31 units purchased within ~1 month, charge each individually to 100% (≥13.6V resting) before wiring, and rebalance every 6 months.</p></div></details>
    <details data-faq-id="g31-q2"><summary>Will it fit a standard Group 31 tray?</summary><div class="faq-answer"><p>Measure your compartment before ordering: G31 is 339 × 185 × 218 mm (13.34 × 7.28 × 8.58 in) excluding M8 × 12 mm bolts (12–14 N·m torque), and weighs 21.16 lb.</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q2" hidden><summary>Can I use my existing lead-acid charger?</summary><div class="faq-answer"><p>Only if it supports a 14.4V ± 0.2V CC/CV LiFePO4 profile (14.6V max cut-off). Lead-acid chargers locked to equalization or desulfation modes are not suitable.</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q2" hidden><summary>Can I charge from solar panels or an alternator?</summary><div class="faq-answer"><p>Yes, with regulation. Connect solar panels through a 12V LiFePO4 solar controller (30A recommended, ~4 hours to full), and wire alternators through a DC-to-DC charger—never connect either directly to the battery.</p></div></details>
    <details data-faq-id="g31-q3"><summary>What happens if it gets below freezing?</summary><div class="faq-answer"><p>The BMS stops charging below 0°C (32°F) and resumes above 5°C (41°F) to protect the cells (no internal self-heater), while discharging works from −20°C to 60°C (−4°F to 140°F).</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q3" hidden><summary>Why does the battery read &lt;10V or not charge at first?</summary><div class="faq-answer"><p>G31 ships at ~50% charge, and the BMS cuts output below 10V in protection mode. Disconnect all loads and chargers for 30 minutes to auto-recover (&gt;10V), or wake it with a LiFePO4 lithium-activation charger (or a 12.8V solar controller in sunlight for 3–10 seconds).</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q3" hidden><summary>What does the Bluetooth app show?</summary><div class="faq-answer"><p>Scan the QR code on the top lid to pair over Bluetooth 5.0 and view live state of charge (%), voltage, current, and cell temperature from your phone.</p></div></details>
    <details class="faq-related" data-faq-parent="g31-q3" hidden><summary>Is G31 waterproof for marine or outdoor mounting?</summary><div class="faq-answer"><p>Rated IP65 against dust and low-pressure water jets—not immersion. Install upright with terminals facing up in a dry, ventilated compartment and fit the insulating terminal caps.</p></div></details>
  </div><div class="faq-more-row" hidden><button type="button" class="faq-more-toggle" data-faq-toggle-all aria-expanded="false"></button></div></div></section>
  <section class="closing-banner"><div><p class="eyebrow">SUNTNEEW / GROUP 31</p><h2>Make more of the road.</h2></div><a class="orange-link" href="#sales-summary">Choose your G31 ↑</a></section>
</div></div>
<aside class="sticky-buy" id="sticky-buy" aria-label="Quick purchase bar" hidden><div class="sticky-buy-inner"><div class="sticky-meta"><span class="sticky-product"><strong>Group 31</strong><small id="sticky-options">{{ selected_variant.option1 | escape }}</small></span><div class="sticky-pricing"><strong class="sticky-price" id="sticky-total">{{ selected_variant.price | money }}</strong><a class="sticky-change-link" href="#sales-summary">Options ↑</a></div></div><div class="sticky-actions"><button id="sticky-purchase-button" class="purchase-button sticky-atc-button" type="submit" form="{{ product_form_id }}"{% unless selected_variant.available %} disabled{% endunless %}><span id="sticky-purchase-label">{% if selected_variant.available %}Add to cart{% else %}Sold out{% endif %}</span></button><button id="sticky-buy-now" type="button" class="buy-now sticky-buy-now-button" form="{{ product_form_id }}" data-suntneew-buy-now{% unless selected_variant.available %} disabled{% endunless %}>Buy now</button></div></div><p class="sticky-feedback" id="sticky-feedback" role="status" aria-live="polite" hidden></p></aside>
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
