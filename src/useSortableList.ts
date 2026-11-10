import { computed, ref, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ItemKey } from './types'

/** Positions involved in a committed reorder. */
export interface Reorder {
  from: number
  to: number
}

export interface SortableListOptions<T> {
  /** Source rows. Read once at setup; the list owns the order afterwards. */
  items: MaybeRefOrGetter<T[]>
  /** Stable identity per row. Defaults to the row itself for scalar lists. */
  key?: (item: T) => ItemKey
  /** Called after an order is committed. */
  onReorder?: (next: T[], move: Reorder) => void
  /** Ignores pointer input without unmounting the list. */
  disabled?: MaybeRefOrGetter<boolean>
}

/**
 * Headless sortable state. Markup stays yours and the composable keeps the
 * order, so lists can be rendered as `ul`, `ol`, a grid of divs, or anything
 * else that satisfies the consumer.
 */
export function useSortableList<T>(options: SortableListOptions<T>) {
  const rows = shallowRef([...toValue(options.items)])
  const snapshot = [...toValue(options.items)]
  const fromIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)

  const keyOf = options.key ?? ((item: T) => item as unknown as ItemKey)
  const disabled = () => (options.disabled === undefined ? false : toValue(options.disabled))
  const isDragging = computed(() => fromIndex.value !== null)

  const draggingKey = computed<ItemKey | null>(() => {
    const index = fromIndex.value
    const item = index === null ? undefined : rows.value[index]
    return item === undefined ? null : keyOf(item)
  })

  function move(from: number, to: number): boolean {
    const last = rows.value.length - 1
    if (disabled() || from === to || from < 0 || from > last || to < 0 || to > last) return false
    const next = rows.value.slice()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    rows.value = next
    options.onReorder?.(next, { from, to })
    return true
  }

  function begin(index: number) {
    if (disabled()) return
    fromIndex.value = index
    overIndex.value = index
  }

  function over(index: number) {
    if (fromIndex.value !== null) overIndex.value = index
  }

  function end() {
    const from = fromIndex.value
    const to = overIndex.value
    fromIndex.value = null
    overIndex.value = null
    if (from !== null && to !== null) move(from, to)
  }

  function cancel() {
    fromIndex.value = null
    overIndex.value = null
  }

  function reset() {
    rows.value = [...snapshot]
    cancel()
  }

  const containerProps = computed(() => ({
    role: 'list',
    'aria-busy': isDragging.value,
  }))

  function itemProps(index: number) {
    return {
      role: 'listitem',
      tabindex: 0,
      'data-key': keyOf(rows.value[index] as T),
      'aria-grabbed': fromIndex.value === index,
      'aria-posinset': index + 1,
      'aria-setsize': rows.value.length,
      onPointerdown: (event: PointerEvent) => {
        event.preventDefault()
        begin(index)
      },
      onPointerenter: () => over(index),
      onPointerup: end,
      onPointercancel: cancel,
    }
  }

  return {
    rows,
    isDragging,
    draggingKey,
    overIndex,
    containerProps,
    itemProps,
    move,
    begin,
    over,
    end,
    cancel,
    reset,
  }
}
