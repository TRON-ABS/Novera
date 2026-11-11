import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { androidViewportEvent, useAndroidVisualViewport } from './useAndroidVisualViewport'

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

  // The Huawei WebView can report its full height with the keyboard open.
  vi.stubGlobal('__noveraAndroidVisibleHeight', 342)
  window.dispatchEvent(new Event(androidViewportEvent))
  expect(workspace.style.height).toBe('342px')
  expect(draft.value).toBe('Mon brouillon')

  vi.stubGlobal('__noveraAndroidVisibleHeight', 760)
  window.dispatchEvent(new Event(androidViewportEvent))
  expect(workspace.style.height).toBe('760px')
})
