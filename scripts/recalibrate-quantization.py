"""Build a separate GGUF with activation-aware quantization and compare it to Q8."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess


def run(tools, tool, options, log):
    print(json.dumps({'stage': log.stem}), flush=True)
    with log.open('wb') as output:
        suffix = '.exe' if os.name == 'nt' else ''
        subprocess.run([str((tools / f'llama-{tool}{suffix}').resolve()), *map(str, options)],
                       stdout=output, stderr=subprocess.STDOUT, check=True)
    return log.read_text(encoding='utf-8', errors='replace')

def publish(directory, report):
    staging = directory / 'report.tmp'
    staging.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    staging.replace(directory / 'report.json')


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    for name in ('tools', 'reference', 'baseline', 'calibration', 'validation', 'output'):
        cli.add_argument('--' + name, type=Path, required=True)
    cli.add_argument('--source', type=Path, help='Prefer an original BF16/FP16 GGUF when available')
    cli.add_argument('--type', default='Q4_K_M', choices=('Q4_K_M', 'Q3_K_M', 'Q2_K', 'IQ1_M'))
    cli.add_argument('--chunks', type=int, default=8)
    cli.add_argument('--gpu-layers', type=int, default=99)
    a = cli.parse_args()
    if a.chunks < 1:
        cli.error('--chunks must be positive')
    if a.calibration.read_bytes() == a.validation.read_bytes():
        cli.error('Calibration and validation must be separate corpora')
    a.output.mkdir(parents=True, exist_ok=False)
    matrix = a.output / 'importance.gguf'
    candidate = a.output / f'LFM3-{a.type}-calibrated.gguf'
    cache = a.output / 'reference.logits'
    common = ['-c', 512, '-ngl', a.gpu_layers, '--chunks', a.chunks]
    report = {'reference': str(a.reference), 'source': str(a.source or a.reference),
              'candidate': str(candidate), 'baseline': str(a.baseline), 'quantization': a.type,
              'calibration': str(a.calibration), 'validation': str(a.validation)}
    publish(a.output, report)
    run(a.tools, 'imatrix', ['-m', a.reference, '-f', a.calibration, '-o', matrix, *common],
        a.output / '01-importance.log')
    run(a.tools, 'quantize', ['--allow-requantize', '--imatrix', matrix,
        a.source or a.reference, candidate, a.type], a.output / '02-quantization.log')
    evaluation = ['-f', a.validation, *common]
    run(a.tools, 'perplexity', ['-m', a.reference, *evaluation, '--save-all-logits', cache],
        a.output / '03-reference.log')
    for number, (label, model) in enumerate((('baseline', a.baseline), ('candidate', candidate)), 4):
        log = a.output / f'0{number}-{label}.log'
        result = run(a.tools, 'perplexity',
                     ['-m', model, *evaluation, '--kl-divergence', '--kl-divergence-base', cache], log)
        mean = re.search(r'Mean\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.IGNORECASE)
        peak = re.search(r'Max(?:imum)?\s+KLD\s*[:=]\s*([\d.eE+-]+)', result, re.IGNORECASE)
        report[label + '_metrics'] = {'bytes': model.stat().st_size,
                                      'mean_kl': float(mean[1]) if mean else None,
                                      'max_kl': float(peak[1]) if peak else None,
                                      'log': str(log)}
        publish(a.output, report)
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    main()
