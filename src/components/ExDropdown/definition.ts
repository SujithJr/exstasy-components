import type { ComputedRef, Ref } from 'vue'
import type { ListItemData } from './types'
import type { ContentStyleTypes } from '../../types'
import type { Focus } from '../../composables/useFocusManagement'

export type ExDropdownStateDefinition = {
    // activeItemIndex: Ref<number | null>,

    hoverDelay: ComputedRef<number | string>,
    openOnHover: ComputedRef<boolean>,

    transitionDuration: number | string,

    disableTransition: boolean,
    disableSearch: boolean,
    disabled: boolean,
    mode: string,

    searchQuery: Ref<string>,
    clearSearch(): void,

    parentRef: Ref<HTMLElement | null>,
    triggerRef: Ref<HTMLElement | null>,
    listItemRef: Ref<HTMLElement | null>,
    listRef: Ref<HTMLElement | null>,

    closeOnClick: boolean,
    closeOnListClick: boolean,

    parentId: string,
    triggerId: string,
    listId: string,
    labelId: string,

    contentStyles: Ref<ContentStyleTypes>,
    position(): { left: boolean, right: boolean },

    // items: Ref<RegisterItemType[]>,
    items: Ref<{ id: string, dataRef: ComputedRef<ListItemData> }[]>,
    activeItemIndex: Ref<number | null>,
    adjustListOrder(): void,
    registerItem(id: string, dataRef: ComputedRef<ListItemData>): void,
    deRegisterItems(id: string): void,
    search(text: string): void,
    goToItem(focus: Focus, id?: string): void,
    setActiveItem(id?: string): void,

    focusOnOpen: boolean,
    isOpen: Ref<boolean>,
    showContent: Ref<boolean>,
    showDropdownContent(): void,
    hideDropdownContent(): void,
    toggleDropdown(): void,
    openDropdown(): void,
    closeDropdown(): void,
    revaluateScreenEdges(): void,
}
