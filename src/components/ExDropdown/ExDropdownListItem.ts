import { dom } from '../../utils/dom'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import type { ListItemData } from './types'
import { mergeIds } from '../../utils/states-ids'
import { useTrackedPointer } from '../../hooks/useTrackedPointer'
import { useExDropdownContext } from './composables/useExDropdownContext'
import { defineComponent, onMounted, onBeforeUnmount, ref, computed, nextTick, watchEffect, type SlotsType, type VNode } from 'vue'

interface ExDropdownListItemSlotProps {
    default: (props: {
        active: boolean;
        disabled: boolean
    }) => any;
}

export const ExDropdownListItem = defineComponent({
    name: 'ExDropdownListItem',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'div' },
        disabled: { type: Boolean, default: false },
    },
    slots: Object as SlotsType<ExDropdownListItemSlotProps>,
    setup: (props, ctx) => {
        const api = useExDropdownContext('ExDropdownListItem')
        const listItemRef = ref<HTMLElement | null>(null)
        const listItemId = `mi-dropdown-list-item-${useId()}`

        ctx.expose({ el: listItemRef, $el: listItemRef })

        const active = computed(() => {
            if (api.items.value.length === 0) return false

            return api.activeItemIndex.value !== null ? api.items.value[api.activeItemIndex.value].id === listItemId : false
        })

        const dataRef = computed<ListItemData>(() => ({
            disabled: props.disabled,
            domRef: listItemRef,
            get textValue () {
                return dom(listItemRef)?.innerText ?? ''
            },
        }))

        onMounted(() => api.registerItem(listItemId, dataRef))
        onBeforeUnmount(() => api.deRegisterItems(listItemId))

        watchEffect(() => {
            if (api.isOpen.value) return
            if (!active.value) return
            nextTick(() => listItemRef.value?.scrollIntoView?.({ block: 'nearest' }))
        })

        const handleClick = (evt: MouseEvent) => {
            if (!api.isOpen.value) return
            if (!api.closeOnClick) return
            if (props.disabled) return

            dom(api.triggerRef)?.focus()
            api.closeDropdown()
        }

        const pointer = useTrackedPointer()
        const handlePointerEnter = (evt: PointerEvent) => {
            pointer.update(evt)
        }

        const handleMove = (event: PointerEvent) => {
            if (!pointer.wasMoved(event)) return
            if (props.disabled) return
            if (active.value) return

            api.setActiveItem(listItemId)
        }

        return () => {
            const slotProps = {
                active: props.disabled ? false : active.value,
                disabled: props.disabled,
            }

            const events = {
                onclick: handleClick,
                onPointerenter: handlePointerEnter,
                onMouseenter: handlePointerEnter,
                onPointermove: handleMove,
                onMousemove: handleMove,
            }

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
            }

            const ownProps = {
                id: mergeIds(listItemId, (ctx.attrs?.id as string) || ''),
                ref: listItemRef,
            }

            const ownAttributes = {
                role: 'option',
                tabIndex: props.disabled === true ? undefined : -1,
                'aria-disabled': props.disabled === true ? true : undefined,
                'aria-selected': props.disabled ? false : active.value,
                'data-mi-dropdown-list-item-state': active.value,
            }

            return render({
                name: 'ExDropdownListItem',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ownProps,
                    ...events,
                    ...ownAttributes,
                },
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
