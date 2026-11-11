import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AutoTuneContribution } from './AutoTuneContribution'

vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}))

afterEach(() => {
  cleanup()
  localStorage.removeItem('novera-auto-tune-contribution-consent:https://relay.example.test/auto-tune')
  localStorage.removeItem('novera-auto-tune-contribution-consent:https://other.example.test/auto-tune')
  vi.unstubAllEnvs()
})

it('remembers consent and revocation when the same relay is reopened', () => {
  vi.stubEnv('VITE_NOVERA_AUTO_TUNE_CONTRIBUTION_URL', 'https://relay.example.test/auto-tune')
  const open = () => render(<AutoTuneContribution gains={[]} browser />)
  const checkbox = () => screen.getByRole('checkbox', { name: 'ui:autoTuneContributionAutoSend' })

  const first = open()
  expect(checkbox()).not.toBeChecked()
  fireEvent.click(checkbox())
  first.unmount()

  const restarted = open()
  expect(checkbox()).toBeChecked()
  restarted.unmount()

  vi.stubEnv('VITE_NOVERA_AUTO_TUNE_CONTRIBUTION_URL', 'https://other.example.test/auto-tune')
  const differentRelay = open()
  expect(checkbox()).not.toBeChecked()
  differentRelay.unmount()

  vi.stubEnv('VITE_NOVERA_AUTO_TUNE_CONTRIBUTION_URL', 'https://relay.example.test/auto-tune')
  const reopened = open()
  expect(checkbox()).toBeChecked()
  fireEvent.click(checkbox())
  reopened.unmount()

  open()
  expect(checkbox()).not.toBeChecked()
})
