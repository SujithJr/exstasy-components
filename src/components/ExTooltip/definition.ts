import type { ContentStyleTypes } from '../../types'
import type { ComputedRef, Ref } from 'vue'

export type ExTooltipStateDefinition = {
    // hasVModel: Ref<boolean>,
    triggerRef: Ref<HTMLElement | null>,
    contentRef: Ref<HTMLElement | null>,
    showContent: Ref<boolean>,
    isVisible: Ref<boolean>,
    getTooltipDelay: ComputedRef<number>,

    parentId: string,
    triggerId: string,
    contentId: string,

    left: boolean,
    right: boolean,
    top: boolean,
    bottom: boolean,

    mode: string,
    transitionDuration: number | string,
    disableTransition: boolean,
    contentStyles: Ref<ContentStyleTypes>,

    showTooltipContent(): void,
    hideTooltipContent(): void,
    showTooltip(): void,
    hideTooltip(): void,
}
