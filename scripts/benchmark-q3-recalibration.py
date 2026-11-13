"""Measure quantization candidates against a selected source on two corpora."""
from argparse import ArgumentParser
from importlib import import_module
import json
from pathlib import Path
import re
import time

engine = import_module('recalibrate-quantization')


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument('--level', choices=('2', '3', '4'), default='3')
    parser.add_argument('--output', type=Path)
    parser.add_argument('--reference', choices=('q8', 'q4'), default='q8')
    parser.add_argument('--continue-q4', type=Path, help='Continue the two-corpus Q4 comparison')
    parser.add_argument('--q4-precision-sweep', action='store_true', help='Try higher precision on selected FFN tensors')
    parser.add_argument('--q4-attention-sweep', action='store_true', help='Test attention precision and verify the winner on a third corpus')
    parser.add_argument('--q4-three-corpora', action='store_true', help='Compare targeted FFN recipes on three corpora')
    parser.add_argument('--q4-size-sweep', action='store_true', help='Test localized changes to the best compact Q4')
    parser.add_argument('--q4-holdout', type=Path, help='Add an independent fourth corpus to a completed three-corpus Q4 report')
    args = parser.parse_args()
    level = args.level
    if args.q4_holdout and (not args.continue_q4 or args.q4_three_corpora or args.q4_attention_sweep
                            or args.q4_precision_sweep or args.q4_size_sweep):
        parser.error('--q4-holdout requires --continue-q4 without a sweep')
    if args.q4_size_sweep and not args.q4_three_corpora:
        parser.error('--q4-size-sweep requires --q4-three-corpora')
    if (args.q4_precision_sweep or args.q4_attention_sweep or args.q4_three_corpora) and not args.continue_q4:
        parser.error('A Q4 sweep requires --continue-q4')
    if args.continue_q4 and level != '4':
        parser.error('--continue-q4 requires --level 4')
    if level == '4' and args.reference != 'q8':
        parser.error('Q4 candidates require a Q8 reference')
    root = Path(__file__).resolve().parents[1]
    base = root / '.build/weight-recalibration'
    tools = base / 'tools'
    reference_name = args.reference.upper()
    quantization = {'q8': 'Q8_0', 'q4': 'Q4_K_M'}[args.reference]
    reference = root / f'.build/web-runtime-real/models/LFM3-Omni-2B-{quantization}.gguf'
    output = args.output or base / f'q{level}-run-{time.time_ns() // 1_000_000}'
    if args.q4_holdout:
        append_q4_holdout(args.continue_q4, args.q4_holdout, output, reference, tools)
        return
    output.mkdir()
    matrix = base / 'q4-varied/importance.gguf' if args.reference == 'q8' else output / 'importance.gguf'
    corpora = [
        root / 'scripts/validation/q4-quantization/validation.txt',
        base / 'validation-independent.txt',
    ]
    options = ['-c', 512, '-ngl', 99, '--chunks', 6]
    if args.q4_three_corpora:
        corpora.append(corpora[0].with_name('transfer.txt'))
    report = {'corpus': f'Q{level} face au {reference_name} · {len(corpora)} corpus',
              'referenceName': reference_name,
              'referenceBytes': reference.stat().st_size, 'runs': []}

    def run(stage, tool, arguments, log):
        report['stage'] = stage
        engine.publish(output, report)
        return engine.run(tools, tool, arguments, output / log)

    def measure(label, file, slug):
        scores = []
        for index, corpus in enumerate(corpora, 1):
            result = run(f'{label} · corpus {index}/{len(corpora)}', 'perplexity',
                         ['-m', file, '-f', corpus, *corpus_options(index), '--kl-divergence',
                          '--kl-divergence-base', output / f'reference-{index}.logits'],
                         f'{slug}-{index}.log')
            scores.append({
                key: float(re.search(pattern + r'\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.I)[1])
                for key, pattern in [('mean_kl', 'Mean'), ('max_kl', 'Max(?:imum)?')]
            })
        report['runs'].append({'label': label, 'file': file.name, 'bytes': file.stat().st_size,
                               'mean_kl': sum(s['mean_kl'] for s in scores) / len(scores),
                               'max_kl': max(s['max_kl'] for s in scores),
                               'corpus_max_kl': [s['max_kl'] for s in scores]})
        engine.publish(output, report)

    def corpus_options(index):
        return [*options[:-1], 4] if index == 3 else options

    def verify_winner():
        candidates = [row for row in report['runs'] if row['file'].startswith('LFM3-Q4-')]
        winner = min(candidates, key=lambda row: row['max_kl'])
        corpus = corpora[0].with_name('transfer.txt')
        cache = output / 'reference-holdout.logits'
        validation_options = ['-f', corpus, '-c', 512, '-ngl', 99, '--chunks', 4]
        run('Référence Q8 · troisième corpus', 'perplexity',
            ['-m', reference, *validation_options, '--save-all-logits', cache], 'holdout-reference.log')
        result = run('Vérification du meilleur Q4 · troisième corpus', 'perplexity',
                     ['-m', output / winner['file'], *validation_options, '--kl-divergence',
                      '--kl-divergence-base', cache], 'holdout-winner.log')
        score = float(re.search(r'Max(?:imum)?\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.I)[1])
        report['corpus'] += f' · troisième corpus : {winner["label"]}, KL max {score:.6f} nat'

    try:
        if args.reference == 'q4':
            run('Matrice d’importance du Q4', 'imatrix',
                ['-m', reference, '-f', corpora[0].with_name('calibration.txt'), '-o', matrix, *options],
                'importance.log')
        for index, corpus in enumerate(corpora, 1):
            run(f'Référence {reference_name} · corpus {index}/{len(corpora)}', 'perplexity',
                ['-m', reference, '-f', corpus, *corpus_options(index), '--save-all-logits',
                 output / f'reference-{index}.logits'], f'reference-{index}.log')
        if args.q4_three_corpora:
            measure(f'{reference_name} · référence', reference, 'control')
            previous = output / 'LFM3-Q4-gate-q8-attention-q8.gguf'
            previous.hardlink_to(args.continue_q4 / previous.name)
            measure('Q4 mixte précédent · portes et attention Q8', previous, 'previous-best')
        elif args.continue_q4:
            previous = json.loads((args.continue_q4 / 'report.json').read_text(encoding='utf-8'))
            report['runs'] = previous['runs']
            for row in report['runs']:
                source = args.continue_q4 / row['file']
                if source.is_file():
                    (output / source.name).hardlink_to(source)
        else:
            measure(f'{reference_name} · référence', reference, 'control')
        candidates = [
            ('calibrated', 'Q3_K_M recalibré', 'Q3_K_M', []),
            ('mixed', 'Q3 mixte · attention et embeddings Q8', 'Q3_K_M',
             ['attn_=q8_0', 'token_embd=q8_0']),
            ('key22', 'Q8 mixte · clé d’attention 22 en Q3', 'Q8_0',
             [r'blk\.22\.attn_k\.weight=q3_K']),
        ]
        if level == '2':
            candidates = [
                ('calibrated', 'Q2_K recalibré', 'Q2_K', []),
                ('mixed', 'Q2 mixte · attention et embeddings Q8', 'Q2_K',
                 ['attn_=q8_0', 'token_embd=q8_0']),
            ]
        if level == '4' and not args.continue_q4:
            measure('Q4 actuel', reference.with_name('LFM3-Omni-2B-Q4_K_M.gguf'), 'stock-q4')
            mixed = output / 'LFM3-Q4_K_M-mixed.gguf'
            mixed.hardlink_to(base / 'q4-varied' / mixed.name)
            measure('Q4 mixte précédent', mixed, 'previous-mixed')
            attention = ['attn_q=q6_K', 'attn_k=q6_K', 'attn_output=q6_K', 'token_embd=q6_K']
            candidates = [
                ('gate-q5', 'Q4 mixte · portes FFN en Q5', 'Q4_K_M', [*attention, 'ffn_gate=q5_K']),
                ('up-q5', 'Q4 mixte · montée FFN en Q5', 'Q4_K_M', [*attention, 'ffn_up=q5_K']),
                ('ffn-q5', 'Q4 mixte · portes et montée FFN en Q5', 'Q4_K_M',
                 [*attention, 'ffn_gate=q5_K', 'ffn_up=q5_K']),
            ]
        if args.continue_q4:
            attention = ['attn_q=q6_K', 'attn_k=q6_K', 'attn_output=q6_K', 'token_embd=q6_K']
            candidates = [
                ('gate-q6', 'Q4 mixte · portes FFN en Q6', 'Q4_K_M', [*attention, 'ffn_gate=q6_K']),
                ('gate-down-q5', 'Q4 mixte · portes et descente FFN en Q5', 'Q4_K_M',
                 [*attention, 'ffn_gate=q5_K', 'ffn_down=q5_K']),
                ('gate-q5-attention-q8', 'Q4 mixte · portes Q5 et attention Q8', 'Q4_K_M',
                 ['attn_=q8_0', 'token_embd=q8_0', 'ffn_gate=q5_K']),
            ]
        if args.q4_precision_sweep:
            candidates = [
                ('gate-q8', 'Q4 mixte · portes FFN en Q8', 'Q4_K_M', [*attention, 'ffn_gate=q8_0']),
                ('gate-q5-down-q6', 'Q4 mixte · portes Q5 et descente Q6', 'Q4_K_M',
                 [*attention, 'ffn_gate=q5_K', 'ffn_down=q6_K']),
                ('gate-q5-emb-q8', 'Q4 mixte · portes Q5 et embeddings Q8', 'Q4_K_M',
                 [*attention[:-1], 'token_embd=q8_0', 'ffn_gate=q5_K']),
            ]
        if args.q4_attention_sweep:
            candidates = [
                ('gate-q8-attention-q8', 'Q4 mixte · portes et attention Q8', 'Q4_K_M',
                 ['attn_=q8_0', 'token_embd=q6_K', 'ffn_gate=q8_0']),
                ('gate-q8-down-q6', 'Q4 mixte · portes Q8 et descente Q6', 'Q4_K_M',
                 [*attention, 'ffn_gate=q8_0', 'ffn_down=q6_K']),
                ('gate-q8-v-q8', 'Q4 mixte · portes et valeurs d’attention Q8', 'Q4_K_M',
                 [*attention, 'ffn_gate=q8_0', 'attn_v=q8_0']),
            ]
        if args.q4_three_corpora:
            best = ['attn_=q8_0', 'token_embd=q6_K', 'ffn_gate=q8_0']
            candidates = [
                ('best-up-q5', 'Q4 mixte · montée FFN Q5', 'Q4_K_M', [*best, 'ffn_up=q5_K']),
                ('best-down-q6', 'Q4 mixte · descente FFN Q6', 'Q4_K_M', [*best, 'ffn_down=q6_K']),
                ('best-late-ffn-q6', 'Q4 mixte · FFN des couches 18 à 23 en Q6', 'Q4_K_M',
                 [*best, r'blk\.(18|19|2[0-3])\.ffn_(up|down)\.weight=q6_K']),
            ]
        if args.q4_size_sweep:
            candidates = [
                ('compact-early-up-q6', 'Q4 mixte · montée FFN 0 à 5 en Q6', 'Q4_K_M',
                 [*best, r'blk\.[0-5]\.ffn_up\.weight=q6_K']),
                ('compact-mid-up-q6', 'Q4 mixte · montée FFN 9 à 14 en Q6', 'Q4_K_M',
                 [*best, r'blk\.(9|1[0-4])\.ffn_up\.weight=q6_K']),
                ('compact-late-up-q6', 'Q4 mixte · montée FFN 18 à 23 en Q6', 'Q4_K_M',
                 [*best, r'blk\.(18|19|2[0-3])\.ffn_up\.weight=q6_K']),
            ]
        if args.reference == 'q4':
            candidates = candidates[:1]
        for slug, label, kind, overrides in candidates:
            model = output / f'LFM3-Q{level}-{slug}.gguf'
            tensor_options = [part for rule in overrides for part in ('--tensor-type', rule)]
            run('Quantification · ' + label, 'quantize',
                ['--allow-requantize', '--imatrix', matrix, *tensor_options, reference, model, kind],
                f'{slug}-build.log')
            measure(label, model, slug)
        if args.q4_attention_sweep:
            verify_winner()
        report['stage'] = 'Comparaison terminée'
    except Exception:
        report['stage'] = 'Comparaison interrompue'
        raise
    finally:
        engine.publish(output, report)


def append_q4_holdout(previous, corpus, output, reference, tools):
    report = json.loads((previous / 'report.json').read_text(encoding='utf-8'))
    rows = report['runs']
    if (report['stage'] != 'Comparaison terminée' or report['referenceName'] != 'Q8'
            or report['referenceBytes'] != reference.stat().st_size or not rows
            or rows[0]['file'] != reference.name or any(len(row['corpus_max_kl']) != 3 for row in rows)):
        raise ValueError('Expected a completed three-corpus comparison against this Q8')
    corpus = corpus.resolve(strict=True)
    models = [(previous / row['file']).resolve(strict=True) for row in rows[1:]]
    if any(model.stat().st_size != row['bytes'] for model, row in zip(models, rows[1:])):
        raise ValueError('Candidate model size differs from the previous report')
    output.mkdir()
    for model in models:
        (output / model.name).hardlink_to(model)
    report['corpus'] = 'Q4 face au Q8 · 4 corpus'
    cache = output / 'reference-4.logits'
    options = ['-f', corpus, '-c', 512, '-ngl', 99, '--chunks', 4]

    def run(stage, model, arguments, log):
        report['stage'] = stage
        engine.publish(output, report)
        return engine.run(tools, 'perplexity', ['-m', model, *options, *arguments], output / log)

    try:
        run('Référence Q8 · corpus 4', reference, ['--save-all-logits', cache], 'reference-4.log')
        for index, (row, model) in enumerate(zip(rows, [reference, *models])):
            result = run(f'{row["label"]} · corpus 4', model,
                         ['--kl-divergence', '--kl-divergence-base', cache], f'model-{index}-corpus-4.log')
            mean = float(re.search(r'Mean\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.I)[1])
            maximum = float(re.search(r'Max(?:imum)?\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.I)[1])
            row['mean_kl'] = (3 * row['mean_kl'] + mean) / 4
            row['corpus_max_kl'].append(maximum)
            row['max_kl'] = max(row['corpus_max_kl'])
        report['stage'] = 'Comparaison terminée'
    except Exception:
        report['stage'] = 'Comparaison interrompue'
        raise
    finally:
        engine.publish(output, report)


if __name__ == '__main__':
    main()
