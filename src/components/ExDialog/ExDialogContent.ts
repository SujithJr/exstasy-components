import { defineComponent, watch, type StyleValue } from 'vue'
import { render } from '../../utils/render'
import { useExDialogContext } from './composables/useExDialogContext'
import { mergeIds } from '../../utils/states-ids'

export const ExDialogContent = defineComponent({
    name: 'ExDialogContent',
    props: {
        as: { type: String, default: 'div' },
    },
    setup: (props, ctx) => {
        const api = useExDialogContext('ExDialogContent')

        watch(api.showContent, (value) => {
            if (value === false) {
                setTimeout(() => api.closeModal(), Number(api.transitionDuration) ?? 0)
            }
        }, { immediate: true })

        const handleBlur = (evt: FocusEvent) => {
            evt.preventDefault()
            evt.stopPropagation()

            if (api.dialogRef.value?.contains(evt.target as Node)) return
            api.hideDialogContent()
        }

        return () => {
            if (!api.showContent.value) return null

            const events = { onblur: handleBlur }
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const ownProps = {
                id: mergeIds(api.contentId, (ctx.attrs?.id as string) || ''),
                ref: api.dialogContentRef,
                style: { zIndex: api.getContentZIndex() } as StyleValue,
            }

            return render({
                name: 'ExDialogContent',
                as: props.as,
                ourProps: {
                    ...customProps,
                    ...ownProps,
                    ...events,
                },
                slotProps: {},
                slots: ctx.slots,
            })
        }
    },
})
