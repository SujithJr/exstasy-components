import type { Ref } from 'vue'

export type ListItemData = {
    disabled: boolean,
    domRef: Ref<HTMLElement | null>,
    value: unknown
}
