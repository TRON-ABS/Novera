export async function checkAutoTune() {
  const invoke = window.__TAURI_INTERNALS__?.invoke?.bind(window.__TAURI_INTERNALS__)
  if (!invoke) throw new Error('Native Tauri IPC is unavailable')
  const read = () => invoke('desktop_calibration')
  const initial = await read()
  if (typeof initial !== 'boolean') throw new Error('The native Auto Tune command did not report support')
  const waitFor = async (predicate, message) => {
    const deadline = Date.now() + 15000
    while (Date.now() < deadline) {
      const value = await predicate()
      if (value) return value
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error(message)
  }
  const button = await waitFor(
    () => document.querySelector('button[aria-label="Auto Tune"]:not([role="switch"])'),
    'The Auto Tune button did not render',
  )
  const dashboard = () => document.querySelector('[data-auto-tune-dashboard]')
  if (!dashboard()) button.click()
  const control = await waitFor(
    () => dashboard()?.querySelector('[role="switch"][aria-label="Auto Tune"]'),
    'The Auto Tune dashboard did not open',
  )
  try {
    control.click()
    await waitFor(async () => (await read()) === !initial && control.getAttribute('aria-checked') === String(!initial),
      'The Auto Tune toggle did not change native calibration state')
  } finally {
    if ((await read()) !== initial) {
      await invoke('desktop_calibration', { enabled: initial })
    }
  }
  if ((await read()) !== initial) throw new Error('The initial Auto Tune state was not restored')
  return { buttonRendered: true, dashboardOpened: true, nativeToggleVerified: true, initialStateRestored: true }
}
