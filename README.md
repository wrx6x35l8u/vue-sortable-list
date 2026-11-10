# vue-sortable-list

Headless drag-and-drop ordering for Vue 3 lists. The composable owns the order and
the ARIA wiring; the markup is yours. It makes no assumptions about rows being
`<li>` elements, so the same state drives a task list, a kanban column, or a grid of
upload tiles.

## Why

Sortable libraries usually ship their own DOM, styling hooks, and event model. This
one ships state: `v-bind` the props you get, render whatever you already render, and
receive the committed order through a single callback. Nothing is mounted, nothing is
styled, and the drag logic stays in one place instead of leaking into components.

## Install

```sh
npm install vue-sortable-list
```

Requires Vue 3.5 or newer. The package ships TypeScript sources for bundlers that
compile them; there is no prebuilt `dist`.

## Usage

```vue
<script setup lang="ts">
import { useSortableList } from 'vue-sortable-list'

interface Task {
  id: string
  title: string
}

const props = defineProps<{ tasks: Task[] }>()
const emit = defineEmits<{ reorder: [next: Task[]] }>()

const { rows, itemProps, containerProps, draggingKey } = useSortableList({
  items: () => props.tasks,
  key: (task) => task.id,
  onReorder: (next) => emit('reorder', next),
})
</script>

<template>
  <ul v-bind="containerProps" class="tasks">
    <li
      v-for="(task, index) in rows"
      :key="task.id"
      v-bind="itemProps(index)"
      :class="{ 'is-dragging': draggingKey === task.id }"
    >
      <slot name="row" :task="task" :index="index" />
    </li>
  </ul>
</template>
```

`end` is bound per row and fires on whichever row sits under the pointer when the
button is released, so bind the whole `itemProps(index)` instead of picking handlers.
Releasing outside the list is handled on the next press; see the open issue.

### Options

| Option      | Type                                     | Notes                                                     |
| ----------- | ---------------------------------------- | --------------------------------------------------------- |
| `items`     | `MaybeRefOrGetter<T[]>`                  | Read once at setup; `reset()` restores the initial order.   |
| `key`       | `(item: T) => string \| number`          | Stable identity. Defaults to the item for scalar lists.    |
| `onReorder` | `(next: T[], move: {from, to}) => void`  | Called once per committed move, never per pointer move.    |
| `disabled`  | `MaybeRefOrGetter<boolean>`              | Blocks input without unmounting the list.                  |

### Returned API

`rows` (reactive order), `itemProps(index)`, `containerProps`, `isDragging`,
`draggingKey`, `overIndex`, plus the primitives `begin`, `over`, `end`, `cancel`,
`move(from, to)` and `reset()`. `move` returns `false` when the move is a no-op or
out of bounds.

### Slots

The composable is not a component, so the demo above defines the slot shape it
expects: a single `row` slot with `{ task, index }`. A handle can call `begin(index)`
and stop propagation of `pointerdown` to drag from the handle only.

## Layout

```
src/
  types.ts            row identity type
  useSortableList.ts  order state, pointer handlers, ARIA props
  index.ts            public entry
```

## Status

Pointer reordering works today. Keyboard reordering is the next step; until it
lands, rows are focusable but only pointer input moves them.

## License

MIT
