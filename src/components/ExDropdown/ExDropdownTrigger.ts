import { Keys } from '../../utils/keys'
import { render } from '../../utils/render'
import { nextFrame } from '../../utils/creator'
import { mergeIds } from '../../utils/states-ids'
import { Focus } from '../../composables/useFocusManagement'
import { useExDropdownContext } from './composables/useExDropdownContext'
import { defineComponent, type VNode, ref, nextTick, computed } from 'vue'

export const ExDropdownTrigger = defineComponent({
    name: 'ExDropdownTrigger',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'button' },
    },
    setup: (props, ctx) => {
        const api = useExDropdownContext('ExDropdownTrigger')
        const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)
        // const hoverTimeout = ref()

        const handleClick = (evt: MouseEvent) => {
            if (api.disabled) return

            if (api.openOnHover.value) return api.closeDropdown()
            api.toggleDropdown()
        }

        const handleKeydown = (evt: KeyboardEvent) => {
            if (api.isOpen.value) return
            if (api.disabled) return

            switch (evt.key) {
                case Keys.Space:
                case Keys.Enter:
                case Keys.ArrowDown:
                case Keys.ArrowUp:
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (!api.isOpen.value) api.openDropdown()
                    if (api.isOpen.value && api.focusOnOpen) nextFrame(() => api.goToItem(Focus.First))

                    return true
            }
        }

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (api.disabled) return
            if (api.isOpen.value || !evt.key.trim()) return

            if (evt.key.length === 1 || ['Backspace', 'Delete'].includes(evt.key)) {
                api.openDropdown()
                nextTick(() => {
                    nextFrame(() => {
                        api.search(evt.key)
                        searchDebounce.value = setTimeout(() => api.clearSearch(), 350)
                    })
                })
            }
        }

        const handleMouseEnter = (evt: MouseEvent) => {
            if (api.disabled) return

            api.revaluateScreenEdges()
            if (!api.openOnHover.value) return
            if (api.isOpen.value) return

            nextFrame(() => api.openDropdown())
        }

        const activeDecendant = computed(() => {
            if (api.activeItemIndex.value === null || api.activeItemIndex.value === -1) return
            return api.items.value[api.activeItemIndex.value].id
        })

        return () => {
            const ownProps: { [key: string]: any } = {
                id: mergeIds(api.triggerId, (ctx.attrs?.id as string) || ''),
                ref: api?.triggerRef,
                tabIndex: api.disabled ? undefined : 0,
            }

            if (props.as === 'button' && !('type' in ctx.attrs)) {
                ownProps['type'] = 'submit'
            }

            if (props.as === 'button' && api.disabled) {
                ownProps['disabled'] = true
            }

            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const events = {
                onclick: handleClick,
                onkeydown: handleKeydown,
                onkeyup: handleKeyUp,
                onmouseenter: handleMouseEnter,
            }

            const ownAttributes = {
                'aria-controls': api.listRef.value?.id,
                'aria-expanded': api.isOpen.value,
                'aria-haspopup': 'listbox',
                'aria-labelledby': api.labelId,
                'aria-disabled': api.disabled,
                'aria-activedescendant': api.isOpen.value ? activeDecendant.value : undefined,
                role: 'combobox',
                'data-mi-dropdown-trigger': '',
            }

            return render({
                name: 'ExDropdownTrigger',
                as: props.as,
                ourProps: {
                    ...ownProps,
                    ...customProps,
                    ...events,
                    ...ownAttributes,
                },
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
