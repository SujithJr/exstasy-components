import { defineComponent, ref, provide, watch, computed, nextTick, type UnwrapNestedRefs, type StyleValue, type SlotsType, toRef, type Ref, unref } from 'vue'
import { dom } from '../../utils/dom'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { nextFrame } from '../../utils/creator'
import { MI_PORTAL_ID, mergeIds, toRawId } from '../../utils/states-ids'
import { convertUnit } from '../../utils/convertUnit'
import { useStates } from '../../composables/useStates'
import { useRecording } from '../../composables/useRecording'
import { ExDropdownContext } from '../../utils/injection-keys'
import { useOutsideClick } from '../../composables/useOutsideClick'
import { useEdgeDetection } from './composables/useEdgeDetection'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { calculateActiveIndex, Focus } from '../../composables/useFocusManagement'
import { useDocumentEvent } from '../../composables/useDocumentEvent'

import type { ListItemData } from './types'
import type { ContentStyleTypes } from '../../types'
import type { ExDropdownStateDefinition } from './definition'

interface ExDropdownSlotProps {
    default: (props: {
        open(): void,
        close(): void,
        isOpen: boolean,
        labelAttrs: {
            id: string,
            for: string
        },
    }) => any
}

export const ExDropdown = defineComponent({
    name: 'ExDropdown',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'template' },
        left: { type: Boolean, default: false },
        right: { type: Boolean, default: false },
        mode: { type: String, default: 'fade' },
        disabled: { type: Boolean, default: false },
        focusOnOpen: { type: Boolean, default: false },
        closeOnClick: { type: Boolean, default: true },
        closeOnListClick: { type: Boolean, default: true },
        disableSearch: { type: Boolean, default: false },
        disableTransition: { type: Boolean, default: false },
        transitionDuration: { type: [Number, String], default: 150 },

        // TODO: Support v-model for dropdown state
        // modelValue: { type: Boolean, default: undefined },

        // TODO: Support open on hover
        openOnHover: { type: Boolean, default: false },
        hoverDelay: { type: [Number, String], default: 100 },
    },
    emits: {
        toggle: (_state: boolean) => true,
        // TODO: Support v-model for dropdown state

        // 'update:modelValue': (_openState: boolean) => true
    },
    slots: Object as SlotsType<ExDropdownSlotProps>,
    setup: (props, ctx) => {
        const { addState, removeState } = useStates()
        const { addRecord, getRecord } = useRecording()

        const showContent = ref<ExDropdownStateDefinition['showContent']['value']>(false)
        const isOpen = ref<ExDropdownStateDefinition['isOpen']['value']>(false)
        const parentRef = ref<ExDropdownStateDefinition['parentRef']['value']>(null)
        const triggerRef = ref<ExDropdownStateDefinition['triggerRef']['value']>(null)
        const listRef = ref<ExDropdownStateDefinition['listRef']['value']>(null)
        const listItemRef = ref<ExDropdownStateDefinition['listItemRef']['value']>(null)
        const items = ref<ExDropdownStateDefinition['items']['value']>([])
        const activeItemIndex = ref<ExDropdownStateDefinition['activeItemIndex']['value']>(null)
        const contentStyles = ref<ContentStyleTypes>({ left: 0, top: 0, minWidth: 'auto', maxWidth: 'auto' })
        const searchQuery = ref<ExDropdownStateDefinition['searchQuery']['value']>('')

        const openOnHover = computed(() => props.openOnHover)
        const hoverDelay = computed(() => props.hoverDelay)

        const fnCalculateActiveIndex = (
            modifiedItems: (items: UnwrapNestedRefs<ExDropdownStateDefinition['items']['value']>) =>
                UnwrapNestedRefs<ExDropdownStateDefinition['items']['value']> = (i) => i,
        ) => {
            const currentActiveItem = activeItemIndex.value !== null ? items.value[activeItemIndex.value] : null
            const filteredItems = modifiedItems(items.value.slice())
            let currentActiveIndex = currentActiveItem ? filteredItems.indexOf(currentActiveItem) : null

            if (currentActiveIndex === -1) {
                currentActiveIndex = null
            }

            return { items: filteredItems, activeItemIndex: currentActiveIndex }
        }

        const api = {
            isOpen,
            showContent,
            searchQuery,
            focusOnOpen: props.focusOnOpen,
            disabled: props.disabled,

            hoverDelay,
            openOnHover,

            closeOnClick: props.closeOnClick,
            closeOnListClick: props.closeOnListClick,
            disableSearch: props.disableSearch,

            parentRef,
            triggerRef,
            listRef,
            listItemRef,

            contentStyles,
            mode: props.mode,

            transitionDuration: props.transitionDuration,
            disableTransition: props.disableTransition,

            parentId: `mi-dropdown-${useId()}`,
            triggerId: `mi-dropdown-trigger-${useId()}`,
            listId: `mi-dropdown-list-${useId()}`,
            labelId: `mi-dropdown-label-${useId()}`,

            items,
            activeItemIndex,

            adjustListOrder: () => {
                api.items.value = api.items.value.slice().sort((aItem, zItem) => {
                    const a = dom(aItem.dataRef.domRef)
                    const z = dom(zItem.dataRef.domRef)

                    if (a === null || z === null) return 0

                    const position = a.compareDocumentPosition(z)

                    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
                    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
                    return 0
                })
            },

            registerItem: (id: string, dataRef: ListItemData) => {
                if (items.value.length === 0) {
                    items.value.push({ id, dataRef })
                    // activeItemIndex.value = 0
                    return
                }

                const itemIndeCalculated = fnCalculateActiveIndex((items) => {
                    return [...items, { id, dataRef }]
                })

                items.value = itemIndeCalculated.items
                nextFrame(() => {
                    api.adjustListOrder()
                    activeItemIndex.value = itemIndeCalculated.activeItemIndex === -1 ? null : itemIndeCalculated.activeItemIndex
                })
            },
            deRegisterItems: (id: string) => {
                const itemIndeCalculated = fnCalculateActiveIndex((items) => {
                    const index = items.findIndex(i => i.id === id)
                    if (index !== -1) items.splice(index, 1)
                    return items
                })

                items.value = itemIndeCalculated.items
                api.adjustListOrder()
                activeItemIndex.value = itemIndeCalculated.activeItemIndex === -1 ? null : itemIndeCalculated.activeItemIndex
            },
            search: (text: string) => {
                if (props.disableSearch) return

                const wasAlreadySearching = searchQuery.value.trim() !== ''
                const offset = wasAlreadySearching ? 0 : 1
                searchQuery.value += text.toLowerCase()

                const reOrderedItems = activeItemIndex.value !== null
                    ? api.items.value
                        .slice(activeItemIndex.value + offset)
                        .concat(items.value.slice(0, activeItemIndex.value + offset))
                    : items.value

                const matchingItem = reOrderedItems.find(item => {
                    return item.dataRef.textValue.toLowerCase().trim()
                        .startsWith(searchQuery.value.trim().toLowerCase())
                })

                const matchedIndex = api.items.value.indexOf(matchingItem as { id: string; dataRef: ListItemData; })
                if (matchedIndex === -1 || matchedIndex === api.activeItemIndex.value) return

                api.activeItemIndex.value = matchedIndex
                api.adjustListOrder()
                nextTick(() => api.goToItem(Focus.Specific, api.items.value[matchedIndex].id))
            },
            clearSearch: () => {
                searchQuery.value = ''
            },
            goToItem: (focus: Focus, id?: string) => {
                const activeIndex = calculateActiveIndex(
                    focus === Focus.Specific
                        ? { focus: Focus.Specific, id: id! }
                        : { focus: focus as Exclude<Focus, Focus.Specific> },
                    {
                        resolveActiveIndex: () => activeItemIndex.value,
                        resolveItems: () => {
                            api.adjustListOrder()
                            return api.items.value
                        },
                        resolveId: (item) => item.id,
                    })

                activeItemIndex.value = activeIndex
                if (activeIndex !== null && activeIndex !== -1) {
                    nextTick(() => {
                        // items.value[activeIndex].dataRef.domRef.value?.focus()
                        items.value[activeIndex].dataRef.domRef.value?.scrollIntoView({ block: 'nearest' })
                    })
                }
            },
            position: () => {
                const args = { left: props.left, right: props.right }
                if (!props.left && !props.right) return { ...args, left: true }

                return { left: props.left, right: props.right }
            },
            toggleDropdown: () => {
                if (api.disabled) return
                isOpen.value ? api.closeDropdown() : api.openDropdown()
            },
            openDropdown: () => {
                if (api.disabled) return

                isOpen.value = true
                api.showDropdownContent()

                // TODO: Support v-model for dropdown state
                // ctx.emit('update:modelValue', isOpen.value)

                nextFrame(() => nextFrame(() => detectScreenEdges()))
                nextFrame(() => nextFrame(() => {
                    dom(api.listRef)?.focus()
                    if (props.focusOnOpen) api.goToItem(Focus.First)
                    if (api.listRef.value) addRecord({ id: api.listId, content: unref(api.listRef.value) })

                    ctx.emit('toggle', true)
                    addState({
                        ref: api.listRef,
                        options: {
                            id: api.listId,
                            open: api.openDropdown,
                            close: api.closeDropdown,
                        },
                    })
                }))
            },
            closeDropdown: () => {
                if (api.disabled) return
                if (!api.isOpen.value) return

                isOpen.value = false
                ctx.emit('toggle', false)

                // TODO: Support v-model for dropdown state
                // ctx.emit('update:modelValue', false)

                // TODO-FIX: Outside click on another dropdown item focuses previously opened dropodown trigger
                // nextTick(() => api.triggerRef.value?.focus())
            },
            setActiveItem: (id: string) => {
                const idx = api.items.value.findIndex(i => i.id === id)
                if (idx === -1) return

                api.activeItemIndex.value = idx
            },
            hideDropdownContent: () => {
                api.showContent.value = false
                removeState(api.listId)
            },
            showDropdownContent: () => {
                api.showContent.value = true
            },
            revaluateScreenEdges: () => {
                nextFrame(() => nextFrame(() => detectScreenEdges()))
            },
        }

        // @ts-expect-error Types of property 'dataRef' are incompatible.
        provide(ExDropdownContext, api)

        watch(api.isOpen, (value) => {
            if (value === false) {
                setTimeout(() => {
                    api.hideDropdownContent()
                }, api.disableTransition ? 0 : Number(api.transitionDuration) ?? 150)
            }
        }, { immediate: true })

        function removeLastPortalElement (target: HTMLElement) {
            const rootPortal = document.querySelector(toRawId(MI_PORTAL_ID))
            if (!rootPortal || (rootPortal && !rootPortal.children.length)) return

            const childrenList = [...rootPortal.children].filter(i => {
                return ('dataset' in i) &&
                    (
                        (i.dataset && 'miDropdownList' in (i.dataset as DOMStringMap)) ||
                        (i.dataset && 'ExAutocompleteList' in (i.dataset as DOMStringMap))
                    )
            })

            const lastElement = childrenList[childrenList.length - 1]
            const lastElementId = lastElement.getAttribute('id')
            if (lastElement.contains(target)) return

            if (lastElementId) removeState(lastElementId)
        }

        useOutsideClick(
            [api.triggerRef, api.listRef],
            (event, target) => {
                if (target.closest('[data-mi-dropdown-trigger]')) return
                if (target === api.triggerRef.value || api.triggerRef.value?.contains(target)) return

                // Label for dropdown trigger
                if (target.getAttribute('id') === api.labelId || target.closest('#' + api.labelId)) {
                    event.preventDefault()
                }

                if (document.querySelector(toRawId(MI_PORTAL_ID))?.contains(target)) {
                    return removeLastPortalElement(target)
                }

                api.closeDropdown()
            },
            { isActive: computed(() => api.isOpen.value) },
        )

        useDocumentEvent('mouseover', (evt) => {
            if (!api.triggerRef.value) return
            if (!evt.target) return
            if (!(evt.target instanceof HTMLElement)) return

            if (api.isOpen.value && (api.listRef.value && api.listRef.value.contains(evt.target))) {
                return
            }

            if (
                (('id' in evt.target && evt.target.id) && api.triggerRef.value.matches(evt.target.id)) ||
                (api.triggerRef.value.contains(evt.target))
            ) {
                evt.preventDefault()
                if (api.isOpen.value) return
                return api.openDropdown()
            }

            // TODO: This emits all the time when no dropdown is hovered. Fix it.
            if (api.isOpen.value) {
                api.closeDropdown()
            }
        }, { options: true, isActive: api.openOnHover })

        const detectScreenEdges = () => {
            const contentRefValue = getRecord(api.listId) ? getRecord(api.listId) : api.listRef.value
            useEdgeDetection(toRef(contentRefValue), api.triggerRef, ({ x, y, right, vw }) => {
                contentStyles.value.left = convertUnit(api.position().left ? x : right).toPx() || 'auto'
                contentStyles.value.top = convertUnit(y).toPx() || 'auto'

                const { rawInt: [triggerWidth] } = usePxOrPercent(api.triggerRef.value?.clientWidth)
                const { rawInt: [contentWidth] } = usePxOrPercent(api.listRef.value?.clientWidth)

                const axis: StyleValue = { maxWidth: '100%', minWidth: triggerWidth }
                if (vw < contentWidth) axis.minWidth = vw

                contentStyles.value.minWidth = convertUnit(axis.minWidth).toPx()
                contentStyles.value.maxWidth = convertUnit(axis.maxWidth).toPercent()
            })
        }

        return () => {
            const slotProps = {
                open: api.openDropdown,
                close: api.closeDropdown,
                isOpen: api.isOpen.value,
                isDisabled: api.disabled,
                labelAttrs: {
                    id: api.labelId,
                    for: api.triggerId,
                },
            }

            const ownProps = {
                id: mergeIds(api.parentId, (ctx.attrs?.id as string) || ''),
                ref: api.parentRef,
                ...ctx.attrs,
                ...ctx.expose,
                ...ctx.emit,
            }

            return render({
                name: 'ExDropdown',
                as: props.as,
                ourProps: props.as !== 'template' ? ownProps : {},
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
