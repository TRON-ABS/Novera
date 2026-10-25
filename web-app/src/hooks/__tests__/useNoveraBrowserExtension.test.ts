import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock useMCPServers
const mockEditServer = vi.fn()
const mockSyncServers = vi.fn().mockResolvedValue(undefined)
let mockMcpServers: Record<string, any> = {}

vi.mock('@/hooks/useMCPServers', () => ({
  useMCPServers: () => ({
    mcpServers: mockMcpServers,
    editServer: mockEditServer,
    syncServers: mockSyncServers,
  }),
}))

// Mock the dialog type
vi.mock('@/containers/dialogs/NoveraBrowserExtensionDialog', () => ({}))

describe('useNoveraBrowserExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMcpServers = {}
  })

  it('should return correct initial state when no config exists', async () => {
    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    expect(result.current.hasConfig).toBe(false)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.dialogOpen).toBe(false)
    expect(result.current.dialogState).toBe('closed')
    expect(typeof result.current.toggleBrowser).toBe('function')
    expect(typeof result.current.handleCancel).toBe('function')
    expect(typeof result.current.setDialogOpen).toBe('function')
  })

  it('should detect config when Jan Browser MCP exists', async () => {
    mockMcpServers = {
      'Jan Browser MCP': { command: 'node', args: [], env: {}, active: false },
    }

    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    expect(result.current.hasConfig).toBe(true)
    expect(result.current.isActive).toBe(false)
  })

  it('should detect active state', async () => {
    mockMcpServers = {
      'Jan Browser MCP': { command: 'node', args: [], env: {}, active: true },
    }

    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    expect(result.current.isActive).toBe(true)
  })

  it('should show error toast when toggling without config', async () => {
    const { toast } = await import('sonner')
    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    await act(async () => {
      await result.current.toggleBrowser()
    })

    expect(toast.error).toHaveBeenCalledWith('Jan Browser MCP not found', expect.any(Object))
  })

  it('should handle cancel', async () => {
    mockMcpServers = {
      'Jan Browser MCP': { command: 'node', args: [], env: {}, active: true },
    }

    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    act(() => {
      result.current.handleCancel()
    })

    expect(result.current.dialogOpen).toBe(false)
    expect(result.current.dialogState).toBe('closed')
    expect(mockEditServer).toHaveBeenCalledWith('Jan Browser MCP', expect.objectContaining({ active: false }))
  })

  it('should allow setting dialog open state', async () => {
    const { useNoveraBrowserExtension } = await import('../useNoveraBrowserExtension')
    const { result } = renderHook(() => useNoveraBrowserExtension())

    act(() => {
      result.current.setDialogOpen(true)
    })

    expect(result.current.dialogOpen).toBe(true)
  })
})
