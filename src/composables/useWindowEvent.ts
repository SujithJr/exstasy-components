import { watchEffect } from 'vue'

type EventOptionsType = {
    options?: boolean | AddEventListenerOptions,
    start?: boolean
}

export const useWindowEvent = <T extends keyof WindowEventMap>(
    type: T,
    listener: (this: Window, evt: WindowEventMap[T]) => any,
    eventOptions: EventOptionsType = { start: true },
) => {
    watchEffect((onInvalidate) => {
        onInvalidate(() => { })
        if (!eventOptions.start) {
            onInvalidate(() => window.removeEventListener(type, listener, eventOptions.options))
            return true
        }

        window.addEventListener(type, listener, eventOptions.options)
        onInvalidate(() => window.removeEventListener(type, listener, eventOptions.options))
    })
}
