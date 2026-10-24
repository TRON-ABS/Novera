import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CopyButton } from '../CopyButton'
import TokenSpeedIndicator from '../TokenSpeedIndicator'
import { EditMessageDialog } from '../dialogs/EditMessageDialog'
import { DeleteMessageDialog } from '../dialogs/DeleteMessageDialog'

const state = vi.hoisted(() => ({ locale: 'fr', expanded: true }))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ i18n: {language: state.locale}, t: (key: string) => ({
    'common:copy':'Copier','common:copied':'Copié !','common:edit':'Modifier','common:deleteMessage':'Supprimer le message',
    'chat:messageStats.details':'Statistiques de génération','chat:messageStats.generation':'Génération',
    'chat:messageStats.reading':'Lecture','chat:messageStats.tokens':'Jetons','chat:messageStats.perSecond':'jetons/s',
  }[key] ?? key) }),
}))
vi.mock('@/hooks/useInterfaceSettings', () => ({useInterfaceSettings: (select: (s: object) => unknown) => select({showTokenSpeed:state.expanded})}))
vi.mock('@/hooks/useModelProvider', () => ({useModelProvider: (select: (s: object) => unknown) => select({selectedModel:{id:'test'}})}))
afterEach(() => vi.restoreAllMocks())
it('shows the translated copy tooltip when the action receives keyboard focus', async () => {
  render(<CopyButton text="Texte" />)
  fireEvent.focus(screen.getByRole('button', {name:'Copier'}))
  expect(await screen.findByRole('tooltip', {name:'Copier'})).toBeInTheDocument()
})
it('exposes translated labels on copy, edit and delete controls and keeps dialogs usable', async () => {
  const remove = vi.fn()
  render(<><CopyButton text="Texte" /><EditMessageDialog message="Texte" onSave={vi.fn()} /><DeleteMessageDialog onDelete={remove} /></>)
  expect(screen.getByRole('button', {name:'Copier'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', {name:'Modifier'}))
  expect(screen.getByTestId('edit-message-dialog')).toBeInTheDocument()
  fireEvent.keyDown(screen.getByTestId('edit-message-dialog'), {key:'Escape'})
  await act(async () => {})
  expect(screen.getByRole('button', {name:'Supprimer le message'})).toBeInTheDocument()
  expect(remove).not.toHaveBeenCalled()
})
it('translates the expanded statistics and makes their details available on click', () => {
  state.expanded = true
  render(<TokenSpeedIndicator metadata={{tokenSpeed:{tokenSpeed:194.5,promptSpeed:1000.25,tokenCount:87}}} />)
  fireEvent.click(screen.getByRole('button', {name:'Statistiques de génération'}))
  expect(screen.getByText('Génération')).toBeInTheDocument()
  expect(screen.getByText('Lecture')).toBeInTheDocument()
  expect(screen.getByText('194,5 jetons/s')).toBeInTheDocument()
  expect(screen.queryByText(/tokens\/sec|Generation|Reading/)).not.toBeInTheDocument()
})
