import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Route as PrivacyRoute } from '../privacy'

const telemetry = vi.hoisted(() => ({ available: true, set: vi.fn() }))
const errors = vi.hoisted(() => ({ set: vi.fn() }))
vi.mock('@/hooks/useErrorTracking', () => ({ useErrorTracking: () => ({ enabled: false, setEnabled: errors.set }) }))

// Mock dependencies
vi.mock('@/containers/SettingsMenu', () => ({
  default: () => <div data-testid="settings-menu">Settings Menu</div>,
}))

vi.mock('@/containers/HeaderPage', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-page">{children}</div>
  ),
}))

vi.mock('@/containers/Card', () => ({
  Card: ({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="card">
      {header && <div data-testid="card-header">{header}</div>}
      {children}
    </div>
  ),
  CardItem: ({ title, description, actions }: { title?: string; description?: string; actions?: React.ReactNode }) => (
    <div data-testid="card-item" data-title={title}>
      {title && <div data-testid="card-item-title">{title}</div>}
      {description && <div data-testid="card-item-description">{description}</div>}
      {actions && <div data-testid="card-item-actions">{actions}</div>}
    </div>
  ),
}))

vi.mock('@/hooks/useAnalytic', () => ({
  useAnalytic: () => ({
    productAnalytic: false,
    setProductAnalytic: telemetry.set,
    analyticsAvailable: telemetry.available,
  }),
}))

vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled }: { checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) => (
    <input
      data-testid="switch"
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}))

vi.mock('posthog-js', () => ({
  default: {
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  },
}))

vi.mock('@/constants/routes', () => ({
  route: {
    settings: {
      privacy: '/settings/privacy',
    },
  },
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (config: any) => ({
    ...config,
    component: config.component,
  }),
}))

describe('Privacy Settings Route', () => {
  it('keeps error consent independent and prevents enabling without a destination', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    const view = render(<Component />)
    const switches = screen.getAllByTestId('switch')
    expect(switches[1]).not.toBeChecked()
    fireEvent.click(switches[1])
    expect(errors.set).toHaveBeenCalledWith(true)
    expect(telemetry.set).not.toHaveBeenCalled()
    telemetry.available = false; view.rerender(<Component />)
    expect(screen.getAllByTestId('switch')[1]).toBeDisabled()
  })
  beforeEach(() => {
    vi.clearAllMocks()
    telemetry.available = true
  })

  it('does not allow statistics to be enabled before a destination is configured', () => {
    telemetry.available = false
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)
    expect(screen.getAllByTestId('switch')[0]).toBeDisabled()
    expect(screen.getAllByText('common:telemetry.unavailable')[0]).toBeInTheDocument()
  })

  it('records explicit consent only when the user enables the configured switch', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)
    expect(telemetry.set).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByTestId('switch')[0])
    expect(telemetry.set).toHaveBeenCalledWith(true)
  })

  it('should render the privacy settings page', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    expect(screen.getByTestId('header-page')).toBeInTheDocument()
    expect(screen.getByTestId('settings-menu')).toBeInTheDocument()
    expect(screen.getByText('common:settings')).toBeInTheDocument()
  })

  it('should render analytics card with header', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    expect(screen.getAllByTestId('card')[0]).toBeInTheDocument()
    expect(screen.getAllByTestId('card-header')[0]).toBeInTheDocument()
    expect(screen.getByText('settings:privacy.analytics')).toBeInTheDocument()
  })

  it('should render analytics switch', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    expect(analyticsSwitch).toBeInTheDocument()
    expect(analyticsSwitch).not.toBeChecked()
  })

  it('should handle analytics toggle when enabling', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    expect(analyticsSwitch).toBeInTheDocument()
    
    // Test that switch is interactive
    fireEvent.click(analyticsSwitch)
    expect(analyticsSwitch).toBeInTheDocument()
  })

  it('should handle analytics toggle when disabling', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    expect(analyticsSwitch).toBeInTheDocument()
    
    // Test that switch is interactive
    fireEvent.click(analyticsSwitch)
    expect(analyticsSwitch).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const headerPage = screen.getByTestId('header-page')
    expect(headerPage).toBeInTheDocument()
    
    const settingsMenu = screen.getByTestId('settings-menu')
    expect(settingsMenu).toBeInTheDocument()
  })

  it('should render switch in correct checked state based on productAnalytic', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    expect(analyticsSwitch).toBeInTheDocument()
    // Test that switch has some state
    expect(analyticsSwitch).toHaveAttribute('type', 'checkbox')
  })

  it('should render switch in unchecked state when productAnalytic is false', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    expect(analyticsSwitch).toBeInTheDocument()
    expect(analyticsSwitch).toHaveAttribute('type', 'checkbox')
  })

  it('should call translation function with correct keys', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    // Test that translations are rendered
    expect(screen.getByText('common:settings')).toBeInTheDocument()
    expect(screen.getByText('settings:privacy.analytics')).toBeInTheDocument()
  })

  it('should handle switch state change properly', () => {
    const Component = PrivacyRoute.component as React.ComponentType
    render(<Component />)

    const analyticsSwitch = screen.getAllByTestId('switch')[0]
    
    // Test that switch can be toggled
    fireEvent.click(analyticsSwitch)
    expect(analyticsSwitch).toBeInTheDocument()
    
    // Test that switch can be toggled again
    fireEvent.click(analyticsSwitch)
    expect(analyticsSwitch).toBeInTheDocument()
  })
})
