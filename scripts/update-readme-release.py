"""Prepare localized README release notes without replacing existing translations.

Only public editorial copy is sent to the translation service. Technical names,
versions, model IDs, links and Markdown are assembled locally. Regional/shared
written drafts are disclosed; native review is not certified.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import importlib.util
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = json.loads((ROOT / 'scripts/readme-release-1.0.1.json').read_text(encoding='utf8'))
REGIONAL = json.loads((ROOT / 'scripts/readme-release-regional.json').read_text(encoding='utf8'))
DIGEST = hashlib.sha256(json.dumps(SOURCE, sort_keys=True).encode()).hexdigest()[:12]
WORK = ROOT / '.build/readme-release-1.0.1' / DIGEST
spec = importlib.util.spec_from_file_location('readme_translator', ROOT / 'scripts/components/localize.py')
translator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(translator)
INVENTORY = json.loads((ROOT / 'docs/language-support.json').read_text(encoding='utf8'))
ALIASES = {'pbt': 'ps', 'fuv': 'ff'}
SHARED = {
    'aec': 'ar', 'arz': 'ar', 'apc': 'ar', 'apd': 'ar', 'arq': 'ar', 'ary': 'ar',
    'ars': 'ar', 'acm': 'ar', 'wuu': 'zh-CN', 'cjy': 'zh-CN', 'hsn': 'zh-CN',
    'hak': 'zh-TW', 'nan': 'zh-TW', 'gan': 'zh-TW', 'bar': 'de', 'mag': 'hi',
    'hne': 'hi', 'tts': 'th', 'ctg': 'bn',
}


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


def placeholders(text):
    return Counter(re.findall(r'\{\{\w+\}\}', text))


def validate_draft(draft):
    assert draft.keys() == SOURCE['en'].keys(), 'Incomplete release-note draft'
    for key, original in SOURCE['en'].items():
        value = draft[key]
        assert isinstance(value, str) and value.strip(), key
        assert placeholders(value) == placeholders(original), key
        assert not re.search(r'\uFFFD|NOVERA_\d+|SECTION\d+', value), key


def translate_target(code):
    path = WORK / 'translations' / (code + '.json')
    if code in REGIONAL:
        validate_draft(REGIONAL[code])
        save(path, REGIONAL[code])
        return REGIONAL[code]
    if path.exists():
        draft = json.loads(path.read_text(encoding='utf8'))
        validate_draft(draft)
        return draft
    if code in REGIONAL:
        draft = REGIONAL[code]
    elif code in SOURCE:
        draft = SOURCE[code]
    else:
        draft = {}
        batches = []
        batch = []
        for key, value in SOURCE['en'].items():
            if batch and sum(len(v) + 25 for _, v in batch) + len(value) > 1600:
                batches.append(batch)
                batch = []
            batch.append((key, value))
        if batch:
            batches.append(batch)
        for batch in batches:
            joined = '\n\n'.join('{{SECTION' + str(i) + '}} ' + value for i, (_, value) in enumerate(batch))
            try:
                translated = translator.translate([joined], code)[joined]
                pattern = r'\{\{SECTION(\d+)\}\}'
                matches = list(re.finditer(pattern, translated))
                assert [int(m[1]) for m in matches] == list(range(len(batch)))
                for i, match in enumerate(matches):
                    end = matches[i + 1].start() if i + 1 < len(matches) else len(translated)
                    draft[batch[i][0]] = translated[match.end():end].strip()
            except Exception:
                for key, value in batch:
                    try:
                        draft[key] = translator.translate([value], code)[value]
                    except Exception:
                        parts = re.split(r'(\{\{\w+\}\})', value)
                        output = []
                        for part in parts:
                            if not part or part.startswith('{{') or not part.strip():
                                output.append(part)
                            else:
                                prose = part.strip()
                                translated = translator.translate([prose], code)[prose]
                                output.append((' ' if part.startswith(' ') else '') + translated + (' ' if part.endswith(' ') else ''))
                        draft[key] = ''.join(output)
    validate_draft(draft)
    save(path, draft)
    print('Draft ready:', code, flush=True)
    return draft


def catalog():
    cloud_source = (ROOT / 'web-app/src/constants/cloudModels.ts').read_text(encoding='utf8')
    cloud = {key: re.findall(r"id: '([^']+)'", body) for key, body in
             re.findall(r'^  ([a-z0-9]+): \[(.*?)^  \]', cloud_source, re.M | re.S)}
    media_source = (ROOT / 'web-app/src/constants/mediaProviders.ts').read_text(encoding='utf8')
    media = {}
    counts = Counter()
    for task, provider, _, name in re.findall(r"\b(image|video)\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'", media_source):
        media.setdefault(provider, []).append(name)
        counts[task] += 1
    for provider, _, name in re.findall(r"provider: '([^']+)',\s*id: '([^']+)',\s*name: '([^']+)'", media_source):
        media.setdefault(provider, []).append(name)
        counts['music'] += 1
    assert len(media) == 20 and sum(counts.values()) == 58, counts
    return cloud, media, counts


def render(text, values):
    return re.sub(r'\{\{(\w+)\}\}', lambda m: values[m[1]], text)


def prepare(code, draft, cloud, media, counts, row_providers):
    filename = 'README.md' if code == 'en' else f"README.{'de' if code == 'de-DE' else code}.md"
    source = (ROOT / filename).read_text(encoding='utf8')
    values = {
        'release': '1.0.1', 'stable': '1.0.0', 'languages': '104', 'addedLanguages': '24',
        'keys': '2 435' if code == 'fr' else '2,435', 'providers': '43', 'cloud': '42',
        'media': str(sum(counts.values())), 'mediaProviders': str(len(media)),
        'images': str(counts['image']), 'videos': str(counts['video']), 'music': str(counts['music']),
        'license': 'Apache 2.0', 'localProvider': 'TabbyAPI', 'voicePlatform': 'Windows',
        'engine': '`llama.cpp v0.9.0` (`b12110`, `cd959bae99ff4bed22bef2604f45241c09bbb8c8`)',
        'setting': '`kv_unified`', 'omni': 'LFM3-Omni', 'defaultModel': 'LFM3-Omni-2B Q4_K_M',
        'alternativeModel': 'NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M',
        'projector': '`mmproj-LFM3-Omni-2B-Q4_K_M.gguf`',
        'desktopContext': '32 768' if code == 'fr' else '32,768',
        'mobileContext': '2 048' if code == 'fr' else '2,048',
        'platforms': 'Windows / macOS / Linux / Android / iOS',
        'newChat': 'GPT-6.1 Terra, Kimi K3.1 Pro, MiniMax M3.1 Flash, GLM 5.3 Flash, Hy4',
        'newMedia': 'GPT Image 2.6, Gemini Omni 1.2, FLUX 3',
    }
    facts = json.loads((ROOT / 'docs/release-preparation.json').read_text(encoding='utf8'))
    assert all(str(values[key]).replace(' ', '').replace(',', '') == str(facts[key]).replace(' ', '').replace(',', '') for key in values), 'README facts differ from the release summary'
    t = {key: render(value, values) for key, value in draft.items()}
    lines = source.splitlines()
    changed = Counter()
    # The current tables retain their translated labels, URLs and logos.
    category = {}
    for line in lines:
        if line.startswith('|') and '<img ' in line and 'width="24"' in line:
            for provider in ['luma', 'fal']:
                if f'alt="{provider}"' in line.lower():
                    category[provider] = line.split('|')[2].strip()
    for i, line in enumerate(lines):
        if '<p><strong>' in line and '42' in line and '49' in line and 'Apache 2.0' in line:
            lines[i] = line.split('</strong>')[0] + '</strong> · ' + t['metrics'] + '</p>'
            changed['metrics'] += 1
        elif 'LFM3-1.7B Q4' in line and 'LFM3-Omni-2B Q4' in line and not line.startswith('|'):
            lines[i] = t['recommendation']
            changed['recommendation'] += 1
        elif 'docs/MAINTENANCE.md' in line and not line.startswith('-'):
            link = re.search(r'\[[^\]]+\]\(docs/MAINTENANCE.md\)', line)
            lines[i] = t['diagnostics'] + (' ' + link[0] if link else '')
            changed['diagnostics'] += 1
        elif '42' in line and 'ElevenLabs' in line and not line.startswith('|'):
            lines[i] = t['providers']
            changed['providers'] += 1
        elif '49' in line and '25' in line and 'ElevenMusic v2.5' in line:
            lines[i] = t['media']
            changed['media'] += 1
        elif line.startswith('|') and 'Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf' in line:
            label = line.split('|')[1]
            lines[i] = f'|{label}| **LFM3-Omni-2B Q4_K_M** · `LFM3-Omni-2B-Q4_K_M.gguf` + `mmproj-LFM3-Omni-2B-Q4_K_M.gguf` |'
            lines[i] += f"\n| **{t['alternative']}** | **NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M** · `Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf` |"
            changed['default'] += 1
        elif line.startswith('|') and '<img ' in line and 'width="24"' in line:
            match = re.search(r'alt="([^"]+)"', line)
            labels = {'OpenAI': 'openai', 'Google Gemini': 'gemini', 'Gemini': 'gemini',
                      'Black Forest Labs': 'bfl', 'Stability AI': 'stability', 'LTX (Lightricks)': 'ltx',
                      'Adobe Firefly': 'adobe-firefly', 'ElevenLabs': 'elevenlabs', 'Hugging Face': 'huggingface',
                      'MiniMax': 'minimax', 'xAI': 'xai', 'BytePlus': 'byteplus', 'BytePlus · ByteDance': 'byteplus', 'Luma': 'luma',
                      'Recraft': 'recraft', 'Ideogram': 'ideogram', 'Runway': 'runway', 'Replicate': 'replicate',
                      'Leonardo.Ai': 'leonardo', 'Leonardo': 'leonardo', 'Krea': 'krea', 'Vidu': 'vidu',
                      'PixVerse': 'pixverse', 'fal': 'fal'}
            provider = labels.get(match[1]) if match else None
            if provider in media:
                columns = line.split('|')
                columns[3] = ' ' + ' · '.join('`' + name + '`' for name in media[provider]) + ' '
                if provider == 'bfl':
                    columns[2] = ' ' + category['luma'] + ' '
                if provider == 'replicate':
                    columns[2] = ' ' + category['fal'] + ' '
                lines[i] = '|'.join(columns)
                changed['mediaRows'] += 1
        elif line.startswith('| ['):
            match = re.search(r'\]\((https://[^)]+)\)', line)
            provider = row_providers.get(match[1]) if match else None
            if provider and cloud.get(provider):
                columns = line.split('|')
                columns[2] = ' ' + ' · '.join('`' + ident + '`' for ident in cloud[provider]) + ' '
                lines[i] = '|'.join(columns)
                changed['cloudRows'] += 1
        # Only the current catalog-coverage statement contains this key count.
        if '2,429' in lines[i] or '2 429' in lines[i]:
            lines[i] = lines[i].replace('2,429', values['keys']).replace('2 429', values['keys'])
            changed['keys'] += 1
        lines[i] = lines[i].replace('https://platform.vidu.com/docs/model-map', 'https://platform.vidu.com/models')
    for key in ['metrics', 'recommendation', 'diagnostics', 'providers', 'media', 'default', 'keys']:
        assert changed[key] == 1, (code, key, changed)
    assert changed['mediaRows'] == len(media), (code, changed)
    assert changed['cloudRows'] == sum(bool(ids) for ids in cloud.values()), (code, changed)
    text = '\n'.join(lines) + '\n'
    assert '<!-- novera-release-1.0.1:start -->' not in text, 'Already applied; restore reviewed staging before rerunning'
    notes = ['<!-- novera-release-1.0.1:start -->', '<a id="preparing-1-0-1"></a>', '## ' + t['title'], '', t['status'], '']
    for key in ['security', 'privacy', 'engine', 'languages']:
        notes.append('- ' + t[key])
    ui = json.loads((ROOT / f'web-app/src/locales/{code}/chat.json').read_text(encoding='utf8'))['creation']
    for key in ['setupOmniNote', 'setupTextNote']:
        description = ui[key].replace('{{projector}}', '`mmproj`').replace('{{size}}', '1.39 GB' if key == 'setupOmniNote' else '6.18 GB').replace('{{defaultModel}}', 'LFM3-Omni')
        notes.append('- **' + ('LFM3-Omni-2B Q4_K_M' if key == 'setupOmniNote' else 'NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M') + '** — ' + description)
    notes.append('- ' + t['recommendation'])
    for key in ['voice', 'microphone', 'web', 'optimization', 'interface', 'api', 'checks', 'limits']:
        notes.append('- ' + t[key])
    notes += ['', '[' + t['details'] + '](docs/CHANGELOG.md) · [1.0.1](docs/FUTURES_VERSIONS.md) · [SECURITY.md](SECURITY.md)', '']
    if code not in ['en', 'fr']:
        notes += ['> ' + t['review'], '']
    notes += ['<!-- novera-release-1.0.1:end -->', '']
    # Keep the language selector, banner, contact, license and public links first.
    position = text.index('\n---\n') + len('\n---\n')
    text = text[:position] + '\n' + '\n'.join(notes) + text[position:]
    assert not re.search(r'\{\{\w+\}\}', text), code
    assert text.count('<!-- novera-release-1.0.1:start -->') == 1
    return filename, text, dict(changed)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--drafts-only', action='store_true')
    args = parser.parse_args()
    WORK.mkdir(parents=True, exist_ok=True)
    targets = {entry['locale']: SHARED.get(entry['locale'], ALIASES.get(entry['locale'], entry['locale'])) for entry in INVENTORY}
    drafts = {}
    failures = []
    with ThreadPoolExecutor(max_workers=5) as pool:
        jobs = {pool.submit(translate_target, code): code for code in sorted(set(targets.values()))}
        for future in as_completed(jobs):
            code = jobs[future]
            try:
                drafts[code] = future.result()
            except Exception as error:
                failures.append({'target': code, 'error': str(error)})
                print('Draft failed:', code, str(error), flush=True)
    save(WORK / 'draft-errors.json', failures)
    if failures:
        raise SystemExit('No README changed: incomplete translations')
    if args.drafts_only:
        return
    cloud, media, counts = catalog()
    labels = ['OpenAI', 'Microsoft Azure', 'Anthropic', 'OpenRouter', 'Mistral', 'Groq', 'xAI', 'Google Gemini', 'MiniMax', 'Hugging Face', 'NVIDIA NIM', 'DeepSeek', 'Kimi · Moonshot AI', 'Alibaba Cloud · Qwen', 'Cerebras', 'Together AI', 'Fireworks AI', 'Perplexity', 'Meta AI', 'Cohere', 'Z.ai', 'AI21 Labs', 'BytePlus (ByteDance)', 'Baidu Qianfan', 'Tencent TokenHub', 'Amazon Bedrock', 'IBM watsonx']
    providers = ['openai', 'azure', 'anthropic', 'openrouter', 'mistral', 'groq', 'xai', 'gemini', 'minimax', 'huggingface', 'nvidia', 'deepseek', 'moonshot', 'alibaba', 'cerebras', 'together', 'fireworks', 'perplexity', 'meta', 'cohere', 'zai', 'ai21', 'byteplus', 'baidu', 'tencent', 'bedrock', 'watsonx']
    english = (ROOT / 'README.md').read_text(encoding='utf8')
    row_providers = {}
    for label, provider in zip(labels, providers):
        match = re.search(r'^\| \[' + re.escape(label) + r'\]\(([^)]+)\)', english, re.M)
        if not match and label == 'BytePlus (ByteDance)':
            match = re.search(r'^\| \[BytePlus · ByteDance\]\(([^)]+)\)', english, re.M)
        assert match, label
        row_providers[match[1]] = provider
    staged = []
    for entry in INVENTORY:
        code = entry['locale']
        filename, text, changes = prepare(code, drafts[targets[code]], cloud, media, counts, row_providers)
        (WORK / 'staging').mkdir(exist_ok=True)
        (WORK / 'staging' / filename).write_text(text, encoding='utf8')
        staged.append({'locale': code, 'file': filename, 'translationTarget': targets[code], 'sharedWrittenDraft': code in SHARED, 'changes': changes, 'sha256': hashlib.sha256(text.encode()).hexdigest()})
    assert len(staged) == 104
    save(WORK / 'validation.json', {'readmes': staged, 'applied': args.apply, 'sourceDigest': DIGEST, 'regionalDraftDigest': hashlib.sha256(json.dumps(REGIONAL, sort_keys=True).encode()).hexdigest(), 'nativeReview': 'pending'})
    if args.apply:
        (WORK / 'before').mkdir(exist_ok=True)
        for entry in staged:
            filename = entry['file']
            (WORK / 'before' / filename).write_bytes((ROOT / filename).read_bytes())
            (ROOT / filename).write_bytes((WORK / 'staging' / filename).read_bytes())
    print('Staged', len(staged), 'READMEs; applied:', args.apply, flush=True)


if __name__ == '__main__':
    main()
