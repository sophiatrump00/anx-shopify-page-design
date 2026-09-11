# SuntNeew PDP media and 3D handoff

This brief is for the A20/A3 product-detail experience now present in the draft theme. The theme keeps the **Videos** and **3D** controls hidden until matching Shopify product media is attached; it does not display empty buttons.

## 1. A+ feature-image set

Deliver one numbered set for each product family, ideally in the intended display order:

1. `01-hero`: clean product packshot; keep critical text and the product away from the outer 10% edge.
2. `02-feature`: one strongest functional benefit, with a short claim that has source evidence.
3. `03-detail`: close detail such as clamps, ports, display, handle or case.
4. `04-use-case`: real and safe application scene.
5. `05-dimensions`: measured dimensions and product weight, with the unit clearly identified.
6. `06-in-the-box`: actual supplied contents, laid out clearly.
7. `07-comparison`: only a source-backed comparison; do not use unverified performance claims.
8. `08-support`: QR/manual/certification or support-route image when applicable.

Recommended delivery: 8–12 JPG or WebP images, 2000 px or wider on the long edge, one consistent aspect ratio per product, plus a text-free source version for future localization. The gallery has an automatic feature-image cycle; hovering it expands to image thumbnails.

## 2. Product video

Deliver an MP4 as the preferred master, a clean poster image, English caption/transcript text and a concise title. The strongest first video is a 20–45 second product-and-use demonstration; avoid unsupported claims in voiceover or on-screen copy.

Shopify accepts MP4, MOV and WebM product video files, up to 10 minutes, 1 GB and 4K. The product-page **Videos** control appears automatically only after a video is attached in Shopify Admin.

## 3. Interactive 3D / AR

### Required package from the artist or factory

- A production-ready **GLB** model as the primary file. Shopify can also accept USDZ; provide both when the artist can export them cleanly.
- Native CAD or mesh source for archive/revision: STEP/IGES/SolidWorks/Blender/FBX as applicable.
- Exact real-world measurements in **mm**: length, width, height, terminal/port positions, handle geometry and any critical clearance.
- Separate material-ready mesh with clean UVs, plus PBR texture maps: base color, metallic/roughness, normal, ambient occlusion; add emissive/transparency maps only if the product really needs them.
- High-resolution logo/label artwork, QR/barcode artwork and readable approved panel copy as vectors or separate textures.
- Six approved reference photos (front, back, left, right, top, bottom), a 360-degree turntable if available, and one real product beside a scale reference.
- Variant boundary note: which colors/capacities share exactly the same shell, labels and terminals. Shopify does not assign 3D models or videos as variant-specific product media, so meaningful physical variants need their own media plan.

### Technical target and approval check

- Target a visually clean GLB below 15 MB for the fastest experience; Shopify accepts 3D files up to 500 MB and automatically optimizes larger uploads.
- Use real scale, centered origin and a neutral default camera angle. Confirm that labels are legible, surfaces are not stretched, metallic/transparent parts render plausibly, and the model has no gaps or unwanted holes.
- Approve on desktop, Android and iPhone/iPad AR before attaching it to the product. The theme already uses Shopify's native model viewer and AR entry point; the **3D** control appears when the model exists.

## 4. Multi-pack data needed before enabling the selector

The theme contains a disabled multi-pack selector. Before it can be turned on, provide and approve:

1. The specific product/SKUs covered and whether customers can mix variants.
2. Discount rule: 2+ units save 3%, 3+ units save 6%, and 4+ units save 9%; confirm whether this exact ladder applies to every covered SKU.
3. Whether the automatic discount stacks with coupons, bundles or wholesale/B2B pricing.
4. Inventory/fulfilment handling for multiple units and any maximum-per-order rule.
5. Final customer-facing wording and the person approving the price policy.

### Checkout setup and test gate

For a non-Plus store, do not create three combinable product discounts: Shopify documents that product discounts on the same item combine only on Shopify Plus. Instead, configure three **non-combinable** automatic product discounts for the same approved products/SKUs, then test that Shopify selects the best eligible one:

| Cart quantity | Automatic product discount |
| --- | --- |
| 2+ | 3% off |
| 3+ | 6% off |
| 4+ | 9% off |

