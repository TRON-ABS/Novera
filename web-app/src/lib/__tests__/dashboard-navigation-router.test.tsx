import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { createFileRoute, RouterProvider, useParams, useSearch } from '@tanstack/react-router'
import { createDashboardRouter } from '../dashboard-navigation-router'

afterEach(cleanup)
it('navigates settings subpages and validated model details without touching browser history', async () => {
  const address = window.location.href
  const onExit = vi.fn()
  const General = createFileRoute('/settings/general')({ component: () => <p>General settings</p> })
  const Provider = createFileRoute('/settings/providers/$providerName')({ component: () => {
    const params = useParams({ strict: false })
    return <p>Provider: {params.providerName}</p>
  } })
  const Model = createFileRoute('/hub/$modelId')({
    validateSearch: search => ({ repo: String(search.repo ?? '') }),
    component: () => {
      const params = useParams({ strict: false })
      const search = useSearch({ strict: false }) as { repo: string }
      return <p>Model: {params.modelId}, repo: {search.repo}</p>
    },
  })
  const router = await createDashboardRouter('/settings/general', onExit, {
    '../routes/settings/general.tsx': async () => ({ Route: General }),
    '../routes/settings/providers/$providerName.tsx': async () => ({ Route: Provider }),
    '../routes/hub/$modelId.tsx': async () => ({ Route: Model }),
  })
  render(<><textarea defaultValue="Existing draft" /><RouterProvider router={router} /></>)
  await screen.findByText('General settings')
  await act(async () => { await router.navigate({ to: '/settings/providers/$providerName', params: { providerName: 'local' } }) })
  await screen.findByText('Provider: local')
  await act(async () => { await router.navigate({ to: '/hub/$modelId', params: { modelId: 'model-a' }, search: { repo: 'owner/model-a' } }) })
  await screen.findByText('Model: model-a, repo: owner/model-a')
  expect(window.location.href).toBe(address)
  expect(screen.getByRole('textbox')).toHaveValue('Existing draft')
  const model = { id: 'model-a', provider: 'llamacpp' }
  await act(async () => { await router.navigate({ to: '/', search: { threadModel: model } }) })
  expect(onExit).toHaveBeenCalledWith(model)
  expect(window.location.href).toBe(address)
  expect(screen.getByRole('textbox')).toHaveValue('Existing draft')
})
