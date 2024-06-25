import { defineComponent, ref, type StyleValue } from 'vue'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { mergeIds } from '../../utils/states-ids'

import type { ExCardPropsType } from './types'

export const ExCard = defineComponent({
    name: 'ExCard',
    props: {
        as: { type: String, default: 'div' },
        tile: { type: Boolean, default: false },
        size: { type: [String, Number] },
        radius: { type: [String, Number] },
        width: { type: [String, Number] },
        minWidth: { type: [String, Number] },
        maxWidth: { type: [String, Number] },
        height: { type: [String, Number] },
        minHeight: { type: [String, Number] },
        maxHeight: { type: [String, Number] },
    },
    setup: (props: ExCardPropsType, ctx) => {
        const cardRef = ref<HTMLElement | null>(null)
        const cardId = `mi-card-${useId()}`

        return () => {
            const ownProps = {
                id: mergeIds(cardId, (ctx.attrs?.id as string) || ''),
                ref: cardRef,
            }

            const [width, height] = usePxOrPercent(props.size).raw
            const style: StyleValue = {
                width: usePxOrPercent(props.width || width).value,
                height: usePxOrPercent(props.height || height || width).value,
                borderRadius: usePxOrPercent(props.tile ? undefined : props.radius).value,
            }

            if (props.minWidth !== undefined) {
                style['minWidth'] = usePxOrPercent(props.minWidth).value
            }

            if (props.maxWidth !== undefined) {
                style['maxWidth'] = usePxOrPercent(props.maxWidth).value
            }

            if (props.maxHeight !== undefined) {
                style['maxHeight'] = usePxOrPercent(props.maxHeight).value
            }

            if (props.minHeight !== undefined) {
                style['minHeight'] = usePxOrPercent(props.minHeight).value
            }

            const ourProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
                ...ownProps,
                style,
            }

            return render({
                name: 'ExCard',
                as: props.as,
                ourProps,
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
