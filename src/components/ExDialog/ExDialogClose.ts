import { defineComponent, watch, type SlotsType } from 'vue'
import { useExDialogContext } from './composables/useExDialogContext'
import { useId } from '@/hooks/useId'
import { mergeIds } from '../../utils/states-ids'
import { render } from '../../utils/render'

interface ExDialogCloseSlotProps {
    default: (props: {
        isOpen: boolean,
    }) => any
}

export const ExDialogClose = defineComponent({
    name: 'ExDialogClose',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'button' },
        disabled: { type: Boolean, default: false },
    },
    slots: Object as SlotsType<ExDialogCloseSlotProps>,
    setup: (props, ctx) => {
        const api = useExDialogContext('ExDialogClose')
        const closeBtnId = `mi-dialog-close-${useId()}`

        ctx.expose({ el: api.dialogCloseRef, $el: api.dialogCloseRef })

        const handleClick = () => {
            if (props.disabled) return
            api.btnCloseModal()
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
                ref: api.dialogRef,
                disabled: !api.isCloseBtnActive.value,
                'aria-disabled': !api.isCloseBtnActive.value,
            }

            return render({
                name: 'ExDialogClose',
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
