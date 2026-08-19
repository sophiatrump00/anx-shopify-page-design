# SuntNeew Power Planner handoff

## Theme delivery

- Branch: `feature/suntneew-power-calculator`
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
