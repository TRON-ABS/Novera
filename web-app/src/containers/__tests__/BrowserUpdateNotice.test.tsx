import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { BrowserUpdateNotice, newerWebVersion } from '../BrowserUpdateNotice'
import { usePrompt } from '@/hooks/usePrompt'
import { useCreation } from '@/hooks/useCreation'

vi.mock('@/services/browser-preview/storage', () => ({ flushBrowserConversations: vi.fn().mockResolvedValue(undefined) }))
const manifest = { application: 'NoveraWeb', schemaVersion: 1, version: '1.0.2', buildId: 'next-build' }
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); usePrompt.setState({ prompt: '' }); useCreation.setState({ progress: {} }) })

it('only accepts the matching Web manifest with a different build identity', () => {
  expect(newerWebVersion(manifest, 'current-build')).toBe('1.0.2')
  expect(newerWebVersion(manifest, 'next-build')).toBeUndefined()
  expect(newerWebVersion({ ...manifest, application: 'OtherApp' }, 'current-build')).toBeUndefined()
  expect(newerWebVersion({ ...manifest, buildId: '<script>' }, 'current-build')).toBeUndefined()
})

it('offers an update without reloading through a draft or active media job', async () => {
  vi.stubEnv('PROD', true)
  const fetch = vi.fn().mockResolvedValue(Response.json(manifest))
  vi.stubGlobal('fetch', fetch)
  usePrompt.setState({ prompt: 'Unsaved draft' })
  useCreation.setState({ progress: {} })
  const view = render(<BrowserUpdateNotice modelBusy={false} />)
  await screen.findByText(/Nouvelle version disponible/)
  expect(screen.getByRole('button', { name: 'Recharger Novera' })).toBeDisabled()
  await act(async () => { usePrompt.setState({ prompt: '' }); useCreation.setState({ progress: { test: { stage: 'generating', progress: 40 } } }) })
  expect(screen.getByRole('button', { name: 'Recharger Novera' })).toBeDisabled()
  await act(async () => { useCreation.setState({ progress: {} }) })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Recharger Novera' })).toBeEnabled())
  await act(async () => { view.rerender(<BrowserUpdateNotice modelBusy />) })
  expect(screen.getByRole('button', { name: 'Recharger Novera' })).toBeDisabled()
  expect(fetch.mock.calls[0][1]).toMatchObject({ cache: 'no-store', credentials: 'omit' })
})
