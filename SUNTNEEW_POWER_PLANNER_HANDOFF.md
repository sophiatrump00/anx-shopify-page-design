# SuntNeew Power Planner handoff

## Theme delivery

- Branch: `feature/suntneew-power-calculator`
- Page handle: `/pages/power-calculator`
- Page template: `page.power-calculator`
- Customer-facing name: `SuntNeew Power Planner`
- SEO title supplied by the template: `Power Calculator & Product Finder | SuntNeew`

## Publish after merge

The JSON template does not create a Shopify Page resource. After this branch is merged and the theme is deployed:

1. In Shopify Admin, create a page named `SuntNeew Power Planner`.
2. Set its URL handle to `power-calculator`.
3. Assign the `power-calculator` theme template.
4. Publish the page and verify `/pages/power-calculator` on the deployed theme.
5. Add `Help Me Choose` to the top-level main menu, linking to that page.

The theme already supplies a homepage entry, a Support mega-menu link, a mobile Support link and a Footer fallback link. Do not add a duplicate Footer or Support link if the saved Shopify menus are updated later.

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
