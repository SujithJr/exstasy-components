import { useWindowEvent } from '../../../composables/useWindowEvent'
import type { CoordinatesType } from '../../../types'
import { type Ref, ref, reactive } from 'vue'

type CallbackPrpsType = {
    x: string | number,
    y: string | number,
    vw: number,
    vh: number
    right: string | number,
}

enum AxisEnums { x, y, all }

const spaceCalculator = (space: string, axis: AxisEnums) => {
    let values: string[] = []

    if (axis === AxisEnums.all) {
        values = space.split(' ')
    }

    if (axis === AxisEnums.x) {
        values = space.split(' ').reverse().slice(0, 1)
    }

    if (axis === AxisEnums.y) {
        values = space.split(' ').slice(0, 1)
    }

    return values
        .map(i => parseInt(i.split('px')[0]))
        .reduce((acc, current) => acc + current, 0)
}

export const useEdgeDetection = (
    contentEl: Ref<HTMLElement | null>,
    triggerEl: Ref<HTMLElement | null>,
    cb: (cb: CallbackPrpsType) => void,
) => {
    const x = ref(0)
    const y = ref(0)
    const windowPadding = 5
    const right = ref<string | number>('auto')
    const resizeTimeout = ref<number | null>(null)
    const viewPort = reactive({ w: window.innerWidth, h: window.innerHeight })

    if (!contentEl || !triggerEl) return null
    if ((contentEl && !contentEl.value) || (triggerEl && !triggerEl.value)) return null

    useWindowEvent('resize', () => {
        if (resizeTimeout.value) clearTimeout(resizeTimeout.value)

        resizeTimeout.value = window.setTimeout(() => {
            viewPort.w = window.innerWidth
            viewPort.h = window.innerHeight
        }, 500)
    })

    const triggerCoords = triggerEl.value?.getBoundingClientRect() as CoordinatesType
    const contentCoords = contentEl.value?.getBoundingClientRect() as CoordinatesType
    const contentComputedStyles = window.getComputedStyle(contentEl.value as Element)
    const done = () => cb({ x: x.value, y: y.value, right: right.value, vw: viewPort.w, vh: viewPort.h })

    const calculateY = () => {
        const { margin, padding } = contentComputedStyles
        const contentSpaces = spaceCalculator(margin, AxisEnums.y) + spaceCalculator(padding, AxisEnums.y)

        if (viewPort.h - triggerCoords.bottom > (contentCoords.height + contentSpaces)) {
            return triggerCoords.bottom
        }

        return (viewPort.h - (contentCoords.height + contentSpaces)) - windowPadding
    }

    y.value = calculateY()

    const contentSpaces = spaceCalculator(contentComputedStyles.margin, AxisEnums.x)
    const rightValue = triggerCoords.right - (contentCoords.width - contentSpaces)
    right.value = rightValue < 0 ? 0 : rightValue

    // if (triggerCoords.right > contentCoords.width) {
    if (viewPort.w - triggerCoords.x > contentCoords.width) {
        x.value = triggerCoords.x
        return done()
    }

    x.value = (viewPort.w - contentCoords.width < 0) ? 0 : viewPort.w - contentCoords.width

    return done()
}
