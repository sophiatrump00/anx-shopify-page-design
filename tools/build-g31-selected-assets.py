#!/usr/bin/env python3
"""Prepare only the merchant-selected G31 PDP assets; never touch shared product media."""
import argparse
import hashlib
import json
from pathlib import Path
from shutil import copyfile
from PIL import Image, ImageOps

repo = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True, help='Preserved G31 image chooser folder')
args = parser.parse_args()
content = json.loads((repo / 'tools/fixtures/g31-selected-content-20261110.json').read_text())
catalog = json.loads((args.source / 'assets.json').read_text())
by_id = {row['id']: row for row in catalog['assets']}
gallery = [row['id'] for row in content['gallery']]
features = [row['id'] for group in content['features'] for row in group['images']]
assert gallery == ['G01','G02','G03','G04','G05','G06','G08','G07']
assert features == ['A02','A03','A04','A05','A08','A06','A09','A10','A11','A12','A15']
records = []
for asset_id in gallery + features:
    source = by_id[asset_id]
    original = args.source / source['original']
    digest = hashlib.sha256(original.read_bytes()).hexdigest()
    assert digest == source['sha256'], f'Source changed: {asset_id}'
    prefix = f'sn-g31-selected-{asset_id.lower()}'
    full = prefix + '-full.jpg'
    copyfile(original, repo / 'assets' / full)
    with Image.open(original) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        width, height = image.size
        display = image.copy()
        display.thumbnail((1100, 1100) if asset_id in gallery else (1464, 1464), Image.Resampling.LANCZOS)
        display.save(repo / 'assets' / (prefix + '.webp'), quality=90, method=6)
        if asset_id in gallery:
            thumb = image.copy()
            thumb.thumbnail((176,176), Image.Resampling.LANCZOS)
            thumb.save(repo / 'assets' / (prefix + '-thumb.webp'), quality=83, method=6)
    records.append({**source, 'display_asset': prefix + '.webp', 'full_asset': full,
                    'thumb_asset': prefix + '-thumb.webp' if asset_id in gallery else None,
                    'display_width': display.width, 'display_height': display.height,
                    'original_width': width, 'original_height': height,
                    'original_sha256': digest})
manifest = {'product':'G31', 'asin':'B0FVSQJ38Z', 'galleryOrder':gallery,
            'featuresOrder':features, 'sharedProductMediaChanged':False, 'assets':records}
(repo / 'tools/fixtures/g31-selected-assets-20261110.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {len(gallery)} Gallery + {len(features)} Features originals and display assets.')
