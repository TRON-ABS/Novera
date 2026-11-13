import { findSessionByModel } from '@janhq/tauri-plugin-llamacpp-api'
import { loopbackFetch } from './model-factory'

type TokenProbability = { id: number; logprob: number; bytes: number[] }
export type Distribution = { tokens: string[]; logprobs: Float64Array }
const vocabularyLimit = 262144
export const KL_THRESHOLD = 2.5

export async function firstTokenDistribution(modelId: string, prompt: string, signal: AbortSignal): Promise<Distribution> {
  const session = await findSessionByModel(modelId)
  if (!session) throw new Error('Session locale indisponible.')
  const response = await loopbackFetch(`http://localhost:${session.port}/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.api_key}`,
      Origin: 'tauri://localhost',
    },
    body: JSON.stringify({
      model: modelId, prompt, n_predict: 1, n_probs: vocabularyLimit,
      temperature: -1, post_sampling_probs: false, cache_prompt: false, stream: false,
    }),
    signal,
  })
  if (!response.ok) throw new Error(`Probabilités indisponibles (HTTP ${response.status}).`)
  const payload = await response.json() as {
    completion_probabilities?: Array<{ top_logprobs?: TokenProbability[] }>
  }
  return parseDistribution(payload.completion_probabilities?.[0]?.top_logprobs)
}

export function parseDistribution(tokens: TokenProbability[] | undefined): Distribution {
  if (!Array.isArray(tokens) || tokens.length < 2 || tokens.length >= vocabularyLimit) {
    throw new Error('Distribution complète du vocabulaire indisponible.')
  }
  const identities = new Array<string>(tokens.length)
  const logprobs = new Float64Array(tokens.length)
  let mass = 0
  for (const token of tokens) {
    if (!Number.isInteger(token.id) || token.id < 0 || token.id >= tokens.length ||
      identities[token.id] !== undefined || !Number.isFinite(token.logprob) ||
      token.logprob > 0 || !Array.isArray(token.bytes)) {
      throw new Error('Format des probabilités du moteur incompatible.')
    }
    identities[token.id] = JSON.stringify(token.bytes)
    logprobs[token.id] = token.logprob
    mass += Math.exp(token.logprob)
  }
  // The worker's float softmax can deviate slightly from unit mass on 128k tokens.
  if (Math.abs(1 - mass) > 0.01) throw new Error('La somme des probabilités du vocabulaire est incohérente.')
  const logMass = Math.log(mass)
  for (let id = 0; id < logprobs.length; id++) logprobs[id] -= logMass
  return { tokens: identities, logprobs }
}

export function fullKl(original: Distribution, adjusted: Distribution): number {
  if (original.tokens.length !== adjusted.tokens.length ||
    original.tokens.some((token, id) => token !== adjusted.tokens[id])) {
    throw new Error('Les modèles doivent partager le même vocabulaire et les mêmes identifiants de tokens.')
  }
  let divergence = 0
  for (let id = 0; id < original.logprobs.length; id++) {
    const logp = original.logprobs[id]
    divergence += Math.exp(logp) * (logp - adjusted.logprobs[id])
  }
  return Math.max(0, divergence)
}
