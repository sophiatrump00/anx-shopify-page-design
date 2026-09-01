# SuntNeew legacy home-storage media retention

Effective date: 2026-09-01

The 18 legacy home-storage images that were removed from the three product galleries were restored from the existing Shopify Files records. They are retained as additional product media; the seven-image SuntNeew gallery for each product remains in place and is the primary sequence.

| Product | Product ID | New gallery | Retained legacy media | Restored media IDs |
| --- | --- | ---: | ---: | --- |
| WL5A | `gid://shopify/Product/10337173209383` | 7 | 6 | `45404328427815`, `45404328460583`, `45404328493351`, `45404328526119`, `45404328558887`, `45404328591655` |
| WL10B | `gid://shopify/Product/10337173405991` | 7 | 6 | `45404332622119`, `45404332654887`, `45404332687655`, `45404332720423`, `45404332753191`, `45404332785959` |
| VH10A / VH15A | `gid://shopify/Product/10337173569831` | 7 | 6 | `45404333015335`, `45404333048103`, `45404333080871`, `45404333113639`, `45404333146407`, `45404333179175` |

Policy: keep these legacy media attached. Future closeout scripts may add or update the SuntNeew primary gallery, but must not generate or execute `productDeleteMedia` operations for these retained images.
