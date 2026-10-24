/** Decorative emoji; the surrounding button supplies its translated label. */
export function ComposerIcon({
  children,
}: {
  children: string
}) {
  return (
    <span aria-hidden="true" className="composer-emoji">
      {children}
    </span>
  )
}
