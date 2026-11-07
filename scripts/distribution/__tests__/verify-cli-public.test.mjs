import test from 'node:test'
import assert from 'node:assert/strict'
import { reviewCanonicalCliFeed } from '../verify-cli-public.mjs'
import { reviewedVerificationVersion } from '../prepare-public-verification.mjs'

function feed() {
  return { version: '1.0.0', platforms: Object.fromEntries(['linux-x86_64','windows-x86_64'].map(target => [target, {
    url: `https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-cli-novera/Novera_CLI_1.0.0_${target}.zip`,
    sha256: 'a'.repeat(64), signature: 'signature',
  }])) }
}
test('canonical CLI verification accepts only the selected Novera release and complete public platform set', () => {
  assert.equal(reviewCanonicalCliFeed(feed(), '1.0.0').version, '1.0.0')
  for (const mutate of [
    value => { value.version = '0.9.9' },
    value => { delete value.platforms['linux-x86_64'] },
    value => { value.platforms['darwin-aarch64'] = {} },
    value => { value.platforms['linux-x86_64'].url = value.platforms['linux-x86_64'].url.replace('-cli-novera/', '/') },
    value => { value.platforms['linux-x86_64'].url += '?token=x' },
    value => { value.platforms['linux-x86_64'].url = value.platforms['linux-x86_64'].url.replace('TRON-ABS', 'other') },
    value => { value.platforms['linux-x86_64'].signature = '' },
    value => { value.platforms['linux-x86_64'].sha256 = '' },
  ]) {
    const value = feed(); mutate(value)
    assert.throws(() => reviewCanonicalCliFeed(value, '1.0.0'))
  }
})

test('the reviewed 1.0.1 CLI can add Mac without dropping Windows/Linux or accepting unknown targets', () => {
  const value = { version: '1.0.1', platforms: {} }
  const selected = ['linux-x86_64', 'windows-x86_64', 'darwin-aarch64']
  for (const target of selected) value.platforms[target] = { url: `https://github.com/TRON-ABS/Novera/releases/download/v1.0.1-cli-novera/Novera_CLI_1.0.1_${target}.zip`, sha256: 'a'.repeat(64), signature: 'signed' }
  assert.equal(reviewCanonicalCliFeed(value, '1.0.1', selected), value)
  for (const scope of [selected.slice(1), [...selected, 'linux-aarch64'], [...selected, selected[0]]]) assert.throws(() => reviewCanonicalCliFeed(value, '1.0.1', scope))
  assert.throws(() => reviewCanonicalCliFeed(value, '1.0.1'))
})

test('public verification refuses old or missing descriptors instead of probing 1.0.0 packages', () => {
  const descriptor = { version: '1.0.1', assets: [{}], channels: { desktop: {}, cli: {} } }
  assert.equal(reviewedVerificationVersion(descriptor, '1.0.1'), '1.0.1')
  for (const value of [{ ...descriptor, version: '1.0.0' }, { ...descriptor, version: '1.0.1\nINJECT=x' }, { ...descriptor, assets: [] }, { ...descriptor, channels: {} }]) assert.throws(() => reviewedVerificationVersion(value, '1.0.1'))
})
