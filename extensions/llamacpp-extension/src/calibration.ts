export const CALIBRATION_RECEIPT = 'novera-calibration.json'
// Full screening and confirmation for every candidate supersedes revision 2.
export const CALIBRATION_REVISION = 3

export function calibrationBasis(ini: string, modelId: string): string | undefined {
  const shared: string[] = []
  const model: string[] = []
  let section = ''
  for (const raw of ini.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1, -1)
      continue
    }
    const equal = line.indexOf('=')
    if (equal < 0 || line.startsWith('#') || line.startsWith(';')) continue
    const normalized = `${line.slice(0, equal).trim()} = ${line.slice(equal + 1).trim()}`
    if (section === '*') shared.push(normalized)
    if (section === modelId) model.push(normalized)
  }
  if (!model.some((line) => line.startsWith('model = '))) return
  return JSON.stringify([shared, model])
}

export interface CalibrationProfile {
  threads: 2 | 4 | 8 | null
  load_mode: 'none' | null
}

export interface CalibrationReceipt {
  basis: string
  state: 'pending' | 'complete'
  profile?: CalibrationProfile | null
  revision?: number
}

export function calibratedPresetLines(
  receipt: CalibrationReceipt,
  basis: string | undefined
): string[] | undefined {
  if (!basis || receipt.basis !== basis || receipt.state !== 'complete') return
  const profile = receipt.profile
  if (!profile || (profile.threads !== null && ![2, 4, 8].includes(profile.threads)) ||
      (profile.load_mode !== null && profile.load_mode !== 'none')) return
  const lines: string[] = []
  if (profile.threads !== null) lines.push('threads = ' + profile.threads)
  if (profile.load_mode === 'none') lines.push('load-mode = none')
  return lines
}
export function applyCalibratedPreset(section: string[], tuning: string[] | undefined): string[] {
  if (!tuning) return section
  return [...section.filter(line => !/^(threads|load-mode) = /.test(line)), ...tuning]
}

export function calibrationReceiptMatches(receipt: CalibrationReceipt, currentBasis: string) {
  if (receipt.basis === currentBasis) return true
  const tuning = calibratedPresetLines(receipt, receipt.basis)
  if (!tuning) return false
  const [shared, model] = JSON.parse(receipt.basis) as [string[], string[]]
  return JSON.stringify([shared, applyCalibratedPreset(model, tuning)]) === currentBasis
}

import { invoke } from '@tauri-apps/api/core'

export async function desktopCalibration(): Promise<boolean | null> {
  try {
    const status = await invoke<boolean | null>('desktop_calibration')
    return typeof status === 'boolean' ? status : null
  } catch {
    return null
  }
}
