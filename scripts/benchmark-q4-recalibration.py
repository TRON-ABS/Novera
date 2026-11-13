"""Compare successive Q4 builds against a single Q8 logit cache."""
import argparse
import json
from pathlib import Path
import re
from shutil import copyfile
import sys
from statistics import fmean

from importlib import import_module

engine = import_module('recalibrate-quantization')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chunks', type=int, default=6)
    parser.add_argument('--output', type=Path, help='New directory for this benchmark run')
    parser.add_argument('--extend', type=Path, help='Continue a completed comparison with its reference cache')
    parser.add_argument('--near-q8', action='store_true', help='Test selective compression starting from Q8')
    parser.add_argument('--layer-sweep', action='store_true', help='Compare two late FFN layers at Q6')
    parser.add_argument('--validation', type=Path, help='Run a fresh comparison on a separate corpus with --extend')
    args = parser.parse_args()
    if args.chunks < 1:
        parser.error('--chunks must be positive')
    if args.validation and not args.extend:
        parser.error('--validation requires --extend to locate the candidate and importance matrix')
    root = Path(__file__).resolve().parents[1]
    base = root / '.build/weight-recalibration'
    output = args.output or base / 'q4-varied'
    models = root / '.build/web-runtime-real/models'
    corpora = root / 'scripts/validation/q4-quantization'
    reference = models / 'LFM3-Omni-2B-Q8_0.gguf'
    baseline = models / 'LFM3-Omni-2B-Q4_K_M.gguf'
    tools = base / 'tools'
    matrix = output / 'importance.gguf'
    cache = output / 'reference.logits'
    common = ['-c', 512, '-ngl', 99, '--chunks', args.chunks]
    output.mkdir(exist_ok=False)
    report = {'stage': '', 'chunks': args.chunks, 'runs': []}

    def run(stage, tool, options, log):
        report['stage'] = stage
        engine.publish(output, report)
        return engine.run(tools, tool, options, output / log)

    def measure(label, model, index, *, options=None, reference_cache=None):
        result = run('Mesure · ' + label, 'perplexity', [
            '-m', model, *(evaluation if options is None else options),
            '--kl-divergence', '--kl-divergence-base', reference_cache or cache,
        ], f'{index}.log')
        metrics = {}
        for key, pattern in (('mean_kl', 'Mean'), ('max_kl', 'Max(?:imum)?')):
            match = re.search(pattern + r'\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.IGNORECASE)
            if not match:
                raise ValueError(f'Missing {key} for {label}')
            metrics[key] = float(match[1])
        return metrics

    def evaluate(label, model, index):
        report['runs'].append(dict(label=label, file=model.name, bytes=model.stat().st_size,
                                   **measure(label, model, index)))
        engine.publish(output, report)

    evaluation = ['-f', args.validation or corpora / 'validation.txt', *common]
    try:
        if args.validation:
            report['corpus'] = 'Nouveau corpus · documentation, exemples de code et exercices'
            copyfile(args.extend / 'importance.gguf', matrix)
            run('Calcul de la référence Q8 sur le nouveau corpus', 'perplexity',
                ['-m', reference, *evaluation, '--save-all-logits', cache], 'new-reference.log')
            evaluate('Q4 actuel', baseline, 'new-baseline')
            evaluate('Q8 · contrôle de mesure', reference, 'new-control')
            for suffix, label in [
                ('mixed', 'Q4 mixte'),
                ('q8-layer-22-q6', 'Q8 · porte FFN 22 en Q6'),
                ('q8-gate-q6', 'Q8 · portes FFN en Q6'),
            ]:
                model = output / f'LFM3-Q4_K_M-{suffix}.gguf'
                model.hardlink_to(args.extend / model.name)
                evaluate(label, model, suffix)
            for suffix, label, overrides in [
                ('q8-k22-q6', 'Q8 · attention K22 en Q6', [r'blk\.22\.attn_k\.weight=q6_K']),
                ('q8-k22-q4', 'Q8 · attention K22 en Q4', [r'blk\.22\.attn_k\.weight=q4_K']),
                ('q8-k20-22-q6', 'Q8 · attention K20 et K22 en Q6', [r'blk\.(20|22)\.attn_k\.weight=q6_K']),
                ('q8-v22-q6', 'Q8 · attention V22 en Q6', [r'blk\.22\.attn_v\.weight=q6_K']),
                ('q8-k-all-q6', 'Q8 · toutes les clés d’attention en Q6', [r'attn_k\.weight=q6_K']),
                ('q8-k22-ffn22-q6', 'Q8 · attention K22 et porte FFN 22 en Q6',
                 [r'blk\.22\.(attn_k|ffn_gate)\.weight=q6_K']),
            ]:
                model = output / f'LFM3-Q4_K_M-{suffix}.gguf'
                options = [part for override in overrides for part in ('--tensor-type', override)]
                run('Quantification · ' + label, 'quantize', [
                    '--allow-requantize', '--imatrix', matrix, *options, reference, model, 'Q8_0',
                ], f'{suffix}-build.log')
                evaluate(label, model, suffix)
            report['stage'] = 'Comparaison terminée'
            return
        if args.extend:
            previous = json.loads((args.extend / 'report.json').read_text(encoding='utf-8'))
            if previous['stage'] != 'Comparaison terminée' or previous['chunks'] != args.chunks:
                raise ValueError('A completed comparison with the same chunk count is required')
            for name in ('importance.gguf', 'reference.logits'):
                copyfile(args.extend / name, output / name)
            report['runs'] = previous['runs']
            for entry in previous['runs']:
                source = args.extend / entry['file']
                if source.is_file():
                    (output / source.name).hardlink_to(source)
            candidates = [
                ('attention-q8', 'Q4 · attention Q8', ['attn_=q8_0', 'token_embd=q8_0']),
                ('ffn-q6', 'Mixte · FFN Q6, attention Q8', ['attn_=q8_0', 'token_embd=q8_0', 'ffn_=q6_K']),
                ('ffn-q8', 'Mixte · descente FFN Q8', ['attn_=q8_0', 'token_embd=q8_0', 'ffn_gate=q6_K', 'ffn_up=q6_K', 'ffn_down=q8_0']),
            ]
            if args.layer_sweep:
                candidates = [
                    (f'q8-layer-{layer}-q6', f'Q8 · porte FFN {layer} en Q6',
                     [rf'blk\.{layer}\.ffn_gate\.weight=q6_K'])
                    for layer in (21, 22)
                ]
            elif args.near_q8:
                evaluate('Q8 · contrôle de mesure', reference, 'q8-control')
                candidates = [
                    ('q8-gate-q6', 'Q8 · portes FFN en Q6', ['ffn_gate=q6_K']),
                    ('q8-last-q6', 'Q8 · dernière porte FFN en Q6', [r'blk\.23\.ffn_gate\.weight=q6_K']),
                    ('q8-last-q4', 'Q8 · dernière porte FFN en Q4', [r'blk\.23\.ffn_gate\.weight=q4_K']),
                ]
            for name, label, overrides in candidates:
                model = output / f'LFM3-Q4_K_M-{name}.gguf'
                options = [part for override in overrides for part in ('--tensor-type', override)]
                run('Quantification · ' + label, 'quantize', [
                    '--allow-requantize', '--imatrix', matrix, *options, reference, model,
                    'Q8_0' if args.near_q8 or args.layer_sweep else 'Q4_K_M',
                ], f'{name}-build.log')
                evaluate(label, model, name)
            report['stage'] = 'Comparaison terminée'
            return
        evaluations = []
        report.update(referenceBytes=reference.stat().st_size, referenceName='Q8')
        for number, (corpus, chunks) in enumerate([
            (corpora / 'validation.txt', args.chunks),
            (base / 'validation-independent.txt', args.chunks),
            (corpora / 'transfer.txt', 4),
            (corpora / 'holdout-4.txt', 4),
        ], start=1):
            evaluation = ['-f', corpus, '-c', 512, '-ngl', 99, '--chunks', chunks]
            cache = output / ('reference.logits' if number == 1 else f'reference-{number}.logits')
            run(f'Calcul de la référence Q8 · corpus {number}/4', 'perplexity',
                ['-m', reference, *evaluation, '--save-all-logits', cache], f'reference-{number}.log')
            evaluations.append((evaluation, cache))

        def evaluate_corpora(label, model, slug):
            entry = dict(label=label, file=model.name, bytes=model.stat().st_size,
                         mean_kl=None, max_kl=None, corpus_max_kl=[])
            report['runs'].append(entry)
            means = []
            for number, (options, reference_cache) in enumerate(evaluations, start=1):
                score = measure(f'{label} · corpus {number}/{len(evaluations)}', model, f'{slug}-{number}',
                                options=options, reference_cache=reference_cache)
                means.append(score['mean_kl'])
                entry['corpus_max_kl'].append(score['max_kl'])
                entry['max_kl'] = max(entry['corpus_max_kl'])
                entry['mean_kl'] = fmean(means)
                engine.publish(output, report)

        run('Matrice d’importance sur corpus varié', 'imatrix',
            ['-m', reference, '-f', corpora / 'calibration.txt', '-o', matrix, *common], 'importance.log')
        mixed_rules = ['attn_q=q6_K', 'attn_k=q6_K', 'attn_output=q6_K']
        base_rules = [*mixed_rules, r'blk\.[0-5]\.ffn_gate=q8_0', r'blk\.[0-5]\.ffn_up=q6_K']
        holdout = ['-f', corpora / 'holdout-5.txt', '-c', 512, '-ngl', 99, '--chunks', 4]
        holdout_cache = output / 'reference-5.logits'
        run('Calcul de la référence Q8 · corpus 5/5', 'perplexity',
            ['-m', reference, *holdout, '--save-all-logits', holdout_cache], 'reference-5.log')
        evaluations.append((holdout, holdout_cache))
        evaluate_corpora('Q4 original', baseline, 'stock')

        recalibrated = output / 'LFM3-Q4_K_M-recalibrated-v1.gguf'
        recalibrated_rules = [*base_rules, r'blk\.([0-9]|1[01])\.shortconv\.(in_proj|out_proj)=q6_K']
        options = [part for rule in recalibrated_rules for part in ('--tensor-type', rule)]
        run('Quantification Q4 recalibré v1', 'quantize', [
            '--allow-requantize', '--imatrix', matrix, '--token-embedding-type', 'q6_K',
            *options, reference, recalibrated, 'Q4_K_M',
        ], 'v1-build.log')
        evaluate_corpora('Q4 recalibré v1', recalibrated, 'v1')
        report['stage'] = 'Comparaison terminée'
    except Exception:
        report['stage'] = 'Comparaison interrompue'
        raise
    finally:
        engine.publish(output, report)


if __name__ == '__main__':
    sys.exit(main())
