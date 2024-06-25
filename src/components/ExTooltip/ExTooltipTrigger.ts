import { defineComponent, ref, type SlotsType } from 'vue'
import { useExTooltipContext } from './composables/useExTooltipContext'
import { render } from '../../utils/render'
import { mergeIds } from '../../utils/states-ids'

interface ExTooltipTriggerSlotProps {
    default: (props: {
        isActive: boolean
    }) => any
}

export const ExTooltipTrigger = defineComponent({
    name: 'ExTooltipTrigger',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'template' },
    },
    slots: Object as SlotsType<ExTooltipTriggerSlotProps>,
    setup: (props, ctx) => {
        const timeout = ref<number | undefined>()
        const api = useExTooltipContext('ExTooltipTrigger')

        const handleMouseEnter = (evt: MouseEvent) => {
            /* TODO: Implement v-model based tooltip */
            // if (api.hasVModel.value) return

            if (timeout.value) clearTimeout(timeout.value)

            timeout.value = window.setTimeout(() => {
                api.showTooltipContent()
            }, api.getTooltipDelay.value)
        }

        const handleMouseLeave = (evt: MouseEvent) => {
            /* TODO: Implement v-model based tooltip */
            // if (api.hasVModel.value) return

            clearTimeout(timeout.value)
            api.hideTooltipContent()
        }

        const handleFocus = (evt: FocusEvent) => {
            if (api.showContent.value) return

            evt.preventDefault()
            evt.stopPropagation()

            api.showTooltipContent()
        }

        const handleBlur = (evt: FocusEvent) => {
            evt.preventDefault()
            evt.stopPropagation()

            api.hideTooltipContent()
        }

        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.code === 'Escape') {
                api.hideTooltipContent()
            }

            if (evt.code === 'Space') {
                evt.preventDefault()
                !api.showContent.value ?
                    api.showTooltipContent() :
                    api.hideTooltipContent()
            }
        }

        return () => {
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const slotProps = { isActive: api.showContent.value }

            const ownProps = {
                id: mergeIds(api.triggerId, (ctx.attrs?.id as string) || ''),
                tabIndex: 0,
                'aria-describedby': api.contentId,
                'data-ex-tooltip-trigger': '',
                'data-ex-tooltip-visible': api.showContent.value,
            }

            const events = {
                onmouseenter: handleMouseEnter,
                onmouseleave: handleMouseLeave,
                onfocus: handleFocus,
                onblur: handleBlur,
                onkeydown: handleKeyDown,
            }

            return render({
                name: 'ExTooltipTrigger',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ownProps,
                    ...events,
                    ref: api.triggerRef,
                },
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
