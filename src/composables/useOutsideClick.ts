import { computed, ref, type ComputedRef, type Ref, type ComponentPublicInstance } from 'vue'
import { useDocumentEvent } from './useDocumentEvent'
import { focusableSelectors } from './useFocusManagement'
import { useWindowEvent } from './useWindowEvent'
import { dom } from '../utils/dom'

type OptionsType = {
    isActive: ComputedRef<boolean>,
    containerId?: string
}

type Container = Ref<HTMLElement | null> | HTMLElement | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

export function useOutsideClick (
    elements: ContainerInput | (() => ContainerInput),
    cb: (event: MouseEvent | PointerEvent | FocusEvent | TouchEvent, target: HTMLElement) => void,
    options: OptionsType = { isActive: computed(() => true) },
) {
    const { isActive } = options

    const handleOutsideClick = <E extends MouseEvent | PointerEvent | FocusEvent | TouchEvent>(
        event: E,
        resolveTarget: (event: E) => HTMLElement | null,
    ) => {
        if (!isActive.value) return
        if (event.defaultPrevented) return

        const target = resolveTarget(event)
        if (target === null) return

        if (!target.getRootNode().contains(target)) return

        // Identify if elements is a function. If so, resolve them.
        const _elementsArray = (function resolve (elements): ContainerCollection {
            if (typeof elements === 'function') return resolve(elements)
            if (Array.isArray(elements)) return elements
            if (elements instanceof Set) return elements

            return [elements]
        })(elements)

        for (const container of _elementsArray) {
            if (container === null) continue

            const node = container instanceof HTMLElement ? container : dom(container)
            // Check if container is a ref
            // if ((container as { value: HTMLElement }).value.contains(target)) return
            if (node?.contains(target)) return
            if (event.composed && event.composedPath().includes(container as EventTarget)) return
        }

        const isFocusable = target.matches(focusableSelectors)
        if (target.tabIndex !== -1 && !isFocusable) {
            event.preventDefault()
        }

        return cb(event, target)
    }

    const initialClickTarget = ref<EventTarget | null>(null)

    useDocumentEvent('pointerdown', (event) => {
        if (!isActive.value) return
        initialClickTarget.value = event.target
    }, { options: true })

    useDocumentEvent('mousedown', (event) => {
        if (!isActive.value) return
        initialClickTarget.value = event.target
    }, { options: true })

    useDocumentEvent('click', (event) => {
        if (!initialClickTarget.value) return

        handleOutsideClick(event, () => initialClickTarget.value as HTMLElement)
        initialClickTarget.value = null
    }, { options: true })

    useWindowEvent('blur', (event) => {
        return handleOutsideClick(event, () => {
            return window.document.activeElement instanceof HTMLIFrameElement
                ? window.document.activeElement
                : null
        })
    }, { options: true })
}
