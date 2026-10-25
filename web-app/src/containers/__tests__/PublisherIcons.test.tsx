import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ModelPublisherAvatar, { modelPublisherLogo } from '../ModelPublisherAvatar'
import { NOVERA_HUB_MODELS } from '@/lib/hubDiscovery'
import { predefinedProviders } from '@/constants/providers'
import { getProviderLogo } from '@/lib/utils'

function assertBundledImage(src: string | undefined) {
  expect(src).toMatch(/^\/images\/model-provider\//)
  const data = readFileSync(resolve(process.cwd(), `public${src}`))
  expect(data.length).toBeGreaterThan(100)
  expect(data.toString('utf8', 0, 100)).not.toContain('<!DOCTYPE html')
}

describe('official publisher icons', () => {
  it.each(predefinedProviders)('bundles an icon for cloud provider $provider', (provider) => {
    assertBundledImage(getProviderLogo(provider.provider))
  })

  it.each(NOVERA_HUB_MODELS)('identifies the publisher of available local model $model_name', (model) => {
    assertBundledImage(modelPublisherLogo(model))
    render(<ModelPublisherAvatar model={model} />)
    expect(screen.getByRole('img', { name: model.developer })).toHaveAttribute('src', modelPublisherLogo(model))
  })

  it('does not guess a publisher from an unknown developer', () => {
    expect(modelPublisherLogo({ developer: 'unknown-publisher' })).toBeUndefined()
    const view = render(<ModelPublisherAvatar model={{ developer: 'unknown-publisher' }} />)
    expect(view.container).toBeEmptyDOMElement()
  })
})
