export type Orientation = 'vertical' | 'horizontal'

export interface KeyboardReorderOptions {
  length: () => number
  move: (from: number, to: number) => boolean
  orientation?: () => Orientation
  announce?: (message: string) => void
}

const TRANSLATIONS: Record<Orientation, { back: string; forward: string }> = {
  vertical: { back: 'ArrowUp', forward: 'ArrowDown' },
  horizontal: { back: 'ArrowLeft', forward: 'ArrowRight' },
}

/**
 * Builds a `keydown` handler that reorders a row by one step with the axis
 * arrows and by a jump with Home/End. Unhandled keys fall through to the
 * consumer so typing inside a row keeps working.
 */
export function createKeyboardReorder(options: KeyboardReorderOptions) {
  return function onKeydown(event: KeyboardEvent, index: number) {
    if (event.altKey || event.metaKey) return
    const keys = TRANSLATIONS[options.orientation?.() ?? 'vertical']
    const last = options.length() - 1

    let target: number
    if (event.key === keys.back) target = index - 1
    else if (event.key === keys.forward) target = index + 1
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = last
    else return

    target = Math.min(Math.max(target, 0), last)
    if (target === index) return

    event.preventDefault()
    if (!options.move(index, target)) return
    options.announce?.(`Moved to position ${target + 1} of ${last + 1}`)
  }
}
