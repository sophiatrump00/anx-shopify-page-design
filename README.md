# SuntNeew Impact homepage history

This repository is the source of truth for SuntNeew Shopify homepage work. Shopify-connected branches must keep a valid Shopify theme structure at the repository root.

## Deployment rule

- `main` = current Shopify-sync candidate (currently `impact-0811-004`).
- Each historical version lives on an `archive/*` branch with its theme files at the branch root.
- Do not push homepage files directly to Shopify with the CLI after the GitHub connection is created. Commit and push to the appropriate branch instead.
- Shopify Theme Editor changes are automatically committed back to the connected branch; avoid editing the same file simultaneously in Shopify and GitHub.
- Only connect a branch after it has been checked locally with `shopify theme check`.

## Version map

### impact-0810 — Archived concept

- Date: 2026-08-10
- Branch: `archive/impact-0810`
- Summary: First custom dark homepage exploration. Includes a dual-path hero, four use paths, RV and jump-starter proof panels, a home-energy clearance concept, FAQ, and POWER ON closing.
- Decision note: Superseded: four-path structure duplicated RV entry points and home energy positioning was too B2B/clearance-led.

### impact-0811-001 — Archived concept

- Date: 2026-08-11
- Branch: `archive/impact-0811-001`
- Summary: Moved to a light system with native Impact three-slide hero and added home energy as a third product line.
- Decision note: Superseded by later refinement; preserves the initial light-system direction.

### impact-0811-002 — Archived concept

- Date: 2026-08-11
- Branch: `archive/impact-0811-002`
- Summary: Refined light visual direction, home-energy presentation, and native Impact slideshow structure.
- Decision note: Superseded by 0811-003 and 0811-004 content revisions.

### impact-0811-003 — Archived concept

- Date: 2026-08-11
- Branch: `archive/impact-0811-003`
- Summary: Light visual system with selection and evidence modules added for decision support.
- Decision note: Superseded: the chooser and generic evidence modules did not communicate products or real customer scenarios clearly.

### impact-0811-004 — Current working candidate

- Date: 2026-08-12
- Branch: `main`
- Summary: Three real power scenarios: RV Batteries, Jump Starters, and Home Energy Storage. Uses native Impact hero slides, scene-to-product paths, product/fit proof, FAQ, and a light system with dark scenario cards.
- Decision note: Current candidate. Keep as GitHub-connected Shopify theme branch after initial connection.

## Current page structure (`impact-0811-004`)

1. Native Impact slideshow: RV Batteries → Jump Starters → Home Energy Storage
2. Compact support strip
3. Three scenario cards: RV / vehicle emergency / home energy
4. RV fit and power proof
5. Jump starter vehicle-readiness proof
6. Home energy capacity and configuration panel
7. FAQ and support

## Guardrails

- Never publish a theme only because it is in `main`; preview and approve it in Shopify first.
- Home-energy products are configured for direct online purchase. Keep the quantity/Buy it now path enabled, while separately verifying delivery, VAT, support, packaging and product-publication gates before Germany launch.
- Historical branches are snapshots, not deployment candidates.
