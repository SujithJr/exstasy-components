import { defineComponent, type StyleValue } from 'vue'
import { render } from '../../utils/render'
import { useExDrawerContext } from './composables/useExDrawerContext'
import { mergeIds } from '../../utils/states-ids'

export const ExDrawerOverlay = defineComponent({
    name: 'ExDrawerOverlay',
    props: {
        as: { type: String, default: 'div' },
    },
    setup: (props, ctx) => {
        const api = useExDrawerContext('ExDrawerOverlay')

        const handleClick = () => {
            api.isPersistent.value ? {} : api.hideContent()
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
                ref: api.drawerOverlayRef,
            }

            return render({
                name: 'ExDrawerOverlay',
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
