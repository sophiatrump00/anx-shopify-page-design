# G31 mobile PDP preview v1

A mobile preview of the SuntNeew Group 31 product page, following LiTime's mobile information order, gallery, pack selector, detail tabs, and fixed purchase dock. The source is isolated from the normal theme layout and product template.

## Preview

Shopify theme: `190498636071` (unpublished).

https://www.suntneew.com/products/suntneew-12-8v-100ah-lifepo4-rv-battery-group-31?preview_theme_id=190498636071&view=g31-mobile-preview&pb=0

The page intentionally displays a mobile canvas up to 430 CSS pixels, including on desktop. All header and purchase buttons are demonstrations. They do not create a cart or start checkout. Product template assignments and the published theme are unchanged.

## Build and local view

From the theme repository root:

```sh
python tools/g31-litime-mobile-preview/build.py
python -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/tools/g31-litime-mobile-preview/`.

Edit `index.html` and the shared `assets/suntneew-g31-mobile-preview.css` / `.js`. Run the builder to regenerate `layout/g31-mobile-preview.liquid` and `templates/product.g31-mobile-preview.liquid`. Only those four theme files are needed in the preview theme; existing G31 assets come from the cloned source theme.

## Sources and behavior

- Layout reference inspected 2026-11-05: https://www.litime.com/products/12v-100ah-lithium-trolling-motor-battery-with-bluetooth?variant=45378342387932
- Images, story copy, 26 specifications, seven FAQs, included items, and manual: the existing `templates/product.rv-g31.json` and G31 assets at base commit `d379e8c6ea4e03736642ad23e05bee4b41dbebae`.
- Shopify renders the current product title, variant price, compare-at price, availability, rating, review count, and Judge.me reviews. The local HTML uses the 2026-11-05 snapshot: $240.00 / $329.99, 5.0 from two reviews.
- Pack choices are quantity shortcuts, not discounted bundles. Totals always use the current single-unit price. The preview does not model quantity inventory limits.
- Gallery includes nine images, swipe, thumbnails, and zoom; no automatic image rotation. Detail tabs support keyboard arrows, Home, and End.
- Both the layout and local page include `noindex, nofollow`. The alternate Shopify template only renders this G31 product.
- LiTime's product claims, customer reviews, logo, media, delivery promises, and promotions are not reused.

This is a layout review, not a published storefront release or a completed checkout test. Mobile viewport checks do not replace a physical phone review.
