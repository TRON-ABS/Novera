import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { SamplerPopover } from '../SamplerPopover'
const mock = vi.hoisted(() => ({
  update: vi.fn(),
  threadUpdate: vi.fn(),
  assistant: {
    id: 'assistant',
    name: 'Novera',
    parameters: { temperature: 0.7, custom: 'keep' },
  },
}))
vi.mock('@/hooks/useAssistant', () => ({
  useAssistant: (selector: (state: unknown) => unknown) =>
    selector({
      currentAssistant: mock.assistant,
      updateAssistant: mock.update,
      loading: false,
    }),
}))
vi.mock('@/hooks/useModelProvider', () => ({
  useModelProvider: (selector: (state: unknown) => unknown) =>
    selector({ providers: [] }),
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/containers/ParametersSection', () => ({
  ParametersSection: () => <div data-testid="parameters">Add parameter</div>,
}))
vi.mock('@/components/AssistantsMenu', () => ({ AssistantsMenu: () => null }))
beforeEach(() => vi.clearAllMocks())
const open = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'common:composer.advanced' })
  )
it('hides parameter editing until the gear is opened and resets it when the popover closes', () => {
  render(<SamplerPopover providerId="llamacpp" modelId="LFM" />)
  open()
  expect(
    screen.getByText('common:composer.assistantOverrides')
  ).toBeInTheDocument()
  expect(screen.queryByTestId('parameters')).toBeNull()
  fireEvent.click(
    screen.getByRole('button', {
      name: 'common:composer.advanced',
      expanded: false,
    })
  )
  expect(screen.getByTestId('parameters')).toBeInTheDocument()
  fireEvent.keyDown(screen.getByTestId('parameters'), { key: 'Escape' })
  open()
  expect(screen.queryByTestId('parameters')).toBeNull()
})
it('restores model sampling defaults while retaining unrelated assistant configuration', () => {
  render(<SamplerPopover providerId="llamacpp" />)
  open()
  fireEvent.click(
    screen.getByRole('button', {
      name: 'common:composer.advanced',
      expanded: false,
    })
  )
  fireEvent.click(screen.getByRole('button', { name: /common:reset/ }))
  expect(mock.update).toHaveBeenCalledWith(
    expect.objectContaining({ parameters: { custom: 'keep' } })
  )
})
it('resets the actual thread assistant and its canonical copy instead of a different global assistant', () => {
  const assistant = {
    id: 'other',
    name: 'Other',
    parameters: { top_k: 10, custom: true },
  } as unknown as Assistant
  render(
    <SamplerPopover
      providerId="llamacpp"
      assistantSwitcher={{
        assistants: [assistant],
        selectedAssistantId: 'other',
        setSelectedAssistantId: vi.fn(),
        currentThread: {
          id: 't',
          title: 'T',
          updated: 1,
          assistants: [assistant],
        },
        updateCurrentThreadAssistant: mock.threadUpdate,
      }}
    />
  )
  open()
  fireEvent.click(
    screen.getByRole('button', {
      name: 'common:composer.advanced',
      expanded: false,
    })
  )
  fireEvent.click(screen.getByRole('button', { name: /common:reset/ }))
  expect(mock.threadUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'other', parameters: { custom: true } })
  )
  expect(mock.update).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'other', parameters: { custom: true } })
  )
})
