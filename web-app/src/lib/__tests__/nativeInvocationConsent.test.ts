import { beforeEach, expect, it, vi } from 'vitest'
const { executeTool, dataFolder } = vi.hoisted(() => ({ executeTool: vi.fn(), dataFolder: vi.fn() }))
vi.mock('@janhq/tauri-plugin-agent-tools-api', () => ({ executeTool }))
vi.mock('@/hooks/useServiceHub', () => ({ getServiceHub: () => ({ app: () => ({ getJanDataFolder: dataFolder }) }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
import { executeAgentTool } from '../agentTools'
import { useNativeAccess } from '@/hooks/useNativeAccess'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
beforeEach(() => {
  executeTool.mockReset().mockResolvedValue({ content: 'ok', isError: false })
  dataFolder.mockReset().mockResolvedValue('C:/data')
  useNativeAccess.setState({ pending: [], grants: {}, generation: {} })
  useCoworkSessions.setState({ sessions: [], currentId: null })
})
it('does not invoke the native shell before consent and forwards readonly protection after approval', async () => {
  const id = useCoworkSessions.getState().createSession()
  useCoworkSessions.getState().setFolder(id, 'C:/project', 'read')
  const result = executeAgentTool('shell', { command: 'echo hello' }, id, 'C:/project', 'session', false, true)
  await vi.waitFor(() => expect(useNativeAccess.getState().pending).toHaveLength(1))
  expect(executeTool).not.toHaveBeenCalled()
  useNativeAccess.getState().resolve(useNativeAccess.getState().pending[0].id, 'allow-once')
  expect(await result).toEqual({ content: 'ok' })
  expect(executeTool.mock.calls[0][7]).toBe('C:/project')
  expect(executeTool.mock.calls[0][8]).toBe(false)
})
it('never invokes the native shell when denied', async () => {
  const result = executeAgentTool('shell', { command: 'echo hello' }, 'chat')
  await vi.waitFor(() => expect(useNativeAccess.getState().pending).toHaveLength(1))
  useNativeAccess.getState().resolve(useNativeAccess.getState().pending[0].id, 'deny')
  expect((await result).error).toContain('denied')
  expect(executeTool).not.toHaveBeenCalled()
})
it('does not resurrect a stopped request while the data path is loading', async () => {
  let ready!: (path: string) => void
  dataFolder.mockImplementationOnce(() => new Promise<string>((resolve) => { ready = resolve }))
  const result = executeAgentTool('shell', {}, 'chat')
  useNativeAccess.getState().cancel('chat')
  ready('C:/data')
  expect((await result).error).toContain('cancelled')
  expect(useNativeAccess.getState().pending).toHaveLength(0)
  expect(executeTool).not.toHaveBeenCalled()
})
