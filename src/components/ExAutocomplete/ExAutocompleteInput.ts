import { defineComponent, nextTick, type VNode, type UnwrapNestedRefs, onMounted, watch, type PropType, computed } from 'vue'
import { useExAutocompleteContext } from './composables/useExAutocompleteContext'
import { render } from '../../utils/render'
import { Keys } from '../../utils/keys'
import { Focus } from '../../composables/useFocusManagement'
import { dom } from '../../utils/dom'
import { mergeIds } from '../../utils/states-ids'
import { nextFrame } from '../../utils/creator'

export const ExAutocompleteInput = defineComponent({
    name: 'ExAutocompleteInput',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'input' },
        modelValue: {
            type: [Array, String, Object],
            default: undefined,
        },
        displayValue: { type: Function as PropType<(item: any) => string> },
    },
    emits: {
        'update:modelValue': (_value: any) => true,
        change: (_value: Event & { target: HTMLInputElement }) => true,
    },
    setup: (props, ctx) => {
        const api = useExAutocompleteContext('ExAutocompleteInput')

        ctx.expose({ el: api.inputRef, $el: api.inputRef })

        onMounted(() => changeValue())

        watch(api.initialValue, () => changeValue(), { deep: true })

        watch(api.isOpen, (newVal, oldValue) => {
            if (!newVal && oldValue) {
                ctx.emit('change', { target: { value: '' } } as Event & { target: HTMLInputElement })
            }
        })

        const changeValue = () => {
            const input = dom(api.inputRef) as HTMLInputElement
            if (!input) return api.adjustListOrder()

            input.value = props.displayValue ? (props.displayValue(api.initialValue.value)) : ''
            if (!input) return api.adjustListOrder()
        }

        const handleBlur = () => {
            if (!api.isClearable.value) return changeValue()

            const input = dom(api.inputRef) as HTMLInputElement
            if (input && input.value) return

            api.clearInitialValue()
            nextTick(() => changeValue())
        }

        const handleClick = () => {
            if (api.isOpen.value) return

            api.revaluateScreenEdges()
            nextFrame(() => api.openDropdown())
        }

        const handleInput = (event: Event) => {
            ctx.emit('change', event as Event & { target: HTMLInputElement })

            const input = dom(api.inputRef) as HTMLInputElement
            ctx.emit('update:modelValue', input.value)
            if (input && !input.value && (api.isClearable.value && !api.isMultiple.value)) {
                api.clearInitialValue()
            }

            nextFrame(() => api.adjustListOrder())
            if (!api.isOpen.value) {
                api.revaluateScreenEdges()
                nextFrame(() => api.openDropdown())
            }
        }

        const handleKeyDown = (evt: KeyboardEvent) => {
            switch (evt.key) {
                case Keys.Space: {
                    if (api.inputRef.value) return
                    return handleClick()
                }

                case Keys.Enter: {
                    if (api.activeItemIndex.value === null || api.activeItemIndex.value === -1) return true

                    evt.preventDefault()
                    evt.stopPropagation()

                    const activeItem = api.items.value[api.activeItemIndex.value]
                    const _activeItem = activeItem as unknown as UnwrapNestedRefs<typeof activeItem>
                    if (_activeItem && _activeItem.dataRef) _activeItem.dataRef.domRef.value?.click()
                    return true
                }

                case Keys.ArrowDown: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (api.isOpen.value) return api.goToItem(Focus.Next)

                    api.revaluateScreenEdges()
                    nextFrame(() => {
                        api.openDropdown()
                        nextTick(() => api.goToItem(Focus.First))
                    })
                    return true
                }

                case Keys.ArrowUp: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    if (api.isOpen.value) return api.goToItem(Focus.Previous)

                    api.revaluateScreenEdges()
                    nextFrame(() => {
                        api.openDropdown()
                        nextTick(() => api.goToItem(Focus.First))
                    })
                    return true
                }

                case Keys.Home:
                case Keys.PageUp: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.revaluateScreenEdges()
                    nextFrame(() => {
                        api.openDropdown()
                        api.goToItem(Focus.First)
                    })
                    return true
                }

                case Keys.End:
                case Keys.PageDown: {
                    evt.preventDefault()
                    evt.stopPropagation()

                    api.revaluateScreenEdges()
                    nextFrame(() => {
                        api.openDropdown()
                        api.goToItem(Focus.Last)
                    })
                    return true
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

        const activeDecendant = computed(() => {
            if (api.activeItemIndex.value === null || api.activeItemIndex.value === -1) return
            return api.items.value[api.activeItemIndex.value].id
        })

        return () => {
            const ownProps: { [key: string]: any } = {
                id: mergeIds(api.triggerId, (ctx.attrs?.id as string) || ''),
                ref: api?.inputRef,
                tabIndex: -1,
            }

            if (props.as === 'button' && !('type' in ctx.attrs)) {
                ownProps['type'] = 'submit'
            }

            if (typeof props.as !== typeof HTMLInputElement) {
                ownProps['tabIndex'] = 0
            }

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
            }

            const events = {
                onkeydown: handleKeyDown,
                oninput: handleInput,
                onclick: handleClick,
                onblur: handleBlur,
            }

            const ownAttributes = {
                role: 'combobox',
                'aria-expanded': api.isOpen.value,
                'aria-controls': api.listId,
                'aria-labelledby': api.labelId,
                'aria-autocomplete': 'list',
                'aria-activedescendant': api.isOpen.value ? activeDecendant.value : undefined,
                'data-ex-autocomplete-input': '',
            }

            return render({
                name: 'ExAutocompleteInput',
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
