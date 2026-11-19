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

An app can still edit layouts, templates or other theme files directly. The
theme-owned snippet only isolates replacement of the legacy snippet; it cannot
prevent Shogun from injecting that snippet back into layouts or regenerating its
landing layout and template. The November 19 Shopify bot commits `27ea3c9` and
`bba45e7` did exactly that and reintroduced three failing integration tests after
PR #20. The writes followed removal of two validation themes, but the event that
triggered Shogun has not been established.

Before releasing another restoration, stop the competing theme writer. Inspect
Shogun's settings for a supported opt-out. If none is accessible, first audit
template assignments, content bodies and Shogun metafields across pages,
products, collections, articles, and the homepage. Obtain the store owner's
approval before uninstalling Shogun; do not activate a trial or paid plan just
to access settings. A source-code restoration alone is not a persistent fix
while the app retains theme write access.

Keep the compatibility files when restoring the reviewed source through a
focused PR. Validate on an unpublished theme, then back up and synchronize only
the approved files to MAIN using the ANX Store Automation
preview/fingerprint/apply channel. Compare the resulting live file hashes to
the merged commit and smoke test the public pages, including the G31 pack
selector. Inspect subsequent Shopify bot commits for another injection. Do not
treat a Git push or passing CI as proof that the live write conflict is resolved.
