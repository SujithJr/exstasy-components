import { defineComponent, ref, type UnwrapNestedRefs, provide, computed, type VNode, watch, type StyleValue, type SlotsType, toRef, unref } from 'vue'
import { dom } from '@/utils/dom'
import { useId } from '@/hooks/useId'
import { render } from '@/utils/render'
import { nextFrame } from '@/utils/creator'
import { mergeIds } from '@/utils/states-ids'
import { convertUnit } from '@/utils/convertUnit'
import { useRecording } from '@/composables/useRecording'
import { ExAutocompleteContext } from '@/utils/injection-keys'
import { useOutsideClick } from '@/composables/useOutsideClick'
import { usePxOrPercent } from '@/composables/usePxPercentFormatter'
import { Focus, calculateActiveIndex } from '@/composables/useFocusManagement'

import { useEdgeDetection } from '../ExDropdown/composables/useEdgeDetection'

import type { ListItemData } from './types'
import type { ContentStyleTypes } from '../../types'
import type { ExAutocompleteStateDefinition } from './definition'

interface ExAutocompleteSlotProps {
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

const defaultComparator = <T>(a: T, b: T): boolean => {
    return a === b
}

export const ExAutocomplete = defineComponent({
    name: 'ExAutocomplete',
    props: {
        as: { type: String, default: 'template' },
        modelValue: {
            type: [Array, String, Object],
            default: undefined,
        },
        state: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        clearable: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        closeOnClick: { type: Boolean, default: true },
        matchKey: { type: [String, Function], default: () => defaultComparator },
        left: { type: Boolean, default: false },
        right: { type: Boolean, default: false },
        mode: { type: String, default: 'fade' },
        disableTransition: { type: Boolean, default: false },
        transitionDuration: { type: [Number, String], default: 150 },
    },
    emits: {
        'update:modelValue': (_value: any) => true,
        'update:state': (_state: boolean) => true,
    },
    slots: Object as SlotsType<ExAutocompleteSlotProps>,
    setup: (props, ctx) => {
        const { addRecord, getRecord } = useRecording()

        const showContent = ref<ExAutocompleteStateDefinition['showContent']['value']>(false)
        const isOpen = ref<ExAutocompleteStateDefinition['isOpen']['value']>(false)
        const parentRef = ref<ExAutocompleteStateDefinition['parentRef']['value']>(null)
        const inputRef = ref<ExAutocompleteStateDefinition['inputRef']['value']>(null)
        const listRef = ref<ExAutocompleteStateDefinition['listRef']['value']>(null)
        const activeItemIndex = ref<ExAutocompleteStateDefinition['activeItemIndex']['value']>(null)
        const items = ref<ExAutocompleteStateDefinition['items']['value']>([])
        const contentStyles = ref<ContentStyleTypes>({ left: 0, top: 0, minWidth: 'auto', maxWidth: 'auto' })

        const fnCalculateActiveIndex = (
            modifiedItems: (items: UnwrapNestedRefs<ExAutocompleteStateDefinition['items']['value']>) =>
                UnwrapNestedRefs<ExAutocompleteStateDefinition['items']['value']> = (i) => i,
        ) => {
            const currentActiveItem = activeItemIndex.value !== null ? items.value[activeItemIndex.value] : null
            const filteredItems = modifiedItems(items.value.slice())
            let currentActiveIndex = currentActiveItem ? filteredItems.indexOf(currentActiveItem) : null

            if (currentActiveIndex === -1) {
                currentActiveIndex = null
            }

            return { items: filteredItems, activeItemIndex: currentActiveIndex }
        }

        const initialValue = computed(() => props.modelValue)
        const isMultiple = computed(() => props.multiple)
        const isClearable = computed(() => props.clearable)
        const matchByKey = computed(() => props.matchKey)

        const api = {
            isMultiple,
            isClearable,
            initialValue,
            matchByKey,

            isOpen,
            showContent,
            activeItemIndex,
            items,

            parentRef,
            inputRef,
            listRef,

            contentStyles,
            mode: props.mode,

            transitionDuration: props.transitionDuration,
            disableTransition: props.disableTransition,

            parentId: `ex-autocomplete-${useId()}`,
            triggerId: `ex-autocomplete-trigger-${useId()}`,
            listId: `ex-autocomplete-list-${useId()}`,
            labelId: `ex-autocomplete-label-${useId()}`,
            closeOnClick: props.closeOnClick,

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
                    return true
                }

                const itemIndeCalculated = fnCalculateActiveIndex((items) => {
                    return [...items, { id, dataRef }]
                })

                items.value = itemIndeCalculated.items
                activeItemIndex.value = itemIndeCalculated.activeItemIndex === -1 ? null : itemIndeCalculated.activeItemIndex
            },

            deRegisterItems: (id: string) => {
                const itemIndeCalculated = fnCalculateActiveIndex((items) => {
                    const index = items.findIndex(i => i.id === id)
                    if (index !== -1) items.splice(index, 1)
                    return items
                })

                items.value = itemIndeCalculated.items
                activeItemIndex.value = itemIndeCalculated.activeItemIndex === -1 ? null : itemIndeCalculated.activeItemIndex
            },

            goToItem: (focus: Focus, id?: string) => {
                const activeIndex = calculateActiveIndex(
                    focus === Focus.Specific
                        ? { focus: Focus.Specific, id: id! }
                        : { focus: focus as Exclude<Focus, Focus.Specific> },
                    {
                        resolveActiveIndex: () => activeItemIndex.value,
                        resolveItems: () => items.value,
                        resolveId: (item) => item.id,
                    })

                activeItemIndex.value = activeIndex
            },
            selectItem: (id: string) => {
                if (props.disabled) return
                // if (!props.modelValue) return

                const selected = api.items.value.find(i => i.id === id)
                if (!Array.isArray(props.modelValue) || !props.multiple) {
                    ctx.emit('update:modelValue', selected?.dataRef.value)
                    return true
                }

                const arrayValue = props.modelValue.length ? props.modelValue : []
                arrayValue.push(selected?.dataRef.value)
                ctx.emit('update:modelValue', arrayValue)
            },
            removeItem: (value: any) => {
                if (props.disabled) return

                const arrayValue = props.modelValue?.slice()
                const index = arrayValue.findIndex((i: any) => api.compare(i, value))
                if (index === -1) return

                arrayValue.splice(index, 1)
                ctx.emit('update:modelValue', arrayValue)
            },
            compare (a: any, b: any) {
                if (typeof props.matchKey !== 'string') {
                    return props.matchKey(a, b)
                }

                const property = props.matchKey as unknown as any
                if (!Array.isArray(a)) {
                    return a?.[property] === b?.[property]
                }

                const index = a.findIndex(i => i?.[property] === b?.[property])
                return index !== -1
            },

            position: () => {
                const args = { left: props.left, right: props.right }
                if (!props.left && !props.right) return { ...args, left: true }

                return { left: props.left, right: props.right }
            },
            updateInitialValue: (value: any) => {
                if (props.disabled) return
                ctx.emit('update:modelValue', value)
            },
            clearInitialValue: () => {
                if (props.disabled) return
                ctx.emit('update:modelValue', null)
            },
            toggleDropdown: () => {
                isOpen.value ? api.closeDropdown() : api.openDropdown()
            },
            openDropdown: () => {
                if (props.disabled) return

                api.isOpen.value = true
                api.showDropdownContent()

                nextFrame(() => nextFrame(() => detectScreenEdges()))
                nextFrame(() => nextFrame(() => {
                    if (!props.state) ctx.emit('update:state', api.isOpen.value)
                    if (api.listRef.value) addRecord({ id: api.listId, content: unref(api.listRef.value) })
                }))
            },
            closeDropdown: () => {
                api.isOpen.value = false
                api.activeItemIndex.value = null
                ctx.emit('update:state', api.isOpen.value)
            },
            hideDropdownContent: () => {
                api.showContent.value = false
            },
            showDropdownContent: () => {
                api.showContent.value = true
            },
            revaluateScreenEdges: () => {
                nextFrame(() => nextFrame(() => detectScreenEdges()))
            },
        }

        // @ts-expect-error Types of property 'dataRef' are incompatible.
        provide(ExAutocompleteContext, api)

        const detectScreenEdges = () => {
            const contentRefValue = getRecord(api.listId) ? getRecord(api.listId) : api.listRef.value
            useEdgeDetection(toRef(contentRefValue), api.inputRef, ({ x, y, right, vw }) => {
                contentStyles.value.left = convertUnit(api.position().left ? x : right).toPx() || 'auto'
                contentStyles.value.top = convertUnit(y).toPx() || 'auto'

                const { rawInt: [triggerWidth] } = usePxOrPercent(api.inputRef.value?.clientWidth)
                const { rawInt: [contentWidth] } = usePxOrPercent(api.listRef.value?.clientWidth)

                const axis: StyleValue = { maxWidth: '100%', minWidth: triggerWidth }
                if (vw < contentWidth) axis.minWidth = vw

                contentStyles.value.minWidth = convertUnit(axis.minWidth).toPx()
                contentStyles.value.maxWidth = convertUnit(axis.maxWidth).toPercent()

                // contentStyles.value.left = (api.position().left ? x : right) + 'px' || 'auto'
                // contentStyles.value.top = y + 'px' || 'auto'
            })
        }

        // watch(() => props.state, (value) => {
        //     if (value === false) return api.closeDropdown()

        //     api.openDropdown()
        //     nextTick(() => api.goToItem(Focus.First))
        // })

        watch(api.isOpen, (value) => {
            if (value === false) {
                setTimeout(() => {
                    api.hideDropdownContent()
                }, api.disableTransition ? 0 : Number(api.transitionDuration) ?? 150)
            }
        }, { immediate: true })

        useOutsideClick(
            [api.inputRef, api.listRef],
            (evt, target) => {
                if (target === api.inputRef.value || api.inputRef.value?.contains(target)) return

                api.closeDropdown()
            },
            { isActive: computed(() => api.isOpen.value) },
        )

        return () => {
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const slotProps = {
                open: api.openDropdown,
                close: api.closeDropdown,
                isOpen: api.isOpen.value,
                labelAttrs: { id: api.labelId, for: api.triggerId },
            }

            const ourProps = {
                ...customProps,
                id: mergeIds(api.parentId, (ctx.attrs?.id as string) || ''),
                ref: api.parentRef,
            }

            return render({
                name: 'ExAutocomplete',
                as: props.as,
                ourProps: props.as !== 'template' ? ourProps : {},
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
