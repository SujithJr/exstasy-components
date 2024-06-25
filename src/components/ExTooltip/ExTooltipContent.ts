import { Transition, defineComponent, type StyleValue } from 'vue'
import { useExTooltipContext } from './composables/useExTooltipContext'
import { render } from '../../utils/render'
import { ExPortal } from '../ExPortal/ExPortal'
import { MI_VISIBILITY_STATE, mergeIds } from '../../utils/states-ids'
import { useTopMostZIndex } from '../../composables/useTopMostZIndex'
import type { ComponentSlots } from '../../types'
import { createElement } from '../../utils/creator'

export const ExTooltipContent = defineComponent({
    name: 'ExTooltipContent',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'template' },
    },
    setup: (props, ctx) => {
        const api = useExTooltipContext('ExTooltipContent')

        return () => {
            if (!api.isVisible.value) return null

            const slots = (ctx.slots as ComponentSlots)
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }

            const style: StyleValue = {
                left: api.contentStyles.value.left,
                top: api.contentStyles.value.top,
                position: 'fixed',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: useTopMostZIndex(),
            }

            const ourProps = {
                id: mergeIds(api.contentId, (ctx.attrs?.id as string) || ''),
                role: 'tooltip',
                'data-ex-tooltip-content': '',
                [MI_VISIBILITY_STATE]: api.showContent.value,
                style,
            }

            const contentElement = render({
                name: 'ExTooltipContent',
                as: props.as,
                ourProps: {
                    ...ourProps,
                    ...customProps,
                    ref: api.contentRef,
                },
                slotProps: {},
                slots,
            })

            const slotContent = createElement(
                Transition,
                { name: api.mode || 'fade', appear: true },
                { default: () => !api.showContent.value ? null : contentElement },
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
