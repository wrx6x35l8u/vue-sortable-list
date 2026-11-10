let region: HTMLElement | null = null
let frame = 0

/**
 * Bootstraps a single visually hidden polite live region for the page and
 * writes `text` into it. Repeated identical messages are re-announced by
 * clearing the node for one frame first.
 */
export function announce(text: string): void {
  if (typeof document === 'undefined') return
  region ??= createRegion()
  region.textContent = ''
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    if (region) region.textContent = text
  })
}

function createRegion(): HTMLElement {
  const node = document.createElement('p')
  node.setAttribute('role', 'status')
  node.setAttribute('aria-live', 'polite')
  node.style.cssText =
    'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;' +
    'clip-path:inset(50%);white-space:nowrap;border:0'
  document.body.append(node)
  return node
}
