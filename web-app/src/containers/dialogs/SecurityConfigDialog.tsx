import { useTranslation as useUiLocale } from '@/i18n/react-i18next-compat'
import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import {
  IconShield,
  IconKey,
  IconDevices,
  IconHistory,
  IconLoader2,
  IconCopy,
  IconCheck,
  IconTrash,
  IconRefresh,
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react'

// Types
type AuthMode = 'token' | 'password' | 'none'

interface SecurityStatus {
  auth_mode: AuthMode
  has_token: boolean
  has_password: boolean
  require_pairing: boolean
  approved_device_count: number
  recent_auth_failures: number
}

interface DeviceInfo {
  id: string
  name: string
  channel: string
  user_id: string
  approved_at: string
  last_access: string | null
}

interface AccessLogEntry {
  timestamp: string
  device_id: string | null
  channel: string
  user_id: string
  action: string
  ip_address: string | null
  success: boolean
  error: string | null
}

interface SecurityConfigDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

type TabType = 'auth' | 'devices' | 'logs'

export function SecurityConfigDialog({
  isOpen,
  onClose,
  onSave,
}: SecurityConfigDialogProps) {
  const { t: uiT } = useUiLocale()

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('auth')

  // Security status state
  const [status, setStatus] = useState<SecurityStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  // Auth settings state
  const [authMode, setAuthMode] = useState<AuthMode>('none')
  const [isChangingAuthMode, setIsChangingAuthMode] = useState(false)

  // Token state
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  // Password state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Device pairing state
  const [requirePairing, setRequirePairing] = useState(false)
  const [isTogglingPairing, setIsTogglingPairing] = useState(false)

  // Devices state
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null)

  // Logs state
  const [logs, setLogs] = useState<AccessLogEntry[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isClearingLogs, setIsClearingLogs] = useState(false)

  // Confirm dialogs state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'revoke' | 'clear_logs' | 'change_auth_mode' | null
    data?: unknown
  }>({ type: null })

  // Fetch security status
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const result = await invoke<SecurityStatus>('security_get_status')
      setStatus(result)
      setAuthMode(result.auth_mode)
      setRequirePairing(result.require_pairing)
    } catch {
      toast.error(uiT('ui:failedToLoadSecuritySettings'))
    } finally {
      setIsLoadingStatus(false)
    }
  }, [uiT])

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    setIsLoadingDevices(true)
    try {
      const result = await invoke<DeviceInfo[]>('security_get_devices')
      setDevices(result)
    } catch {
      toast.error(uiT('ui:failedToLoadDevices'))
    } finally {
      setIsLoadingDevices(false)
    }
  }, [uiT])

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true)
    try {
      const result = await invoke<AccessLogEntry[]>('security_get_logs', { limit: 100 })
      setLogs(result)
    } catch {
      toast.error(uiT('ui:failedToLoadAccessLogs'))
    } finally {
      setIsLoadingLogs(false)
    }
  }, [uiT])

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchStatus()
      setGeneratedToken(null)
      setPassword('')
      setConfirmPassword('')
      setShowToken(false)
      setShowPassword(false)
    }
  }, [isOpen, fetchStatus])

  // Load tab-specific data
  useEffect(() => {
    if (isOpen && activeTab === 'devices') {
      fetchDevices()
    } else if (isOpen && activeTab === 'logs') {
      fetchLogs()
    }
  }, [isOpen, activeTab, fetchDevices, fetchLogs])

  // Handle auth mode change
  const handleAuthModeChange = async (newMode: AuthMode) => {
    if (newMode === authMode) return

    // If changing away from current mode, confirm first
    if (authMode !== 'none' && newMode !== authMode) {
      setConfirmAction({ type: 'change_auth_mode', data: newMode })
      return
    }

    await changeAuthMode(newMode)
  }

  const changeAuthMode = async (newMode: AuthMode) => {
    setIsChangingAuthMode(true)
    try {
      await invoke('security_set_auth_mode', { mode: newMode })
      setAuthMode(newMode)
      setGeneratedToken(null)
      await fetchStatus()
      toast.success(uiT('ui:authenticationModeChangedToValue0', { value0: newMode }))
      onSave?.()
    } catch {
      toast.error(uiT('ui:failedToChangeAuthenticationMode'))
    } finally {
      setIsChangingAuthMode(false)
      setConfirmAction({ type: null })
    }
  }

  // Generate token
  const handleGenerateToken = async () => {
    setIsGeneratingToken(true)
    try {
      const token = await invoke<string>('security_generate_token')
      setGeneratedToken(token)
      setShowToken(true)
      await fetchStatus()
      toast.success(uiT('ui:newAccessTokenGenerated'))
      onSave?.()
    } catch {
      toast.error(uiT('ui:failedToGenerateToken'))
    } finally {
      setIsGeneratingToken(false)
    }
  }

  // Copy token to clipboard
  const handleCopyToken = async () => {
    if (!generatedToken) return
    try {
      await navigator.clipboard.writeText(generatedToken)
      setTokenCopied(true)
      toast.success(uiT('ui:tokenCopiedToClipboard'))
      setTimeout(() => setTokenCopied(false), 2000)
    } catch {
      toast.error(uiT('ui:failedToCopyToken'))
    }
  }

  // Set password
  const handleSetPassword = async () => {
    if (!password || password !== confirmPassword) {
      toast.error(uiT('ui:passwordsDoNotMatch'))
      return
    }

    if (password.length < 8) {
      toast.error(uiT('ui:passwordMustBeAtLeast8Characters'))
      return
    }

    setIsSettingPassword(true)
    try {
      await invoke('security_set_password', { password })
      setPassword('')
      setConfirmPassword('')
      await fetchStatus()
      toast.success(uiT('ui:passwordSetSuccessfully'))
      onSave?.()
    } catch {
      toast.error(uiT('ui:failedToSetPassword'))
    } finally {
      setIsSettingPassword(false)
    }
  }

  // Toggle pairing requirement
  const handleTogglePairing = async (enabled: boolean) => {
    setIsTogglingPairing(true)
    try {
      await invoke('security_set_require_pairing', { require: enabled })
      setRequirePairing(enabled)
      await fetchStatus()
      toast.success(
        enabled ? 'Device pairing required' : 'Device pairing disabled'
      )
      onSave?.()
    } catch {
      toast.error(uiT('ui:failedToUpdatePairingSetting'))
    } finally {
      setIsTogglingPairing(false)
    }
  }

  // Revoke device
  const handleRevokeDevice = async (deviceId: string) => {
    setRevokingDeviceId(deviceId)
    try {
      await invoke('security_revoke_device', { device_id: deviceId })
      await fetchDevices()
      await fetchStatus()
      toast.success(uiT('ui:deviceAccessRevoked'))
      onSave?.()
    } catch {
      toast.error(uiT('ui:failedToRevokeDeviceAccess'))
    } finally {
      setRevokingDeviceId(null)
      setConfirmAction({ type: null })
    }
  }

  // Clear logs
  const handleClearLogs = async () => {
    setIsClearingLogs(true)
    try {
      await invoke('security_clear_logs')
      setLogs([])
      toast.success(uiT('ui:accessLogsCleared'))
    } catch {
      toast.error(uiT('ui:failedToClearLogs'))
    } finally {
      setIsClearingLogs(false)
      setConfirmAction({ type: null })
    }
  }

  // Format date helper
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString()
    } catch {
      return dateStr
    }
  }

  // Mask token helper
  const maskToken = (token: string): string => {
    if (token.length <= 8) return '*'.repeat(token.length)
    return token.slice(0, 4) + '*'.repeat(token.length - 8) + token.slice(-4)
  }

  // Render tab buttons
  const renderTabs = () => (
    <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg mb-4">
      <button
        onClick={() => setActiveTab('auth')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center',
          activeTab === 'auth'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <IconKey size={16} />
        {uiT('settings:httpsProxy.authentication')}</button>
      <button
        onClick={() => setActiveTab('devices')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center',
          activeTab === 'devices'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <IconDevices size={16} />
        {uiT('ui:devices')}</button>
      <button
        onClick={() => setActiveTab('logs')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center',
          activeTab === 'logs'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <IconHistory size={16} />
        {uiT('ui:logs')}</button>
    </div>
  )

  // Render authentication tab
  const renderAuthTab = () => (
    <div className="space-y-6">
      {/* Current Status */}
      {status && (
        <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-foreground text-sm">{uiT('ui:currentStatus')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">{uiT('ui:authMode')}</span>
            <span className="text-foreground capitalize">{uiT(status.auth_mode === 'password' ? 'settings:httpsProxy.password' : status.auth_mode === 'token' ? 'ui:token' : 'ui:none')}</span>
            <span className="text-muted-foreground">{uiT('ui:hasToken')}</span>
            <span className="text-foreground">{status.has_token ? uiT('ui:yes') : uiT('ui:no')}</span>
            <span className="text-muted-foreground">{uiT('ui:hasPassword')}</span>
            <span className="text-foreground">{status.has_password ? uiT('ui:yes') : uiT('ui:no')}</span>
            {status.recent_auth_failures > 0 && (
              <>
                <span className="text-muted-foreground">{uiT('ui:recentFailures')}</span>
                <span className="text-destructive">{status.recent_auth_failures}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Mode Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {uiT('ui:authenticationMode')}</label>
        <RadioGroup
          value={authMode}
          onValueChange={(value) => handleAuthModeChange(value as AuthMode)}
          className="space-y-2"
          disabled={isChangingAuthMode}
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
            <RadioGroupItem value="token" id="auth-token" />
            <label htmlFor="auth-token" className="flex-1 cursor-pointer">
              <span className="font-medium text-foreground">{uiT('ui:token')}</span>
              <p className="text-sm text-muted-foreground">
                {uiT('ui:requireASecretTokenForApiAccess')}</p>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
            <RadioGroupItem value="password" id="auth-password" />
            <label htmlFor="auth-password" className="flex-1 cursor-pointer">
              <span className="font-medium text-foreground">{uiT('settings:httpsProxy.password')}</span>
              <p className="text-sm text-muted-foreground">
                {uiT('ui:requireAPasswordForAccess')}</p>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
            <RadioGroupItem value="none" id="auth-none" />
            <label htmlFor="auth-none" className="flex-1 cursor-pointer">
              <span className="font-medium text-foreground">{uiT('ui:none')}</span>
              <p className="text-sm text-muted-foreground">
                {uiT('ui:noAuthenticationRequiredNotRecommended')}</p>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Token Section */}
      {authMode === 'token' && (
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <h4 className="font-medium text-foreground">{uiT('ui:accessToken')}</h4>

          {generatedToken ? (
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-foreground break-all">
                    {showToken ? generatedToken : maskToken(generatedToken)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopyToken}
                  >
                    {tokenCopied ? (
                      <IconCheck size={16} className="text-green-500" />
                    ) : (
                      <IconCopy size={16} />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-amber-500 text-sm">
                <IconAlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  {uiT('ui:saveThisTokenNowItCannotBeRetrieved')}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {status?.has_token
                ? uiT('ui:aTokenIsAlreadyConfiguredGenerateANew')
                : uiT('ui:noTokenConfiguredGenerateOneToEnableToken')}
            </p>
          )}

          <Button
            onClick={handleGenerateToken}
            disabled={isGeneratingToken}
            variant="outline"
            size="sm"
          >
            {isGeneratingToken ? (
              <>
                <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                {uiT('ui:generating')}</>
            ) : (
              <>
                <IconKey className="mr-2 h-4 w-4" />
                {uiT('ui:generateNewToken')}</>
            )}
          </Button>
        </div>
      )}

      {/* Password Section */}
      {authMode === 'password' && (
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <h4 className="font-medium text-foreground">{uiT('ui:setPassword')}</h4>
          <p className="text-sm text-muted-foreground">
            {status?.has_password
              ? uiT('ui:enterANewPasswordToReplaceTheExisting')
              : uiT('ui:setAPasswordToEnablePasswordAuthentication')}
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={uiT('ui:enterPassword')}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </Button>
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={uiT('ui:confirmPassword')}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">{uiT('ui:passwordsDoNotMatch')}</p>
            )}
            {password && password.length < 8 && (
              <p className="text-sm text-amber-500">
                {uiT('ui:passwordMustBeAtLeast8Characters')}</p>
            )}
          </div>

          <Button
            onClick={handleSetPassword}
            disabled={
              isSettingPassword ||
              !password ||
              password !== confirmPassword ||
              password.length < 8
            }
            size="sm"
          >
            {isSettingPassword ? (
              <>
                <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                {uiT('ui:setting')}</>
            ) : (
              'Set Password'
            )}
          </Button>
        </div>
      )}
    </div>
  )

  // Render devices tab
  const renderDevicesTab = () => (
    <div className="space-y-4">
      {/* Pairing Toggle */}
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="space-y-1">
          <h4 className="font-medium text-foreground">{uiT('ui:requireDevicePairing')}</h4>
          <p className="text-sm text-muted-foreground">
            {uiT('ui:devicesMustBeApprovedBeforeTheyCanAccess')}</p>
        </div>
        <Switch
          checked={requirePairing}
          onCheckedChange={handleTogglePairing}
          loading={isTogglingPairing}
          disabled={isTogglingPairing}
        />
      </div>

      {/* Approved Devices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">{uiT('ui:approvedDevices')}</h4>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchDevices}
            disabled={isLoadingDevices}
          >
            <IconRefresh
              size={16}
              className={cn(isLoadingDevices && 'animate-spin')}
            />
          </Button>
        </div>

        {isLoadingDevices ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <IconDevices size={32} className="mx-auto mb-2 opacity-50" />
            <p>{uiT('ui:noApprovedDevices')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {device.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {device.channel}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{uiT('ui:user')}{' '}{device.user_id}</span>
                    <span className="mx-2">|</span>
                    <span>{uiT('ui:approved')}{' '}{formatDate(device.approved_at)}</span>
                    {device.last_access && (
                      <>
                        <span className="mx-2">|</span>
                        <span>{uiT('ui:last')}{' '}{formatDate(device.last_access)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setConfirmAction({ type: 'revoke', data: device.id })
                  }
                  disabled={revokingDeviceId === device.id}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  {revokingDeviceId === device.id ? (
                    <IconLoader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <IconTrash size={16} />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Render logs tab
  const renderLogsTab = () => (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{uiT('ui:recentAccessLogs')}</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchLogs}
            disabled={isLoadingLogs}
          >
            <IconRefresh
              size={16}
              className={cn(isLoadingLogs && 'animate-spin')}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmAction({ type: 'clear_logs' })}
            disabled={isClearingLogs || logs.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <IconTrash size={16} className="mr-1" />
            {uiT('common:clearRecent')}</Button>
        </div>
      </div>

      {/* Logs list */}
      {isLoadingLogs ? (
        <div className="flex items-center justify-center py-8">
          <IconLoader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <IconHistory size={32} className="mx-auto mb-2 opacity-50" />
          <p>{uiT('ui:noAccessLogs')}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                'p-3 rounded-lg text-sm',
                log.success ? 'bg-secondary/30' : 'bg-destructive/10'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      log.success ? 'bg-green-500' : 'bg-red-500'
                    )}
                  />
                  <span className="font-medium text-foreground">
                    {log.action}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {log.channel}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <div className="text-muted-foreground text-xs space-x-3">
                <span>{uiT('ui:user')}{' '}{log.user_id}</span>
                {log.ip_address && <span>IP: {log.ip_address}</span>}
                {log.device_id && <span>{uiT('ui:device')}{' '}{log.device_id}</span>}
              </div>
              {log.error && (
                <p className="text-destructive text-xs mt-1">{log.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render confirm dialog
  const renderConfirmDialog = () => {
    if (!confirmAction.type) return null

    let title = ''
    let description = ''
    let confirmText = ''
    let onConfirm = () => {}

    switch (confirmAction.type) {
      case 'revoke':
        title = uiT('ui:revokeDeviceAccess')
        description =
          uiT('ui:areYouSureYouWantToRevokeAccess')
        confirmText = uiT('ui:revoke')
        onConfirm = () => handleRevokeDevice(confirmAction.data as string)
        break
      case 'clear_logs':
        title = uiT('ui:clearAccessLogs')
        description =
          uiT('ui:areYouSureYouWantToClearAll')
        confirmText = uiT('ui:clearLogs')
        onConfirm = handleClearLogs
        break
      case 'change_auth_mode':
        title = uiT('ui:changeAuthenticationMode')
        description =
          uiT('ui:changingTheAuthenticationModeWillAffectHowClients')
        confirmText = uiT('ui:change')
        onConfirm = () => changeAuthMode(confirmAction.data as AuthMode)
        break
    }

    return (
      <Dialog
        open={!!confirmAction.type}
        onOpenChange={() => setConfirmAction({ type: null })}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ type: null })}
            >
              {uiT('common:cancel')}</Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[560px] max-w-[90vw] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <IconShield size={24} className="text-primary" />
              <DialogTitle>{uiT('ui:securitySettings')}</DialogTitle>
            </div>
            <DialogDescription>
              {uiT('ui:configureAuthenticationDeviceManagementAndViewAccessLogs')}</DialogDescription>
          </DialogHeader>

          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {renderTabs()}
              {activeTab === 'auth' && renderAuthTab()}
              {activeTab === 'devices' && renderDevicesTab()}
              {activeTab === 'logs' && renderLogsTab()}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {uiT('common:close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderConfirmDialog()}
    </>
  )
}

export default SecurityConfigDialog
