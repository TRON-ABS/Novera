"""Verify the interface locale inventory of an unpacked release or signed APK."""
import argparse
import collections
import json
import mmap
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[2]
LOCALE_PATH = re.compile(rb'\.\./locales/([a-zA-Z0-9_-]+)/([\w-]+)\.json')
APK_LIBRARY = 'lib/arm64-v8a/libapp_lib.so'


def inventory(path):
    if path.suffix == '.apk':
        with zipfile.ZipFile(path) as apk:
            matches = LOCALE_PATH.findall(apk.read(APK_LIBRARY))
    else:
        with path.open('rb') as payload, mmap.mmap(payload.fileno(), 0, access=mmap.ACCESS_READ) as data:
            matches = LOCALE_PATH.findall(data)
    return {(locale.decode(), namespace.decode()) for locale, namespace in matches}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('payload', type=Path, help='Tauri executable, signed APK, or the compiled Web i18n chunk')
    parser.add_argument('--expected-count', type=int, required=True)
    args = parser.parse_args()
    expected = {
        (path.parent.name, path.stem)
        for path in (ROOT / 'web-app/src/locales').glob('*/*.json')
    }
    actual = inventory(args.payload)
    counts = collections.Counter(locale for locale, _ in actual)
    if len(counts) != args.expected_count or actual != expected:
        raise SystemExit(
            f'Incorrect locale inventory: found {len(counts)} locales, expected {args.expected_count}; '
            f'missing {sorted(expected - actual)[:12]}; unexpected {sorted(actual - expected)[:12]}'
        )
    print(json.dumps({'payload': args.payload.name, 'locales': len(counts), 'namespaceFiles': len(actual)}))


if __name__ == '__main__':
    main()
