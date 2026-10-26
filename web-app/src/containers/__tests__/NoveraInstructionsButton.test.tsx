import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NoveraInstructionsButton } from '../NoveraInstructionsButton'
import { defaultNoveraInstructions, getDefaultNoveraInstructions, getNoveraInstructions, useNoveraInstructions, withNoveraInstructions } from '@/hooks/useNoveraInstructions'
import { useCreation } from '@/hooks/useCreation'

const storage = vi.hoisted(() => new Map<string, string>())
vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: async (key: string) => storage.get(key) ?? null,
  setItem: async (key: string, value: string) => { storage.set(key, value) },
  removeItem: async (key: string) => { storage.delete(key) },
} }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

describe('Novera instructions only', () => {
  beforeEach(() => {
    storage.clear()
    useNoveraInstructions.setState({ instructions: { ...defaultNoveraInstructions } })
  })
  const open = () => {
    render(<TooltipProvider><NoveraInstructionsButton /></TooltipProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Novera · common:projects.manageInstructions' }))
  }
  it('edits three categories, persists them and leaves all model settings unchanged', async () => {
    const settings = { ...useCreation.getState().settings }
    open()
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    for (const category of ['text', 'image', 'video']) {
      fireEvent.change(screen.getByLabelText(`chat:creation.${category}`), { target: { value: `Instruction ${category}` } })
    }
    fireEvent.click(screen.getByRole('button', { name: 'common:save' }))
    expect(useCreation.getState().settings).toEqual(settings)
    expect(useNoveraInstructions.getState().instructions).toEqual({ text: 'Instruction text', image: 'Instruction image', video: 'Instruction video' })
    await waitFor(() => expect(storage.get('novera-category-instructions')).toContain('Instruction video'))
    useNoveraInstructions.setState({ instructions: { text: '', image: '', video: '' } })
    // Rehydrate from a previously saved value, as on the next app launch.
    storage.set('novera-category-instructions', JSON.stringify({ state: { instructions: { text: 'saved text', image: 'saved image', video: 'saved video' } }, version: 0 }))
    await useNoveraInstructions.persist.rehydrate()
    expect(withNoveraInstructions('image', 'a castle')).toBe('saved image\n\na castle')
  })
  it('cancels a draft without changing instructions and supplies useful defaults for each category', () => {
    open()
    expect(screen.getByLabelText('chat:creation.text')).toHaveValue(defaultNoveraInstructions.text)
    expect(screen.getByLabelText('chat:creation.image')).toHaveValue(defaultNoveraInstructions.image)
    expect(screen.getByLabelText('chat:creation.video')).toHaveValue(defaultNoveraInstructions.video)
    fireEvent.change(screen.getByLabelText('chat:creation.text'), { target: { value: 'discard' } })
    fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
    expect(useNoveraInstructions.getState().instructions).toEqual(defaultNoveraInstructions)
  })
  it('restores localized defaults only when saved, leaving model settings untouched', () => {
    const settings = { ...useCreation.getState().settings }
    open()
    fireEvent.change(screen.getByLabelText('chat:creation.text'), { target: { value: 'custom' } })
    fireEvent.click(screen.getByRole('button', { name: 'common:reset' }))
    expect(screen.getByLabelText('chat:creation.text')).toHaveValue(getDefaultNoveraInstructions().text)
    expect(useNoveraInstructions.getState().instructions).toEqual(defaultNoveraInstructions)
    fireEvent.click(screen.getByRole('button', { name: 'common:save' }))
    expect(useNoveraInstructions.getState().instructions).toEqual({})
    expect(getNoveraInstructions()).toEqual(getDefaultNoveraInstructions())
    expect(useCreation.getState().settings).toEqual(settings)
  })
})
