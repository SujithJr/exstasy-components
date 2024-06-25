import { defineComponent, ref, type StyleValue } from 'vue'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { mergeIds } from '../../utils/states-ids'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import type { ExImagePropsType } from './types'

const fnGetBaseStyle = (props: ExImagePropsType) => {
    const [width, height] = usePxOrPercent(props.size).raw

    const widthCalc = () => {
        if (props.width !== 'inherit') return props.width
        if (width && width !== 'inherit') return width

        return props.width
    }

    const heightCalc = () => {
        if (props.height !== 'inherit') return props.height
        if (height && height !== 'inherit') return height
        if (width && width !== 'inherit') return width

        return props.height
    }

    const baseStyles: StyleValue = {
        borderRadius: usePxOrPercent(props.radius).value,
        width: usePxOrPercent(widthCalc()).value,
        height: usePxOrPercent(heightCalc()).value,
        minWidth: usePxOrPercent(props.minWidth).value,
        minHeight: usePxOrPercent(props.minHeight).value,
        maxWidth: usePxOrPercent(props.maxWidth).value,
        maxHeight: usePxOrPercent(props.maxHeight).value,
        objectFit: 'cover',
    }

    if (props.contain) baseStyles['objectFit'] = 'contain'
    if (props.cover) baseStyles['objectFit'] = 'cover'

    return baseStyles
}

export const ExImage = defineComponent({
    name: 'ExImage',
    inheritAttrs: false,
    props: {
        size: { type: [String, Number], default: 'inherit' },
        radius: { type: [String, Number], default: 'inherit' },
        width: { type: [String, Number], default: 'inherit' },
        height: { type: [String, Number], default: 'inherit' },
        minWidth: { type: [String, Number] },
        minHeight: { type: [String, Number] },
        maxWidth: { type: [String, Number] },
        maxHeight: { type: [String, Number] },
        cover: { type: Boolean, default: false },
        contain: { type: Boolean, default: false },
    },
    setup: (props, ctx) => {
        const imageRef = ref<HTMLElement | null>(null)
        const imageId = `ex-image-${useId()}`

        return () => {
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const ownProps = {
                id: mergeIds(imageId, (ctx.attrs?.id as string) || ''),
                ref: imageRef,
                style: fnGetBaseStyle(props),
            }

            return render({
                name: 'ExImage',
                as: 'img',
                ourProps: {
                    ...customProps,
                    ...ownProps,
                },
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
