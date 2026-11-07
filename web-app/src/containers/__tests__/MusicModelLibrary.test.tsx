import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { MusicModelLibrary } from '../MusicModelLibrary'

const state = vi.hoisted(() => ({ select: vi.fn(), setSelection: vi.fn() }))
vi.mock('@/hooks/useMusicCreation', () => ({ useMusicCreation: () => ({ select: state.select,
  profiles: [{id:'music',name:'ACE-Step',settings:{directory:'C:\\Models',generator:'generator.gguf',planner:'planner.gguf',encoder:'encoder.gguf',vae:'vae.gguf'}}],
}) }))
vi.mock('@/hooks/useCreation', () => ({ useCreation: {getState: () => state} }))
vi.mock('@/containers/MusicControls', () => ({ MusicSetupPanel: () => <div>Music settings</div> }))
vi.mock('@/i18n/react-i18next-compat', () => ({useTranslation: () => ({t: (key: string) => ({
  'chat:creation.music':'Musique', 'chat:creation.local':'Local', 'chat:creation.settings':'Réglages de création',
  'chat:creation.configure':'Choisissez un modèle cloud avec sa clé API, ou configurez le moteur local.',
  'chat:creation.musicGenerator':'Générateur musical', 'chat:creation.musicPlanner':'Planificateur musical',
  'chat:creation.ggufTextEncoder':'Encodeur de texte', 'chat:creation.ggufVae':'VAE',
}[key] ?? key)}) }))

it('keeps the explanatory sentence outside the button and translates every model role', () => {
  render(<MusicModelLibrary />)
  const configure = screen.getByRole('button', {name:'Réglages de création'})
  expect(configure).not.toHaveTextContent('Choisissez')
  expect(screen.getByText(/^Choisissez/).tagName).toBe('P')
  for (const label of ['Générateur musical','Planificateur musical','Encodeur de texte','VAE']) {
    expect(screen.getByText(label)).toBeInTheDocument()
  }
  expect(screen.queryByText('chat:creation.musicEncoder')).not.toBeInTheDocument()
  fireEvent.click(configure)
  expect(state.setSelection).toHaveBeenCalledWith('settings-music-library','music')
  expect(screen.getByText('Music settings')).toBeInTheDocument()
})
