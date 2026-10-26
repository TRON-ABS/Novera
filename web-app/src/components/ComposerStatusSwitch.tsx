/** Visual state indicator inside a button; the parent supplies interaction/ARIA. */
export function ComposerStatusSwitch({ active }: { active: boolean }) {
  return <span className="composer-switch" data-active={active} aria-hidden="true"><span /></span>
}
