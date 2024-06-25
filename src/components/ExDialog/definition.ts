import type { ComputedRef, Ref } from 'vue'
import type { ButtonStates } from './types'

export type ExDialogStateDefinition = {
    isOpen: Ref<boolean>,
    showContent: Ref<boolean>,
    isPersistent: ComputedRef<boolean>,

    dialogRef: Ref<HTMLElement | null>,
    dialogCloseRef: Ref<HTMLElement | null>,
    dialogContentRef: Ref<HTMLElement | null>,
    dialogOverlayRef: Ref<HTMLElement | null>,
    // dialogOverlayRef: Ref<HTMLElement | null>,

    firstFocusableEl: Ref<HTMLElement | null>,
    lastFocusableEl: Ref<HTMLElement | null>,
    focusableEls: Ref<HTMLElement[] | null>,

    transitionDuration: number | string,

    dialogId: string,
    contentId: string,
    overlayId: string,

    closeButtonState: Ref<ButtonStates>,
    isCloseBtnActive: ComputedRef<boolean>,
    enableCloseBtn(): void,
    disableCloseBtn(): void,
    btnCloseModal(): void,

    getContentZIndex(): number,

    hideDialogContent(): void,
    showDialogContent(): void,

    toggleDialog(): void,
    openModal(): void,
    closeModal(): void,
    setFocusableEls(): void,
    lockBody(): void,
    unLockBody(): void,
}
