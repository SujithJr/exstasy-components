import type { Ref } from 'vue'

export type RegisterItemType = {
    item: HTMLElement | null,
    id: string,
    text: string
}

//
export type ListItemData = {
    disabled: boolean,
    domRef: Ref<HTMLElement | null>,
    readonly textValue: string
}
