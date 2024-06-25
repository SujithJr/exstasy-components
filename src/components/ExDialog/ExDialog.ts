import { defineComponent, provide, ref, watch, nextTick, computed, type StyleValue, type SlotsType } from 'vue'
import { Keys } from '../../utils/keys'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { nextFrame } from '../../utils/creator'
import { ExPortal } from '../ExPortal/ExPortal'
import { ExDialogContext } from '../../utils/injection-keys'
import { useOutsideClick } from '../../composables/useOutsideClick'
import { useTopMostZIndex } from '../../composables/useTopMostZIndex'
import { useDocumentEvent } from '../../composables/useDocumentEvent'
import { MI_VISIBILITY_STATE, mergeIds } from '../../utils/states-ids'
import { focusableSelectors } from '../../composables/useFocusManagement'

import type { ExDialogStateDefinition } from './definition'

interface ExDialogSlotProps {
    default: (props: {
        isOpen: boolean,
        closeDialog: Function,
    }) => any
}

export const ExDialog = defineComponent({
    name: 'ExDialog',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'div' },
        modelValue: { type: Boolean, default: true },
        focusFirst: { type: Boolean, default: false },
        persistent: { type: Boolean, default: false },
        transitionDuration: { type: [Number, String], default: 150 },
    },
    emits: {
        'update:modelValue': (_close: boolean) => true,
        onClose: (_close: boolean) => true,
    },
    slots: Object as SlotsType<ExDialogSlotProps>,
    setup: (props, ctx) => {
        const showContent = ref(false)
        const isOpen = ref<ExDialogStateDefinition['isOpen']['value']>(false)
        const closeButtonState = ref<ExDialogStateDefinition['closeButtonState']['value']>('Active')
        const dialogRef = ref<ExDialogStateDefinition['dialogRef']['value']>(null)
        const dialogCloseRef = ref<ExDialogStateDefinition['dialogCloseRef']['value']>(null)
        const dialogContentRef = ref<ExDialogStateDefinition['dialogContentRef']['value']>(null)
        const dialogOverlayRef = ref<ExDialogStateDefinition['dialogOverlayRef']['value']>(null)
        const firstFocusableEl = ref<ExDialogStateDefinition['firstFocusableEl']['value']>(null)
        const lastFocusableEl = ref<ExDialogStateDefinition['lastFocusableEl']['value']>(null)
        const focusableEls = ref<ExDialogStateDefinition['focusableEls']['value']>(null)
        const isCloseBtnActive = computed(() => closeButtonState.value === 'Active')
        const isPersistent = computed(() => props.persistent)

        const api: ExDialogStateDefinition = {
            isOpen,
            showContent,
            isPersistent,
            closeButtonState,

            dialogRef,
            dialogCloseRef,
            dialogContentRef,
            dialogOverlayRef,
            firstFocusableEl,
            lastFocusableEl,
            focusableEls,

            transitionDuration: props.transitionDuration,

            dialogId: `mi-dialog-${useId()}`,
            contentId: `mi-dialog-content-${useId()}`,
            overlayId: `mi-dialog-overlay-${useId()}`,

            isCloseBtnActive,
            disableCloseBtn: () => {
                closeButtonState.value = 'Disabled'
            },
            enableCloseBtn: () => {
                closeButtonState.value = 'Active'
            },
            lockBody: () => {
                document.body.style.overflow = 'hidden'
            },
            unLockBody: () => {
                document.body.removeAttribute('style')
            },
            btnCloseModal: () => {
                if (!api.isCloseBtnActive.value) return
                api.hideDialogContent()
            },
            toggleDialog: () => {
                isOpen.value = !isOpen.value
            },
            openModal: () => {
                api.lockBody()

                isOpen.value = true
                api.showDialogContent()
                nextTick(() => api.setFocusableEls())
            },
            closeModal: () => {
                api.unLockBody()

                isOpen.value = false
                ctx.emit('update:modelValue', isOpen.value)
                ctx.emit('onClose', isOpen.value)

                if (api.dialogRef.value) nextTick(() => api.dialogRef.value?.blur())
            },
            hideDialogContent: () => {
                api.unLockBody()
                api.showContent.value = false
            },
            showDialogContent: () => {
                api.showContent.value = true
            },
            getContentZIndex: () => {
                return useTopMostZIndex()
            },
            setFocusableEls: () => {
                if (!api.dialogRef.value) return

                const elements: NodeListOf<HTMLElement> = api.dialogRef.value.querySelectorAll(focusableSelectors)
                api.focusableEls.value = Array.prototype.slice.call(elements)

                api.firstFocusableEl.value = api.focusableEls.value[0] as HTMLElement
                api.lastFocusableEl.value = api.focusableEls.value.slice(-1)[0] as HTMLElement

                if (!props.focusFirst) return focusDialogBox()
                nextTick(() => api.firstFocusableEl.value?.focus())
            },
        }

        provide(ExDialogContext, api)

        watch(() => props.modelValue, (value, oldValue) => {
            if (!value) {
                if (oldValue === undefined) return null
                api.hideDialogContent()
                return null
            }

            api.openModal()
            useDocumentEvent('keydown', handleKeyDown)
        }, { immediate: true })

        // TODO: Analyze if this method is needed
        // const handleBlur = (evt: FocusEvent) => {
        // evt.preventDefault()
        // evt.stopPropagation()

        // if (
        //     api.dialogRef.value?.contains(evt.target as Node) ||
        //     api.dialogContentRef.value?.contains(evt.target as Node)
        // ) return

        // api.hideDialogContent()
        // }

        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.code === Keys.Escape && !props.persistent) {
                evt.preventDefault()
                evt.stopPropagation()
                api.hideDialogContent()
            }

            if (evt.code === Keys.Tab) {
                if (api.focusableEls.value?.length === 1) {
                    evt.preventDefault()
                    return api.firstFocusableEl.value?.focus()
                }

                if (evt.shiftKey) return handleBackwardTab(evt)
                return handleForwardTab(evt)
            }
        }

        const handleBackwardTab = (evt: KeyboardEvent) => {
            if (document.activeElement === api.firstFocusableEl.value) {
                evt.preventDefault()
                api.lastFocusableEl.value?.focus()
            }
        }

        const handleForwardTab = (evt: KeyboardEvent) => {
            if (document.activeElement === api.lastFocusableEl.value) {
                evt.preventDefault()
                api.firstFocusableEl.value?.focus()
            }
        }

        const focusDialogBox = () => {
            if (!api.isOpen.value) return
            nextFrame(() => api.dialogRef.value?.focus())
        }

        useOutsideClick(
            [api.dialogRef, api.dialogContentRef],
            (event, target) => {
                event.preventDefault()
                event.stopPropagation()
                if (props.persistent) return

                api.hideDialogContent()
            },
            { isActive: computed(() => api.isOpen.value && api.showContent.value) },
        )

        return () => {
            if (!api.isOpen.value && !api.showContent.value) return null

            // TODO: Analyze if onblur event is needed
            // const events = { onblur: handleBlur }

            const customProps = { ...ctx.attrs, ...ctx.emit, ...ctx.expose }
            const ownProps = {
                ref: api.dialogRef,
                id: mergeIds(api.dialogId, (ctx.attrs?.id as string) || ''),
                tabIndex: 0,
                role: 'dialog',
                'data-mi-dialog-content': '',
                [MI_VISIBILITY_STATE]: api.isOpen.value,
                style: {
                    position: 'fixed',
                    top: '0px',
                    left: '0px',
                    zIndex: useTopMostZIndex(),
                } as StyleValue,
            }

            const slotProps = {
                isOpen: api.isOpen.value,
                closeDialog: () => api.isPersistent.value ? {} : api.hideDialogContent(),
            }

            return render({
                name: 'ExPortal',
                as: ExPortal,
                ourProps: {},
                slotProps: {},
                slots: [
                    render({
                        name: 'ExDialog',
                        as: 'div',
                        ourProps: {
                            ...customProps,
                            ...ownProps,
                        },
                        slotProps,
                        slots: ctx.slots,
                    }),
                ],
            })
        }
    },
})
