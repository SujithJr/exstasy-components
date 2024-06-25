import { defineComponent, watch, type StyleValue } from 'vue'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { useExDrawerContext } from './composables/useExDrawerContext'
import { mergeIds } from '../../utils/states-ids'

export const ExDrawerContent = defineComponent({
    name: 'ExDrawerContent',
    props: {
        as: { type: String, default: 'div' },
    },
    setup: (props, ctx) => {
        const api = useExDrawerContext('ExDrawerContent')
        const contentAreaId = `mi-drawer-content-${useId()}`

        watch(api.showContent, (value) => {
            if (value === false) {
                setTimeout(() => api.close(), Number(api.transitionDuration) ?? 0)
            }
        }, { immediate: true })

        const handleBlur = (evt: FocusEvent) => {
            evt.preventDefault()
            evt.stopPropagation()

            if (api.drawerRef.value?.contains(evt.target as Node)) return
            if (api.hasPortalElements()) return

            api.hideContent()
        }

        return () => {
            if (!api.showContent.value) return null

            const events = { onblur: handleBlur }
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const ownProps = {
                id: mergeIds(contentAreaId, (ctx.attrs?.id as string) || ''),
                ref: api.drawerContentRef,
                style: { zIndex: api.getContentZIndex() } as StyleValue,
            }

            return render({
                name: 'ExDrawerContent',
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
