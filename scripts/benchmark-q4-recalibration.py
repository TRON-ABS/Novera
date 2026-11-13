"""Compare successive Q4 builds against a single Q8 logit cache."""
import argparse
import json
from pathlib import Path
import re
from shutil import copyfile
import sys

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
    first = base / 'q4-first/LFM3-Q4_K_M-calibrated.gguf'
    varied = output / 'LFM3-Q4_K_M-varied.gguf'
    mixed = output / 'LFM3-Q4_K_M-mixed.gguf'
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

    def evaluate(label, model, index):
        result = run('Mesure · ' + label, 'perplexity', [
            '-m', model, *evaluation, '--kl-divergence', '--kl-divergence-base', cache,
        ], f'{index}.log')
        metrics = {}
        for key, pattern in (('mean_kl', 'Mean'), ('max_kl', 'Max(?:imum)?')):
            match = re.search(pattern + r'\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.IGNORECASE)
            if not match:
                raise ValueError(f'Missing {key} for {label}')
            metrics[key] = float(match[1])
        report['runs'].append(dict(label=label, file=model.name, bytes=model.stat().st_size, **metrics))
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
        run('Calcul de la référence Q8', 'perplexity', ['-m', reference, *evaluation, '--save-all-logits', cache], '01-reference.log')
        evaluate('Q4 actuel', baseline, '02-baseline')
        evaluate('Q4 recalibré v1', first, '03-v1')
        run('Matrice d’importance sur corpus varié', 'imatrix',
            ['-m', reference, '-f', corpora / 'calibration.txt', '-o', matrix, *common], '04-importance.log')
        quantize = ['--allow-requantize', '--imatrix', matrix]
        run('Quantification Q4 recalibré v2', 'quantize', [*quantize, reference, varied, 'Q4_K_M'], '05-v2-build.log')
        evaluate('Q4 recalibré v2', varied, '06-v2')
        run('Quantification Q4 mixte', 'quantize', [
            *quantize, '--tensor-type', 'attn_q=q6_K', '--tensor-type', 'attn_k=q6_K',
            '--tensor-type', 'attn_output=q6_K', '--token-embedding-type', 'q6_K',
            reference, mixed, 'Q4_K_M',
        ], '07-mixed-build.log')
        evaluate('Q4 mixte', mixed, '08-mixed')
        report['stage'] = 'Comparaison terminée'
    except Exception:
        report['stage'] = 'Comparaison interrompue'
        raise
    finally:
        engine.publish(output, report)


if __name__ == '__main__':
    sys.exit(main())
