#!/usr/bin/env python3
"""Recheck URLs from a Site Audit export without changing the store.

Uses curl for consistent proxy/TLS handling. Saves responses for reproducible
before/after checks. HTML links, canonical and hreflang are parsed, not regexed.
"""
import argparse
import concurrent.futures
import csv
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import time
from urllib.parse import urljoin


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.images, self.alternates, self.canonical = [], [], [], []
        self.descriptions, self.robots = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag == 'img':
            self.images.append(a)
        if tag == 'link':
            if a.get('hreflang'):
                self.alternates.append([a['hreflang'], a.get('href')])
            if a.get('rel') == 'canonical':
                self.canonical.append(a.get('href'))
        if tag == 'meta':
            if a.get('name') == 'description':
                self.descriptions.append(a.get('content', ''))
            if a.get('name') == 'robots':
                self.robots.append(a.get('content', ''))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--report', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--workers', type=int, default=1)
    ap.add_argument('--delay', type=float, default=2)
    args = ap.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    urls = {'https://www.suntneew.com/sitemap.xml', 'https://www.suntneew.com/robots.txt'}
    issues = {}
    for path in args.report.glob('*.csv'):
        rows = list(csv.DictReader(path.open(encoding='utf-8-sig')))
        issues[path.name] = len(rows)
        for row in rows:
            for key in ['URL', 'Source URL']:
                url = row.get(key, '')
                if url.startswith('https://www.suntneew.com/') and '/cdn/' not in url:
                    urls.add(url)

    def fetch(url):
        key = hashlib.sha256(url.encode()).hexdigest()[:24]
        body = args.output / (key + '.body')
        meta = args.output / (key + '.json')
        if meta.exists():
            cached = json.loads(meta.read_text())
            if cached.get('http_code') and cached['http_code'] != 429:
                return cached
        time.sleep(args.delay)
        r = subprocess.run(['curl', '-sS', '-L', '--compressed', '--connect-timeout', '10',
                            '--max-time', '45', '--retry', '1', '--retry-max-time', '50',
                            '-o', str(body), '-w', '%{json}', url], capture_output=True, text=True)
        try:
            info = json.loads(r.stdout)
        except ValueError:
            info = {}
        result = {k: info.get(k) for k in ['http_code', 'url_effective', 'content_type', 'time_starttransfer', 'time_total', 'size_download', 'num_redirects']}
        result['url'] = url
        result['error'] = r.stderr if r.returncode else None
        if result['http_code'] == 429:
            raise RuntimeError('Storefront rate limit reached. Stop and resume later; do not cache 429 as a page result.')
        if 'html' in (result['content_type'] or '') and body.exists():
            page = Page()
            text = body.read_text(errors='replace')
            page.feed(text)
            result.update(vars(page))
            for k in list(result):
                if k not in ['links', 'images', 'alternates', 'canonical', 'descriptions', 'robots', 'url', 'error', 'http_code', 'url_effective', 'content_type', 'time_starttransfer', 'time_total', 'size_download', 'num_redirects']:
                    del result[k]
            result['links'] = sorted(set(urljoin(result['url_effective'], x) for x in page.links))
            result['liquid_error'] = 'Liquid error' in text or 'translation missing:' in text
        meta.write_text(json.dumps(result, ensure_ascii=False, indent=2))
        return result

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for i, result in enumerate(pool.map(fetch, sorted(urls)), 1):
            results.append(result)
            if i % 25 == 0 or i == len(urls):
                print(f'{i}/{len(urls)} checked', flush=True)
    (args.output / 'summary.json').write_text(json.dumps({'report_rows': issues, 'pages': results}, ensure_ascii=False, indent=2))
    print(f"Complete: {len(results)} URLs, {sum(bool(r['error']) for r in results)} request failures")


if __name__ == '__main__':
    main()
