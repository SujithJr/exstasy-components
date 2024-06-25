import { defineComponent, provide, ref, watch, nextTick, computed, type PropType, type SlotsType } from 'vue'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { mergeIds } from '../../utils/states-ids'
import { ExTooltipContext } from '../../utils/injection-keys'
import { useEdgeDetection } from './composables/useEdgeDetection'

import type { ContentStyleTypes, NudgeTypes } from '../../types'
import type { ExTooltipStateDefinition } from './definition'

/*
    TODO: Provide the following properties
    // TODO: 1. nudge-{top,right,bottom,left}: value
    TODO: 2. Enable/disable tooltip based on v-model
*/

interface ExTooltipSlotProps {
    default: (props: {
        isOpen: boolean
    }) => any
}

export const ExTooltip = defineComponent({
    name: 'ExTooltip',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'template' },
        /* TODO: Enable v-model based tooltip */
        // modelValue: { type: Boolean, default: undefined },
        disabled: { type: Boolean, default: false },
        delay: { type: [Number, String], default: 200 },
        mode: { type: String, default: 'fade' },
        disableTransition: { type: Boolean, default: false },
        transitionDuration: { type: [Number, String], default: 150 },
        nudge: {
            type: Object as PropType<NudgeTypes>,
            // default: () => ({ top: 5, right: 5, bottom: 5, left: 5 }),
            default: () => ({ top: 5, right: 0, bottom: 5, left: 0 }),
        },
        top: { type: Boolean, default: false },
        right: { type: Boolean, default: false },
        bottom: { type: Boolean, default: false },
        left: { type: Boolean, default: false },
    },
    slots: Object as SlotsType<ExTooltipSlotProps>,
    setup: (props, ctx) => {
        // const resizeTimeout = ref<number | null>(null)

        const isVisible = ref<ExTooltipStateDefinition['isVisible']['value']>(false)
        const triggerRef = ref<ExTooltipStateDefinition['triggerRef']['value']>(null)
        const contentRef = ref<ExTooltipStateDefinition['contentRef']['value']>(null)
        const showContent = ref<ExTooltipStateDefinition['showContent']['value']>(false)
        const contentStyles = ref<ContentStyleTypes>({ left: 0, top: 0, minWidth: 'auto', maxWidth: 'auto' })
        const tooltipDelay = ref(props.delay)
        const getTooltipDelay = computed(() => {
            return typeof tooltipDelay.value === 'string' ?
                parseInt(tooltipDelay.value)
                : tooltipDelay.value
        })

        // const vModelTrigger = computed(() => props.modelValue !== undefined)

        const api: ExTooltipStateDefinition = {
            // hasVModel: vModelTrigger,
            parentId: `ex-tooltip-parent-${useId()}`,
            triggerId: `ex-tooltip-trigger-${useId()}`,
            contentId: `ex-tooltip-content-${useId()}`,

            triggerRef,
            contentRef,
            showContent,
            isVisible,
            getTooltipDelay,
            contentStyles,

            mode: props.mode,
            transitionDuration: props.transitionDuration,
            disableTransition: props.disableTransition,

            left: props.left,
            right: props.right,
            top: props.top,
            bottom: props.bottom,

            showTooltipContent: () => {
                if (props.disabled) return
                if (showContent.value) return

                showContent.value = true
                api.showTooltip()
            },
            hideTooltipContent: () => {
                if (props.disabled) return
                showContent.value = false
                api.hideTooltip()
            },
            showTooltip: () => {
                api.isVisible.value = true
            },
            hideTooltip: () => {
                setTimeout(() => {
                    api.isVisible.value = false
                }, api.disableTransition ? 0 : Number(api.transitionDuration) ?? 150)
            },
        }

        provide(ExTooltipContext, api)

        watch(() => showContent.value, (value) => {
            if (!value) return
            nextTick(() => detectScreenEdges())
        })

        watch(api.isVisible, (value) => {
            if (value === false) {
                setTimeout(() => {
                    api.hideTooltipContent()
                }, api.disableTransition ? 0 : Number(api.transitionDuration) ?? 150)
            }
        }, { immediate: true })

        const detectScreenEdges = () => {
            useEdgeDetection(api.contentRef, api.triggerRef, (x, y) => {
                contentStyles.value.left = x + 'px' || 'auto'
                contentStyles.value.top = y + 'px' || 'auto'
            }, {
                position: {
                    top: props.top,
                    right: props.right,
                    bottom: props.bottom,
                    left: props.left,
                },
                nudges: {
                    top: props.nudge.top,
                    right: props.nudge.right,
                    bottom: props.nudge.bottom,
                    left: props.nudge.left,
                },
            }, api.showContent.value)
        }

        // useWindowEvent('keydown', (evt: KeyboardEvent) => {
        // }, { start: api.showContent.value })

        /**
         * TODO: Enable v-model based tooltip
         */
        // useWindowEvent('resize', () => {
        //     if (!api.hasVModel.value) return
        //     detectScreenEdges()
        // }, { start: api.hasVModel.value })

        return () => {
            const slotProps = { isOpen: showContent.value }
            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const ownProps = {
                id: mergeIds(api.parentId, (ctx.attrs?.id as string) || ''),
            }

            return render({
                name: 'ExTooltip',
                as: props.as,
                ourProps: props.as !== 'template' ? { ...customProps, ...ownProps } : {},
                slotProps: slotProps,
                slots: ctx.slots,
            })
        }
    },
})
