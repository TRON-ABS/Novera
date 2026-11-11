import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useAndroidVisualViewport } from './useAndroidVisualViewport'

afterEach(() => vi.unstubAllGlobals())

it('fits the Android workspace to the keyboard viewport without replacing the draft', () => {
  vi.stubGlobal('IS_ANDROID', true)
  const viewport = Object.assign(new EventTarget(), { height: 760, scale: 1 })
  vi.stubGlobal('visualViewport', viewport)
  function Workspace() {
    const ref = useAndroidVisualViewport()
    return <div ref={ref} data-testid="workspace"><textarea defaultValue="Mon brouillon" /></div>
  }

  render(<Workspace />)
  const workspace = screen.getByTestId('workspace')
  const draft = screen.getByRole<HTMLTextAreaElement>('textbox')
  expect(workspace.style.height).toBe('760px')

  viewport.height = 380
  viewport.dispatchEvent(new Event('resize'))
  expect(workspace.style.height).toBe('380px')
  expect(draft.value).toBe('Mon brouillon')

  viewport.height = 760
  viewport.dispatchEvent(new Event('resize'))
  expect(workspace.style.height).toBe('760px')
})
