import type { ComputedRef, Ref } from 'vue'
import type { ButtonStates } from './types'

export type ExDrawerStateDefinition = {
    isOpen: Ref<boolean>,
    showContent: Ref<boolean>,
    isPersistent: ComputedRef<boolean>,

    firstFocusableEl: Ref<HTMLElement | null>,
    lastFocusableEl: Ref<HTMLElement | null>,
    focusableEls: Ref<HTMLElement[] | null>,

    transitionDuration: number | string,

    drawerId: string,
    overlayId: string,

    focusTrapBtnRef: Ref<HTMLElement | null>,
    drawerRef: Ref<HTMLElement | null>,
    drawerCloseRef: Ref<HTMLElement | null>,
    drawerContentRef: Ref<HTMLElement | null>,
    drawerOverlayRef: Ref<HTMLElement | null>,

    closeButtonState: Ref<ButtonStates>,
    isCloseBtnActive: ComputedRef<boolean>,
    enableCloseBtn(): void,
    disableCloseBtn(): void,
    btnClose(): void,

    lockBody(): void,
    unLockBody(): void,

    getContentZIndex(): number
    hasPortalElements(): number

    open(): void,
    close(): void,
    hideContent(): void,
    setFocusableEls(): void,
}
