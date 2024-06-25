import { defineComponent, ref } from 'vue'
import { usePxOrPercent } from '../../composables/usePxPercentFormatter'
import { useId } from '@/hooks/useId'
import { mergeIds } from '../../utils/states-ids'
import { render } from '../../utils/render'
import type { ExAvatarPropsType } from './types'

const fnGetBaseStyle = (props: ExAvatarPropsType) => {
    const [width, height] = usePxOrPercent(props.size).raw

    return {
        borderRadius: usePxOrPercent(props.tile ? undefined : props.radius).value,
        width: usePxOrPercent(props.width || width).value,
        height: usePxOrPercent(props.height || height || width).value,
        minWidth: usePxOrPercent(props.minWidth).value,
        minHeight: usePxOrPercent(props.minHeight).value,
        maxWidth: usePxOrPercent(props.maxWidth).value,
        maxHeight: usePxOrPercent(props.maxHeight).value,
    }
}

export const ExAvatar = defineComponent({
    name: 'ExAvatar',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'div' },
        radius: {
            type: [String, Number],
            default: (rawProps: { tile: boolean }) => rawProps.tile ? undefined : '50%',
        },
        tile: { type: Boolean, default: false },
        size: { type: [String, Number], default: 48 },
        width: { type: [String, Number] },
        height: { type: [String, Number] },
        minWidth: { type: [String, Number] },
        minHeight: { type: [String, Number] },
        maxWidth: { type: [String, Number] },
        maxHeight: { type: [String, Number] },
    },
    setup: (props, ctx) => {
        const avatarRef = ref<HTMLElement | null>(null)
        const avatarId = `ex-avatar-${useId()}`

        return () => {
            const ownProps = {
                id: mergeIds(avatarId, (ctx.attrs?.id as string) || ''),
                ref: avatarRef,
            }

            const style = fnGetBaseStyle(props as ExAvatarPropsType)
            const attrStyles = 'style' in ctx.attrs ? ctx.attrs.style as object : {}
            const ourProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
                ...ownProps,
                style: {
                    ...style,
                    ...attrStyles,
                },
            }

            return render({
                name: 'ExAvatar',
                as: props.as,
                ourProps,
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
