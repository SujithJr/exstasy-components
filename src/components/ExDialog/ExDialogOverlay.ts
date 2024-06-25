import { defineComponent, type StyleValue } from 'vue'
import { render } from '../../utils/render'
import { useExDialogContext } from './composables/useExDialogContext'
import { mergeIds } from '../../utils/states-ids'

export const ExDialogOverlay = defineComponent({
    name: 'ExDialogOverlay',
    props: {
        as: { type: String, default: 'div' },
    },
    setup: (props, ctx) => {
        const api = useExDialogContext('ExDialogContent')

        const handleClick = () => {
            api.isPersistent.value ? {} : api.hideDialogContent()
        }

        return () => {
            if (!api.showContent.value) return null

            const events = { onclick: handleClick }

            const style: StyleValue = {
                position: 'fixed',
                inset: '0px',
            }

            if (!api.isPersistent.value) style['cursor'] = 'pointer'

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
                ...events,
                style,
                id: mergeIds(api.overlayId, (ctx.attrs?.id as string) || ''),
                ref: api.dialogOverlayRef,
            }

            return render({
                name: 'ExDialogOverlay',
                as: props.as,
                ourProps: {
                    ...customProps,
                },
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
