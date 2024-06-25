import type { ContentStyleTypes } from '../../types'
import type { ComputedRef, Ref } from 'vue'
import type { ListItemData } from './types'
import type { Focus } from '../../composables/useFocusManagement'

export type ExAutocompleteStateDefinition = {
    transitionDuration: number | string,
    disableTransition: boolean,
    mode: string,

    initialValue: ComputedRef<string | number | boolean | Record<string, any> | unknown[] | undefined>,
    isMultiple: ComputedRef<boolean>,
    isClearable: ComputedRef<boolean>,
    matchByKey: ComputedRef<unknown>,

    parentRef: Ref<HTMLElement | null>,
    inputRef: Ref<HTMLElement | null>,
    listRef: Ref<HTMLElement | null>,

    closeOnClick: boolean,

    parentId: string,
    triggerId: string,
    listId: string,
    labelId: string,

    contentStyles: Ref<ContentStyleTypes>,
    position(): { left: boolean, right: boolean },
    updateInitialValue(value: any): void
    clearInitialValue(): void

    activeItemIndex: Ref<number | null>,
    items: Ref<{ id: string, dataRef: ComputedRef<ListItemData> }[]>,
    adjustListOrder(): void,
    registerItem(id: string, dataRef: ComputedRef<ListItemData>): void,
    deRegisterItems(id: string): void,
    goToItem(focus: Focus, id?: string): void,
    selectItem(id: string): void,
    removeItem(value: any): void,
    compare(a: any, b: any): any,

    isOpen: Ref<boolean>,
    showContent: Ref<boolean>,
    toggleDropdown(): void,
    openDropdown(): void,
    closeDropdown(): void,
    revaluateScreenEdges(): void,
}
