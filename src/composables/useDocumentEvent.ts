import { computed, watchEffect, type ComputedRef } from 'vue'

export const useDocumentEvent = <T extends keyof DocumentEventMap>(
    type: T,
    listener: (this: Document, evt: DocumentEventMap[T]) => any,
    props?: {
        isActive?: ComputedRef<boolean>,
        options?: boolean | AddEventListenerOptions,
    },
) => {
    let invalidate: Function
    if (props && 'isActive' in props && (props?.isActive && props?.isActive.value === false)) {
        // @ts-expect-error
        if (invalidate) return invalidate(() => removeListener())
        return false
    }

    watchEffect((onInvalidate) => {
        document.addEventListener(type, listener, props?.options ?? false)
        invalidate = onInvalidate
        invalidate(() => removeListener())
    })

    function removeListener () {
        document.removeEventListener(type, listener, props?.options ?? false)
    }
}
