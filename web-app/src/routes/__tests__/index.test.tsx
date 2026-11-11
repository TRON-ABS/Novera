/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

const h = vi.hoisted(() => ({
  providers: [] as any[],
  search: { threadModel: undefined as any },
  setCurrentThreadId: vi.fn(),
  useTools: vi.fn(),
  isTauri: true,
  autoTuneEnabled: false,
  autoTuneProgress: { active: null as { task: string; model: string } | null, remaining: null, total: 0 },
  providerHasRemoteApiKeys: vi.fn(() => false),
  predefinedProviders: [
    { provider: 'openai' },
    { provider: 'llamacpp' },
    { provider: 'jan' },
  ],
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: any) => ({ ...config, id: '/' }),
  useSearch: () => h.search,
  Navigate: ({ to }: any) => <div data-testid="browser-provider-setup" data-to={to} />,
}))

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => h.isTauri }))
vi.mock('@/containers/AutoTuneControl', () => ({ useDesktopAutoTuneEnabled: () => h.autoTuneEnabled }))
vi.mock('@/services/creation/auto-tune', () => ({
  getAutoTuneProgress: () => h.autoTuneProgress,
  getInitialAutoTuneProgress: () => h.autoTuneProgress,
  subscribeAutoTuneProgress: () => () => {},
}))

vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string, options?: { model: string; category: string }) =>
    options ? [key, options.model, options.category].join(' ') : key }),
}))

vi.mock('@/hooks/useModelProvider', () => ({
  useModelProvider: () => ({ providers: h.providers }),
}))

vi.mock('@/hooks/useThreads', () => ({
  useThreads: () => ({ setCurrentThreadId: h.setCurrentThreadId }),
}))

vi.mock('@/hooks/useTools', () => ({
  useTools: h.useTools,
}))

vi.mock('@/containers/ChatInput', () => ({
  default: ({ model, initialMessage }: any) => (
    <div data-testid="chat-input" data-initial={String(initialMessage)}>
      {model ? model.id : 'no-model'}
    </div>
  ),
}))

vi.mock('@/containers/HeaderPage', () => ({
  default: ({ children }: any) => <div data-testid="header-page">{children}</div>,
}))

vi.mock('@/containers/DropdownModelProvider', () => ({
  default: ({ model }: any) => (
    <div data-testid="dropdown">{model ? model.id : 'none'}</div>
  ),
}))

vi.mock('@/containers/SetupScreen', () => ({
  default: () => <div data-testid="setup-screen" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...c: any[]) => c.filter(Boolean).join(' '),
}))

vi.mock('@/lib/provider-api-keys', () => ({
  providerHasRemoteApiKeys: (p: any) => h.providerHasRemoteApiKeys(p),
}))

vi.mock('@/constants/providers', () => ({
  predefinedProviders: h.predefinedProviders,
}))

vi.mock('@/constants/routes', () => ({
  route: { home: '/', settings: { model_providers: '/settings/providers' } },
}))

import { Route } from '../index'

const renderComponent = () => {
  const Component = Route.component as React.ComponentType
  return render(<Component />)
}

describe('Index route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.providers = []
    h.isTauri = true
    h.autoTuneEnabled = false
    h.autoTuneProgress.active = null
    h.search = { threadModel: undefined }
    h.providerHasRemoteApiKeys.mockReturnValue(false)
  })

  it('validateSearch returns threadModel from search params', () => {
    const tm = { id: 'm1', provider: 'p1' }
    const result = (Route as any).validateSearch({ threadModel: tm })
    expect(result.threadModel).toEqual(tm)
  })

  it('validateSearch handles missing threadModel', () => {
    const result = (Route as any).validateSearch({})
    expect(result.threadModel).toBeUndefined()
  })

  it('renders SetupScreen when no valid providers exist', () => {
    h.providers = []
    renderComponent()
    expect(screen.getByTestId('setup-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument()
  })

  it('opens provider configuration in a fresh browser instead of installing a desktop engine', () => {
    h.isTauri = false
    renderComponent()
    expect(screen.getByTestId('browser-provider-setup')).toHaveAttribute('data-to', '/settings/providers')
    expect(screen.queryByTestId('setup-screen')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument()
  })

  it('keeps browser chat accessible when a remote provider is configured', () => {
    h.isTauri = false
    h.providers = [{ provider: 'openai', models: [] }]
    h.providerHasRemoteApiKeys.mockReturnValue(true)
    renderComponent()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    expect(screen.queryByTestId('browser-provider-setup')).not.toBeInTheDocument()
  })

  it('renders SetupScreen when predefined provider has no api key and no models', () => {
    h.providers = [{ provider: 'openai', models: [] }]
    h.providerHasRemoteApiKeys.mockReturnValue(false)
    renderComponent()
    expect(screen.getByTestId('setup-screen')).toBeInTheDocument()
  })

  it('renders chat UI when predefined provider has api key', () => {
    h.providers = [{ provider: 'openai', models: [] }]
    h.providerHasRemoteApiKeys.mockReturnValue(true)
    renderComponent()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    expect(screen.getByTestId('header-page')).toBeInTheDocument()
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument()
    expect(screen.getByText('chat:description')).toBeInTheDocument()
  })

  it('replaces the home greeting with the active model and restores it after Auto Tune is turned off', () => {
    h.providers = [{ provider: 'llamacpp', models: [{ id: 'x' }] }]
    h.autoTuneEnabled = true
    const { rerender } = renderComponent()
    const Component = Route.component as React.ComponentType
    expect(screen.getByRole('heading')).toHaveTextContent('Auto Tune · ui:autoTuneWaiting')
    h.autoTuneProgress.active = { task: 'video', model: 'C:/models/Wan.gguf' }
    rerender(<Component />)
    expect(screen.getByRole('heading')).toHaveTextContent('ui:autoTuneHomeTesting Wan.gguf chat:creation.video')
    h.autoTuneEnabled = false
    rerender(<Component />)
    expect(screen.getByRole('heading')).toHaveTextContent('chat:description')
  })

  it('renders chat UI when llamacpp provider has models', () => {
    h.providers = [{ provider: 'llamacpp', models: [{ id: 'x' }] }]
    h.providerHasRemoteApiKeys.mockReturnValue(false)
    renderComponent()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('renders chat UI when jan provider has models', () => {
    h.providers = [{ provider: 'jan', models: [{ id: 'j' }] }]
    renderComponent()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('renders chat UI for custom provider with models, no api key required', () => {
    h.providers = [{ provider: 'custom-xyz', models: [{ id: 'c' }] }]
    renderComponent()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('renders SetupScreen for custom provider with no models', () => {
    h.providers = [{ provider: 'custom-xyz', models: [] }]
    renderComponent()
    expect(screen.getByTestId('setup-screen')).toBeInTheDocument()
  })

  it('passes threadModel into ChatInput without a duplicate header selector', () => {
    h.providers = [{ provider: 'openai', models: [] }]
    h.providerHasRemoteApiKeys.mockReturnValue(true)
    h.search = { threadModel: { id: 'gpt-x', provider: 'openai' } }
    renderComponent()
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toHaveTextContent('gpt-x')
    expect(screen.getByTestId('chat-input')).toHaveAttribute('data-initial', 'true')
  })

  it('calls setCurrentThreadId(undefined) and useTools on mount', () => {
    h.providers = [{ provider: 'openai', models: [] }]
    h.providerHasRemoteApiKeys.mockReturnValue(true)
    renderComponent()
    expect(h.setCurrentThreadId).toHaveBeenCalledWith(undefined)
    expect(h.useTools).toHaveBeenCalled()
  })
})
