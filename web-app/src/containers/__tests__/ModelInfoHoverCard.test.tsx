import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelInfoHoverCard } from '../ModelInfoHoverCard'
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key === 'hub:catalog.unknown' ? 'Estimation mémoire indisponible' : key, i18n: { language: 'fr' } }) }))
vi.mock('../HubHardwareDiagnostic', () => ({ useHubDiagnosis: () => ({ memory: 'unknown', engineState: 'planned', requiredBytes: null }) }))
describe('Hub compatibility badge', () => {
  it('uses the translated shared diagnosis when requirements are unknown', () => {
    render(<ModelInfoHoverCard model={{ model_name: 'Bai1', downloads: 0, description: '' }} defaultModelQuantizations={[]} isDefaultVariant />)
    expect(screen.getByRole('button')).toHaveTextContent('Estimation mémoire indisponible')
    expect(screen.queryByText('Fit unknown')).toBeNull()
  })
})