The current active rules cover A20, A3, U23 and U32 only. Their product pages use 1, 2, 5 and 10 as presets, so the effective preset savings are 0%, 3%, 9% and 9%; customers can still enter 3 or 4 through the standard quantity control. Keep every other promotion, coupon and bundle rule in the test. Shopify selects the best qualifying non-combinable discount, so acceptance requires real cart checks at 1, 2, 3, 4, 5 and 10 units before savings are shown. Do not enable savings on home-storage or RV templates unless the matching Shopify discounts are expanded to those products.

## Sources

- Shopify Help: [Product media types](https://help.shopify.com/en/manual/products/product-media/product-media-types)
- Shopify Help: [Adding product media](https://help.shopify.com/en/manual/products/product-media/add-media)
- Shopify Help: [Hiring a Shopify Partner to create 3D models](https://help.shopify.com/en/manual/products/product-media/expert-3d-model)
- Shopify Help: [Amount off discounts](https://help.shopify.com/en/manual/discounts/discount-types/percentage-fixed-amount)
- Shopify Help: [Combining discounts](https://help.shopify.com/en/manual/discounts/discount-combinations)

## RV series media order

Two separate placements, changed through different systems:

| Placement | Source of truth | Rule |
| --- | --- | --- |
| Collection card, first image | Shopify product media position 1 | the battery's **front view** |
| Collection card, hover image | Shopify product media position 2 | the **package contents** |
| Product page gallery | `snippets/suntneew-rv-gallery.liquid` | the approved slide order; do not reorder for card work |

The product-page gallery keeps its own order on purpose. Changing the Shopify media order does not touch it, and changing the gallery snippet does not touch the card, so the two never need to be edited together.

RV front views live in `assets/` as `suntneew-rv-<model>-gallery-front.jpg` (230Ah reuses the bundled `suntneew-rv-230ah-gallery-front-v2.jpg`). Group 24 / 230Ah / 314Ah front views come from the product asset library (`G24 4.jpg` render, `GALLERY_01_230Ah_front.jpg`, `ANCHOR_02_314Ah_正面_2000x2000.jpg`); Group 31 reuses the bundled `suntneew-rv-g31-gallery-front.jpg`. They are registered in `tools/seo-asset-sources.json`; after replacing one, run `python3 tools/optimize-storefront-assets.py` so the WebP variants and `snippets/suntneew-asset-metadata.liquid` stay in sync.

### Card hover media

The theme shows the product's **second** Shopify media as the collection-card hover image (`snippets/product-card.liquid`, `product-card--show-secondary-media`). Every published product except the three home-storage systems now uses that slot for the package contents:

| Product line | Hover media (position 2) |
| --- | --- |
| RV Group 24 / 230Ah | the product's own `…-pdp-in-box-desktop_…jpg` |
| RV Group 31 / 314Ah | the gallery's in-box image (`suntneew-rv-g31-final-gallery-in-box-v2.jpg`, `suntneew-rv-314ah-gallery-in-box-output.png`) |
| A20 / U23 / KB700 | the product's own in-box / in-the-box media |
| A3 | `a3-gallery-in-the-box_…jpg` (already second before the change) |
| U32 | `suntneew-u32-2026-gallery-07-in-box.jpg`, taken from the U32 asset library (`主图7.jpg`, documented as 包装与配件) |
| OJ02 | `suntneew-oj02-gallery-07-accessories.jpg` |
| WL5A / WL10B / VH | unchanged install scene — the package-contents images do not exist yet |
| AD19 | unchanged (member-drop product, hidden from `/collections/all`) |

Two consequences to keep in mind:

- **RV product pages are theme-driven**, so their PDP gallery order did not change. The jump-starter product pages render the Shopify media, so there the package-contents image is also the second gallery slide.
- The product media order is the only source of truth — no theme code depends on these filenames. To change a hover image later, drag that media into the second slot in Shopify Admin → Products → Media.

`anx-store-automation/examples/card-hover/` keeps the snapshot, reorder and media-creation queries used for this change (note that `productReorderMedia` positions are zero-based: `newPosition: "1"` = second slot).
