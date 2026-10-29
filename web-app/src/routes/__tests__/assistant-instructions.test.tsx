import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => config,
  Link: ({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) => <a href={to} onClick={onClick}>{children}</a>,
}))
vi.mock('@/containers/HeaderPage', () => ({ default: ({ children }: { children: ReactNode }) => <header>{children}</header> }))
vi.mock('@/containers/SettingsMenu', () => ({ default: () => <nav /> }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string, options?: { path: string }) => options ? `${key}: ${options.path}` : key }) }))
import { AssistantContent } from '../settings/assistant'

it('explains the three categories and directs users to the sole dashboard editor without another editing form', () => {
  render(<AssistantContent />)
  expect(screen.getByRole('heading', { name: 'Novera' })).toBeInTheDocument()
  expect(screen.getByText('assistants:officialInstructions: common:home → Novera · common:projects.manageInstructions')).toBeInTheDocument()
  for (const category of ['text', 'image', 'video']) expect(screen.getByText(`chat:creation.${category}`)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'common:home' })).toHaveAttribute('href', '/')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.queryByText('assistants:addAssistant')).not.toBeInTheDocument()
  expect(screen.queryByText('assistants:editAssistant')).not.toBeInTheDocument()
})
