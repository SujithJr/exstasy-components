import { defineComponent, nextTick, type UnwrapNestedRefs, ref, type StyleValue, Transition, type SlotsType } from 'vue'
import { Keys } from '../../utils/keys'
import { render } from '../../utils/render'
import { ExPortal } from '../ExPortal/ExPortal'
import { createElement } from '../../utils/creator'
import { Focus, focusableSelectors } from '../../composables/useFocusManagement'
import { useTopMostZIndex } from '../../composables/useTopMostZIndex'
import { MI_VISIBILITY_STATE, mergeIds } from '../../utils/states-ids'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { useExDropdownContext } from './composables/useExDropdownContext'
import { dom } from '../../utils/dom'

interface ExDropdownListSlotProps {
    default: (props: {
        isOpen: boolean
    }) => any
}

export const ExDropdownList = defineComponent({
    name: 'ExDropdownList',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'div' },
        minWidth: { type: [String, Number] },
        maxWidth: { type: [String, Number] },
        maxHeight: { type: [String, Number] },
    },
    slots: Object as SlotsType<ExDropdownListSlotProps>,
    setup: (props, ctx) => {
        const api = useExDropdownContext('ExDropdownList')
        const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
        const listDropdownHeight = ref()
        const mo = ref<MutationObserver>()

        const handleKeyDown = (evt: KeyboardEvent) => {
            switch (evt.key) {
                case Keys.Enter:
                case Keys.Space: {
                    if (document.activeElement?.matches(focusableSelectors)) {
                        evt.preventDefault()
                        evt.stopPropagation()
                    }

                    if (api.activeItemIndex.value === null) return true

                    const activeItem = api.items.value[api.activeItemIndex.value]
                    const _activeItem = activeItem as unknown as UnwrapNestedRefs<typeof activeItem>
                    _activeItem.dataRef.domRef.value?.click()
                    return true
                }

                case Keys.ArrowDown: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    return api.goToItem(Focus.Next)
                }

                case Keys.ArrowUp: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    return api.goToItem(Focus.Previous)
                }

                case Keys.Home:
                case Keys.PageUp: {
                    evt.preventDefault()
                    evt.stopPropagation()
                    return api.goToItem(Focus.First)
                }

                case Keys.End:
                case Keys.PageDown: {
                    evt.preventDefault()
                    evt.stopPropagation()
                    return api.goToItem(Focus.Last)
                }

                case Keys.Escape: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.closeDropdown()
                    nextTick(() => api.triggerRef.value?.focus())
                    return true
                }

                case Keys.Tab: {
                    return api.closeDropdown()
                }
            }
        }

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (api.disableSearch) return
            if (!evt.key.trim()) return

            evt.preventDefault()
            if (evt.key.length === 1 || ['Backspace', 'Delete'].includes(evt.key)) {
                api.search(evt.key)
                searchDebounce.value = setTimeout(() => api.clearSearch(), 350)
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

        const handleClick = () => {
            if (!api.isOpen.value) return
            if (!api.closeOnClick || !api.closeOnListClick) return

            dom(api.triggerRef)?.focus()
            api.closeDropdown()
        }

        return () => {
            if (!api.showContent.value) {
                if (mo.value) mo.value.disconnect()
                return null
            }

            mo.value = new MutationObserver(mutationHandler)
            if (api.listRef.value) {
                mo.value.observe(api.listRef.value, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                })
            }

            const contentPositionStyle: StyleValue = {
                position: 'fixed',
                top: api.contentStyles.value.top,
                left: api.contentStyles.value.left,
                // minWidth: usePxOrPercent(api.triggerRef.value?.clientWidth).value,
                minWidth: api.contentStyles.value.minWidth,
                maxWidth: api.contentStyles.value.maxWidth,
                zIndex: useTopMostZIndex(),
            }

            if (contentPositionStyle.left === 0 && contentPositionStyle.top === 0) {
                contentPositionStyle['visibility'] = 'hidden'
            }

            const slotProps = { isOpen: api.isOpen.value }
            const events = {
                onclick: handleClick,
                onkeydown: handleKeyDown,
                onkeyup: handleKeyUp,
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
                tabindex: -1,
                style: contentPositionStyle,
            }

            const ownAttributes = {
                role: 'listbox',
                'data-mi-dropdown-list': '',
                [MI_VISIBILITY_STATE]: api.isOpen.value,
            }

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
                ...ownAttributes,
            }

            const contentElement = render({
                name: 'ExDropdownList',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ourProps,
                    ...events,
                    ...ownAttributes,
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
