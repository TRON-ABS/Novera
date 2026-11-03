import { act,fireEvent,render,screen,waitFor } from '@testing-library/react'
import { beforeEach,expect,it,vi } from 'vitest'
const h=vi.hoisted(()=>({write:vi.fn(),error:vi.fn()}))
vi.mock('@/lib/clipboard',()=>({writeClipboardText:h.write}))
vi.mock('sonner',()=>({toast:{error:h.error}}))
vi.mock('@/i18n/react-i18next-compat',()=>({useTranslation:()=>({t:(s:string)=>s})}))
import { CopyButton } from '../CopyButton'
beforeEach(()=>{h.write.mockReset();h.error.mockReset()})
it('waits for the clipboard confirmation before showing copied',async()=>{
  let finish!:()=>void
  h.write.mockReturnValueOnce(new Promise<void>(resolve=>{finish=resolve}))
  render(<CopyButton text="Texte" />)
  fireEvent.click(screen.getByRole('button',{name:'common:copy'}))
  expect(screen.queryByRole('button',{name:'common:copied'})).not.toBeInTheDocument()
  await act(async()=>finish())
  expect(screen.getByRole('button',{name:'common:copied'})).toBeInTheDocument()
})
it('keeps copy available and reports an unsuccessful write',async()=>{
  h.write.mockRejectedValueOnce(new Error('CLIPBOARD_UNAVAILABLE'))
  render(<CopyButton text="Texte" />)
  fireEvent.click(screen.getByRole('button',{name:'common:copy'}))
  await waitFor(()=>expect(h.error).toHaveBeenCalledWith('common:error'))
  expect(screen.queryByRole('button',{name:'common:copied'})).not.toBeInTheDocument()
})
