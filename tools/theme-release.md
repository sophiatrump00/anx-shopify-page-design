# Theme checks and Shogun ownership

Run `npm ci --ignore-scripts --no-audit --no-fund`, `npm test`,
`npm run check:structure` and `npm run check:theme` before release.
The Theme quality GitHub workflow runs these checks on every push and pull
request. It can also run manually. It has read-only repository access and no
Shopify credentials; a successful workflow checks source, not the live store.

The storefront layouts include `snippets/suntneew-shogun-content-handler.liquid`
directly. `snippets/shogun-content-handler.liquid` is a compatibility bridge for
older callers. Regenerating that legacy app file does not replace the active
integration. The landing page template uses
`layout/theme.suntneew-shogun.landing.liquid`; the legacy landing layout remains
available for existing references.

Keep native `content_for_header` and `content_for_layout` untouched. Shogun uses
separate output variables. The regression tests exercise native headers,
wrappers, optimizer output, single initialization and a simulated overwrite of
the legacy handler. They also check the active layout/template references.

An app can still edit layouts, templates or other theme files directly. Inspect
the Git diff and workflow after app-driven theme changes. If a protected entry
or the native output regresses, restore the reviewed source through a focused
PR, validate on an unpublished theme, then back up and synchronize only the
approved files to MAIN using the ANX Store Automation preview/fingerprint/apply
channel. Compare the resulting live file hashes to the merged commit and smoke
test the public pages. Do not treat a Git push as proof of a live deployment.
