import { defineComponent, onMounted, onBeforeUnmount, ref, computed, nextTick, watchEffect, type PropType, toRaw, watch, type Ref, type SlotsType } from 'vue'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { useExAutocompleteContext } from './composables/useExAutocompleteContext'
import { useTrackedPointer } from '../../hooks/useTrackedPointer'
import { Focus } from '../../composables/useFocusManagement'
import { mergeIds } from '../../utils/states-ids'
import type { ListItemData } from './types'

interface ExAutocompleteListItemSlotProps {
    default: (props: {
        active: boolean,
        isSelected: boolean,
        disabled: boolean
    }) => any;
}

export const ExAutocompleteListItem = defineComponent({
    name: 'ExAutocompleteListItem',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'li' },
        value: { type: [Object, String, Number, Boolean] as PropType<object | string | number | boolean> },
        disabled: { type: Boolean, default: false },
    },
    slots: Object as SlotsType<ExAutocompleteListItemSlotProps>,
    setup: (props, ctx) => {
        const api = useExAutocompleteContext('ExAutocompleteListItem')
        const listItemRef = ref<HTMLElement | null>(null)
        const listItemId = `ex-autocomplete-list-item-${useId()}`
        const { isSelected, markSelected } = useMarkSelected()

        ctx.expose({ el: listItemRef, $el: listItemRef })

        const dataRef = computed<ListItemData>(() => ({
            disabled: props.disabled,
            domRef: listItemRef,
            value: props.value,
        }))

        onMounted(() => {
            api.registerItem(listItemId, dataRef)
            markSelected()
        })

        onBeforeUnmount(() => api.deRegisterItems(listItemId))

        const active = computed(() => {
            return api.activeItemIndex.value !== null && api.activeItemIndex.value !== -1
                ? api.items.value[api.activeItemIndex.value].id === listItemId
                : false
        })

        watchEffect(() => {
            if (!api.isOpen.value) return
            if (!active.value) return

            nextTick(() => listItemRef.value?.scrollIntoView?.({ block: 'nearest' }))
        })

        // TODO: Search for values based on matchKey
        // watch([
        //     () => api.initialValue,
        //     () => api.inputRef,
        // ], () => markSelected(), { deep: true })

        const handleClick = (evt: MouseEvent) => {
            if (!api.isOpen.value) return
            if (props.disabled) return

            api.isMultiple.value && isSelected.value ?
                api.removeItem(props.value) :
                api.selectItem(listItemId)

            if (!api.closeOnClick) return
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

            api.goToItem(Focus.Specific, listItemId)
        }

        const handleLeave = (event: PointerEvent) => {
            if (!pointer.wasMoved(event)) return
            if (props.disabled) return
            if (active.value) return

            api.goToItem(Focus.Nothing)
        }

        function useMarkSelected () {
            const isSelected = ref(false)

            const markSelected = () => {
                isSelected.value = api.compare(toRaw(api.initialValue.value), toRaw(props.value))
            }

            return { isSelected, markSelected }
        }

        return () => {
            const slotProps = {
                active: props.disabled ? false : active.value,
                isSelected: isSelected.value,
                disabled: props.disabled,
            }

            const events = {
                onclick: handleClick,
                onPointerenter: handlePointerEnter,
                onMouseenter: handlePointerEnter,
                onPointermove: handleMove,
                onMousemove: handleMove,
                onPointerleave: handleLeave,
                onMouseleave: handleLeave,
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
                'aria-selected': active.value,
                'data-ex-autocomplete-list-item-state': active.value,
            }

            return render({
                name: 'ExAutocompleteListItem',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ownAttributes,
                    ...ownProps,
                    ...events,
                },
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
