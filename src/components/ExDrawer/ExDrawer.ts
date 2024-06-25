import { computed, defineComponent, nextTick, provide, ref, watch, type SlotsType } from 'vue'
import { Keys } from '../../utils/keys'
import { useId } from '@/hooks/useId'
import { render } from '../../utils/render'
import { nextFrame } from '../../utils/creator'
import { ExPortal } from '../ExPortal/ExPortal'
import { MI_VISIBILITY_STATE } from '../../utils/states-ids'
import { ExDrawerContext } from '../../utils/injection-keys'
import { useDocumentEvent } from '../../composables/useDocumentEvent'
import { useTopMostZIndex } from '../../composables/useTopMostZIndex'
import { useOutsideClick } from '../../composables/useOutsideClick'
import { focusableSelectors } from '../../composables/useFocusManagement'

import type { ExDrawerStateDefinition } from './definition'

interface ExDrawerSlotProps {
    default: (props: {
        open: Function,
        close: Function,
        isOpen: boolean,
    }) => any
}

export const ExDrawer = defineComponent({
    name: 'ExDrawer',
    inheritAttrs: false,
    props: {
        as: { type: String, default: 'div' },
        modelValue: { type: Boolean, default: false },
        focusFirst: { type: Boolean, default: false },
        persistent: { type: Boolean, default: false },
        allowBodyScroll: { type: Boolean, default: false },
        transitionDuration: { type: [Number, String], default: 150 },
    },
    emits: {
        'update:modelValue': (_value: boolean) => true,
        onClose: (_value: boolean) => true,
    },
    slots: Object as SlotsType<ExDrawerSlotProps>,
    setup: (props, ctx) => {
        const showContent = ref(false)
        const focusTrapBtnRef = ref<HTMLElement | null>(null)
        const drawerRef = ref<HTMLElement | null>(null)
        const drawerCloseRef = ref<HTMLElement | null>(null)
        const drawerContentRef = ref<HTMLElement | null>(null)
        const drawerOverlayRef = ref<HTMLElement | null>(null)
        const isOpen = ref<ExDrawerStateDefinition['isOpen']['value']>(false)
        const closeButtonState = ref<ExDrawerStateDefinition['closeButtonState']['value']>('Active')
        const firstFocusableEl = ref<ExDrawerStateDefinition['firstFocusableEl']['value']>(null)
        const lastFocusableEl = ref<ExDrawerStateDefinition['lastFocusableEl']['value']>(null)
        const focusableEls = ref<ExDrawerStateDefinition['focusableEls']['value']>(null)

        const drawerId = `mi-drawer-${useId()}`
        const overlayId = `mi-drawer-${useId()}`

        const isPersistent = computed(() => props.persistent)
        const isCloseBtnActive = computed(() => closeButtonState.value === 'Active')

        const api: ExDrawerStateDefinition = {
            isOpen,
            showContent,
            isPersistent,

            drawerId,
            overlayId,

            drawerRef,
            drawerCloseRef,
            drawerContentRef,
            drawerOverlayRef,
            focusTrapBtnRef,

            firstFocusableEl,
            lastFocusableEl,
            focusableEls,

            closeButtonState,
            isCloseBtnActive,

            transitionDuration: props.transitionDuration,

            disableCloseBtn: () => {
                closeButtonState.value = 'Disabled'
            },
            enableCloseBtn: () => {
                closeButtonState.value = 'Active'
            },
            lockBody: () => {
                if (props.allowBodyScroll) return
                document.body.style.overflow = 'hidden'
            },
            unLockBody: () => {
                document.body.removeAttribute('style')
            },
            btnClose: () => {
                if (!api.isCloseBtnActive.value) return
                api.hideContent()
            },
            open: () => {
                api.lockBody()

                isOpen.value = true
                api.showContent.value = true
                nextTick(() => api.setFocusableEls())
            },
            close: () => {
                api.unLockBody()

                isOpen.value = false
                ctx.emit('update:modelValue', false)
                ctx.emit('onClose', isOpen.value)

                if (api.drawerRef.value) nextTick(() => api.drawerRef.value?.blur())
            },
            hideContent: () => {
                api.unLockBody()
                api.showContent.value = false
            },
            getContentZIndex: () => {
                return useTopMostZIndex()
            },
            setFocusableEls: () => {
                if (!api.drawerRef.value) return

                const elements: NodeListOf<HTMLElement> = api.drawerRef.value.querySelectorAll(focusableSelectors)
                api.focusableEls.value = Array.prototype.slice.call(elements)

                api.firstFocusableEl.value = api.focusableEls.value[0] as HTMLElement
                api.lastFocusableEl.value = api.focusableEls.value.slice(-1)[0] as HTMLElement

                if (!props.focusFirst) return focusDrawer()
                nextTick(() => api.firstFocusableEl.value?.focus())
            },
            hasPortalElements: () => {
                const selectors = ['[data-mi-dialog-content]', '[data-ex-tooltip-content]', '[data-mi-dropdown-list]'].join(', ')
                const portalElements = document.querySelectorAll(selectors)

                return portalElements ? portalElements.length : 0
            },
        }

        provide(ExDrawerContext, api)

        const focusDrawer = () => {
            if (!api.isOpen.value) return
            nextFrame(() => api.drawerRef.value?.focus())
        }

        const handleBlur = (evt: FocusEvent) => {
            evt.preventDefault()
            evt.stopPropagation()

            if (api.drawerRef.value?.contains(evt.target as Node)) return
            api.hideContent()
        }

        watch(() => props.modelValue, (value, oldValue) => {
            if (!value) {
                if (oldValue === undefined) return null
                api.hideContent()
                return null
            }

            api.open()
            nextFrame(() => useDocumentEvent('keydown', handleKeyDown))
        }, { immediate: true })

        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.code === Keys.Escape && !props.persistent) {
                evt.preventDefault()
                evt.stopPropagation()
                api.hideContent()
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

        const miDrawerExist = () => {
            const drawers = document.querySelectorAll('[data-mi-drawer]')
            return drawers && drawers.length
        }

        useOutsideClick(api.drawerRef, (evt, target) => {
            if (miDrawerExist() > 1) return
            if (api.hasPortalElements() || props.persistent) return

            api.hideContent()
        }, { isActive: computed(() => api.isOpen.value && api.showContent.value) })

        return () => {
            if (!api.isOpen.value && !api.showContent.value) return null

            const customProps = {
                ...ctx.attrs,
                ...ctx.emit,
                ...ctx.expose,
            }

            const slotProps = {
                open: api.open,
                close: () => api.isPersistent.value ? {} : api.hideContent(),
                isOpen: api.isOpen.value,
            }

            const events = {
                onblur: handleBlur,
            }

            const ownProps = {
                id: drawerId,
                ref: drawerRef,
                'data-mi-drawer': '',
                tabIndex: 0,
                style: {
                    position: 'fixed',
                    top: '0px',
                    left: '0px',
                    zIndex: useTopMostZIndex(),
                },
                [MI_VISIBILITY_STATE]: api.isOpen.value,
            }

            return render({
                name: 'ExPortal',
                as: ExPortal,
                ourProps: {},
                slotProps: {},
                slots: [
                    render({
                        name: 'ExDrawer',
                        as: props.as,
                        ourProps: {
                            ...customProps,
                            ...ownProps,
                            ...events,
                        },
                        slotProps,
                        slots: ctx.slots,
                    }),
                ],
            })
        }
    },
})
