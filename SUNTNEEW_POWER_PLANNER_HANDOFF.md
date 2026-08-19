# SuntNeew Power Planner handoff

## Theme delivery

- Branch: `main`
- Page handle: `/pages/power-calculator`
- Page template: `page.power-calculator`
- Customer-facing name: `SuntNeew Power Planner`
- SEO title supplied by the template: `Power Calculator & Product Finder | SuntNeew`

## Shopify Admin setup

Completed on August 19, 2026:

- Live page: `https://www.suntneew.com/pages/power-calculator`
- Page ID: `gid://shopify/Page/162244755751`
- Page title: `SuntNeew Power Planner`
- Page handle: `power-calculator`
- Template suffix: `power-calculator`
- Published: yes
- Header menu: `suntneew-main-menu-0811`
- Top-level menu item: `Help Me Choose`

The theme also supplies a homepage entry, a Support mega-menu link, a mobile Support link and a Footer fallback link. Do not add duplicate Footer or Support links if the saved Shopify menus are updated later.

## Product catalog and RV topology

The planner reads verified calculator product records rendered by the section. A new product is added through a `Calculator product` block in the Shopify Theme Editor with its capacity, output, footprint, voltage or fuel coverage, and supported limits. A normal Shopify product does not automatically become a calculator record; automatic catalog sync can be added later with product metafields or metaobjects.

For the current RV records, the configured ceiling is 4S4P using identical batteries in balanced strings:

- 12.8V nominal: 1S1P through 1S4P (1-4 batteries)
- 25.6V nominal: 2S1P through 2S4P (2, 4, 6 or 8 batteries)
- 38.4V nominal: 3S1P through 3S4P (3, 6, 9 or 12 batteries)
- 51.2V nominal: 4S1P through 4S4P (4, 8, 12 or 16 batteries)

The interface exposes system voltage and calculates the parallel count from the entered loads and backup period. It does not recommend unbalanced quantities such as 5, 7, 10, 11 or 13-15 batteries. Confirm each product's BMS and manufacturer-approved series/parallel limits before publishing a catalog block; the current defaults assume 4S4P is verified for the four configured RV records.

## Analytics contract

The calculator writes no event until Shopify Customer Privacy reports that analytics processing is allowed. It never adds custom load names or other free text to an event.

Future GA4 or GTM wiring can listen for `event: suntneew_power_planner` with these fields:

- `suntneew_event`: `start`, `scenario_selected`, `step_completed`, `recommendation_viewed`, `support_recommended`, `product_clicked` or `support_clicked`
- `scenario`: `rv`, `jump` or `home`
- `result_type`: stable result category
- `energy_band`: enumerated energy band
- `peak_band`: enumerated peak band
- `product_id`: stable calculator product identifier

Keep the Shopify consent check in place when the downstream GA4/GTM integration is added.
