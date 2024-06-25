import { defineComponent, type VNode, nextTick, watch, toRaw, type StyleValue, Transition, type UnwrapNestedRefs, type SlotsType, ref } from 'vue'
import { useExAutocompleteContext } from './composables/useExAutocompleteContext'
import { render } from '../../utils/render'
import { ExPortal } from '../ExPortal/ExPortal'
import { MI_VISIBILITY_STATE, mergeIds } from '../../utils/states-ids'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { useTopMostZIndex } from '../../composables/useTopMostZIndex'
import { createElement } from '../../utils/creator'
import { Keys } from '../../utils/keys'
import { Focus } from '../../composables/useFocusManagement'

interface ExAutocompleteListSlotProps {
    default: (props: {
        isOpen: boolean
    }) => any
}

export const ExAutocompleteList = defineComponent({
    name: 'ExAutocompleteList',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'ul' },
        minWidth: { type: [String, Number] },
        maxWidth: { type: [String, Number] },
        maxHeight: { type: [String, Number] },
    },
    slots: Object as SlotsType<ExAutocompleteListSlotProps>,
    setup: (props, ctx) => {
        const api = useExAutocompleteContext('ExAutocompleteList')
        const listDropdownHeight = ref()
        const mo = ref<MutationObserver>()

        watch(api.showContent, (value) => {
            if (!value) return

            nextTick(() => {
                api.activeItemIndex.value = api.items.value.findIndex(i => {
                    return api.compare(toRaw(i.dataRef.value), toRaw(api.initialValue.value))
                })
            })
        })

        const handleKeyDown = (evt: KeyboardEvent) => {
            if (document.activeElement?.id === api.triggerId) return

            switch (evt.key) {
                case Keys.Enter:
                case Keys.Space: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (api.activeItemIndex.value === null) return true

                    const activeItem = api.items.value[api.activeItemIndex.value]
                    const _activeItem = activeItem as unknown as UnwrapNestedRefs<typeof activeItem>
                    _activeItem.dataRef.domRef.value?.click()
                    return true
                }

                case Keys.ArrowDown: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (api.isOpen.value) return api.goToItem(Focus.Next)

                    api.openDropdown()
                    nextTick(() => api.goToItem(Focus.First))
                    return true
                }

                case Keys.ArrowUp: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (api.isOpen.value) return api.goToItem(Focus.Previous)

                    api.openDropdown()
                    nextTick(() => api.goToItem(Focus.First))
                    return true
                }

                case Keys.Home:
                case Keys.PageUp: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.openDropdown()
                    return api.goToItem(Focus.First)
                }

                case Keys.End:
                case Keys.PageDown: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.openDropdown()
                    return api.goToItem(Focus.Last)
                }

                case Keys.Escape: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.closeDropdown()
                    nextTick(() => api.inputRef.value?.focus())
                    return true
                }

                case Keys.Tab: {
                    return api.closeDropdown()
                }
            }
        }

        const mutationHandler = (list: MutationRecord[]) => {
            for (const mutation of list) {
                if (mutation.type !== 'attributes') continue

                const { height } = (mutation.target as HTMLElement).getBoundingClientRect()
                if (listDropdownHeight.value >= 0 && height !== listDropdownHeight.value) {
                    api.revaluateScreenEdges()
                }
                listDropdownHeight.value = height
            }
        }

        return () => {
            if (!api.showContent.value) {
                if (mo.value) mo.value.disconnect()
                return null
            }

            mo.value = new MutationObserver(mutationHandler)
            if (api.listRef.value) {
                mo.value.observe(api.listRef.value, { attributes: true })
            }

            const slotProps = { isOpen: api.isOpen.value }

            const contentPositionStyle: StyleValue = {
                position: 'fixed',
                top: api.contentStyles.value.top,
                left: api.contentStyles.value.left,
                // minWidth: usePxOrPercent(api.inputRef.value?.clientWidth).value,
                minWidth: api.contentStyles.value.minWidth,
                maxWidth: api.contentStyles.value.maxWidth,
                zIndex: useTopMostZIndex(),
            }

            if (contentPositionStyle.left === 0 && contentPositionStyle.top === 0) {
                contentPositionStyle['visibility'] = 'hidden'
            }

            if (props.minWidth !== undefined) {
                contentPositionStyle['minWidth'] = usePxOrPercent(props.minWidth).value
            }

            if (props.maxWidth !== undefined) {
                contentPositionStyle['maxWidth'] = usePxOrPercent(props.maxWidth).value
            }

            if (props.maxHeight !== undefined) {
                contentPositionStyle['maxHeight'] = usePxOrPercent(props.maxHeight).value
            }

            const ourProps = {
                id: mergeIds(api.listId, (ctx.attrs?.id as string) || ''),
                ref: api.listRef,
                tabindex: 0,
                style: contentPositionStyle,
            }

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
            }

            const events = {
                onkeydown: handleKeyDown,
            }

            const ownAttributes = {
                role: 'listbox',
                'data-ex-autocomplete-list': '',
                [MI_VISIBILITY_STATE]: api.isOpen.value,
            }

            const contentElement = render({
                name: 'ExAutocompleteList',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ourProps,
                    ...ownAttributes,
                    ...events,
                },
                slotProps,
                slots: ctx.slots,
            })

            const slotContent = createElement(
                Transition,
                { name: api.mode || 'fade', appear: true },
                { default: () => !api.isOpen.value ? null : contentElement },
            )

            return render({
                name: 'ExPortal',
                as: ExPortal,
                ourProps: {},
                slotProps: {},
                slots: [
                    api.disableTransition ? contentElement : slotContent,
                ],
            })
        }
    },
})
