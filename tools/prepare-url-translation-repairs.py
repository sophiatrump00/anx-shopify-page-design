#!/usr/bin/env python3
"""Prepare safe URL-setting repairs from a fresh Shopify translation snapshot.

Input: translatableResource {resourceId, translatableContent {key value digest},
  <locale>: translations(locale:...) {key value}}.
Output: resource ID -> TranslationInput[] for translationsRegister.
Only standalone URL values are considered; prose and translated page handles
are never changed. Shopify language prefixes are added by the theme at render
time, not by translating structural URL segments.
"""
import argparse
import json
from pathlib import Path


def prepare(snapshot):
    resource = snapshot.get('data', snapshot).get('translatableResource')
    if not resource:
        raise ValueError('Expected a fresh translatableResource snapshot')
    source = {entry['key']: entry for entry in resource['translatableContent']}
    corrections = []
    for locale, translations in resource.items():
        if locale in ('resourceId', 'translatableContent'):
            continue
        for entry in translations:
            original = source.get(entry['key'])
            if not original or not original['value'].startswith(('/', 'https://', 'http://', 'shopify://', 'mailto:', 'tel:')):
                continue
            if entry['value'] == original['value']:
                continue
            corrections.append({
                'locale': {'pt': 'pt-BR', 'pt_BR': 'pt-BR'}.get(locale, locale),
                'key': entry['key'], 'value': original['value'],
                'translatableContentDigest': original['digest'],
            })
    return {resource['resourceId']: corrections}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('snapshot', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    result = prepare(json.loads(args.snapshot.read_text()))
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Prepared {sum(map(len, result.values()))} URL repairs; review before registration.')
