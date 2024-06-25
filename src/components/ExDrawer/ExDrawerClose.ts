import { defineComponent, watch, type SlotsType } from 'vue'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { mergeIds } from '../../utils/states-ids'
import { useExDrawerContext } from './composables/useExDrawerContext'

interface ExDrawerCloseSlotProps {
    default: (props: {
        isOpen: boolean,
    }) => any
}

export const ExDrawerClose = defineComponent({
    name: 'ExDrawerClose',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'button' },
        disabled: { type: Boolean, default: false },
    },
    slots: Object as SlotsType<ExDrawerCloseSlotProps>,
    setup: (props, ctx) => {
        const api = useExDrawerContext('ExDrawerClose')
        const closeBtnId = `mi-dialog-close-${useId()}`

        const handleClick = () => {
            if (props.disabled) return
            api.hideContent()
        }

        watch(() => props.disabled, (value) => {
            value ? api.disableCloseBtn() : api.enableCloseBtn()
        })

        return () => {
            const events = { onclick: handleClick }
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const slotProps = { isOpen: api.isOpen.value }

            const ownProps = {
                id: mergeIds(closeBtnId, (ctx.attrs?.id as string) || ''),
                ref: api.drawerCloseRef,
                disabled: !api.isCloseBtnActive.value,
                'aria-disabled': !api.isCloseBtnActive.value,
            }

            return render({
                name: 'ExDrawerClose',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ownProps,
                    ...events,
                },
                slotProps,
                slots: ctx.slots,
            })
        }
    },
})
