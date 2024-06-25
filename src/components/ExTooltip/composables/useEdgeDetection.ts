import { dom } from '../../../utils/dom'
import { useWindowEvent } from '../../../composables/useWindowEvent'

import type { CoordinatesType, OptionsType } from '../../../types'
import { type Ref, ref, reactive } from 'vue'

export const useEdgeDetection = (
    contentEl: Ref<HTMLElement | null>,
    triggerEl: Ref<HTMLElement | null>,
    cb: (x: string | number, y: string | number) => void,
    options: OptionsType,
    // position: { left?: boolean, right?: boolean, top?: boolean, bottom?: boolean },
    isActive: boolean,
) => {
    const x = ref(0)
    const y = ref(0)
    const resizeTimeout = ref<number | null>(null)
    const viewPort = reactive({ w: window.innerWidth, h: window.innerHeight })
    const { position, nudges } = options
    const offNudges = {
        top: nudges?.top || 0,
        right: nudges?.right || 0,
        bottom: nudges?.bottom || 0,
        left: nudges?.left || 0,
    }

    if (!isActive) return
    if (!contentEl || !triggerEl || (!contentEl.value) || (!triggerEl.value)) return null

    useWindowEvent('resize', () => {
        if (resizeTimeout.value) clearTimeout(resizeTimeout.value)

        resizeTimeout.value = window.setTimeout(() => {
            viewPort.w = window.innerWidth
            viewPort.h = window.innerHeight
        }, 500)
    })

    const triggerCoords = dom(triggerEl)?.getClientRects()[0] as CoordinatesType
    const contentCoords = dom(contentEl)?.getClientRects()[0] as CoordinatesType
    const contentComputedStyles = window.getComputedStyle(contentEl.value as Element)
    const contentMarginTop = parseInt(contentComputedStyles.marginTop.split('px')[0])
    const contentMarginBottom = parseInt(contentComputedStyles.marginBottom.split('px')[0])
    const contentMargins = contentMarginTop + contentMarginBottom
    const done = () => cb(x.value, y.value)

    if (position?.right) {
        y.value = triggerCoords.y + ((triggerCoords.height - (contentCoords.height + contentMargins)) / 2)
        x.value = triggerCoords.width + triggerCoords.x

        if (offNudges.bottom) y.value += offNudges.bottom
        if (offNudges.top) y.value -= offNudges.top

        if ((viewPort.w - triggerCoords.right) > contentCoords.width) {
            x.value = (x.value + offNudges.right) - offNudges.left
            return done()
        }

        /** TODO: Decide if flip is needed --?
        * i.e, When a left positioned tooltip gets cramped for width on the left, then
        * check if there is any width left to hold the tooltip content on the right.
        * If yes? then flip the tooltip content to the right side.
        */
        // if ((triggerCoords.x - contentCoords.width) <= 0) {
        //     x.value = (viewPort.w - contentCoords.width)
        //     return done()
        // }

        // x.value = (triggerCoords.x - contentCoords.width) - offset

        x.value = ((viewPort.w - contentCoords.width) - offNudges.right) - offNudges.left
        return done()
    }

    if (position?.left) {
        y.value = triggerCoords.y + ((triggerCoords.height - (contentCoords.height + contentMargins)) / 2)
        x.value = triggerCoords.x - contentCoords.width

        if (offNudges.bottom) y.value += offNudges.bottom
        if (offNudges.top) y.value -= offNudges.top

        if (triggerCoords.x > contentCoords.width) {
            x.value = (x.value - offNudges.left) + offNudges.right
            return done()
        }

        /** TODO: Decide if flip is needed --?
        * i.e, When a left positioned tooltip gets cramped for width on the left, then
        * check if there is any width left to hold the tooltip content on the right.
        * If yes? then flip the tooltip content to the right side.
        */
        // if (viewPort.w - triggerCoords.right > contentCoords.width) {
        //     console.log('2')
        //     x.value = triggerCoords.right + offset
        //     return done()
        // }

        x.value = offNudges.left - offNudges.right
        return done()
    }

    if (position?.top) {
        y.value = triggerCoords.top < (contentCoords.height + contentMargins) ?
            offNudges.top :
                ((triggerCoords.top - (contentCoords.height + contentMargins)) - offNudges.top)

        if ((viewPort.w - triggerCoords.right) < contentCoords.width) {
            x.value = (viewPort.w - contentCoords.width) - 5
            return done()
        }

        if ((triggerCoords.x - ((contentCoords.width - triggerCoords.width) / 2)) < 5) {
            x.value = 5
            return done()
        }

        x.value = triggerCoords.x - ((contentCoords.width - triggerCoords.width) / 2)

        if (offNudges.bottom) y.value += offNudges.bottom
        if (offNudges.left) x.value -= offNudges.left
        if (offNudges.right) x.value += offNudges.right

        return done()
    }

    if (position?.bottom) {
        // Check viewport height is greater than, trigger's bottom + content's height
        // Yes? -> Add trigger's bottom as Y value
        // No? -> Subtract content's height plus offset with viewport's height
        y.value = viewPort.h >= (triggerCoords.bottom + (contentCoords.height + contentMargins)) ?
            triggerCoords.bottom :
                (viewPort.h - (contentCoords.height + contentMargins))

        if ((viewPort.w - triggerCoords.right) < contentCoords.width) {
            x.value = (viewPort.w - contentCoords.width) - 5
            return done()
        }

        if ((triggerCoords.x - ((contentCoords.width - triggerCoords.width) / 2)) < 5) {
            x.value = 5
            return done()
        }

        x.value = triggerCoords.x - ((contentCoords.width - triggerCoords.width) / 2)

        if (offNudges.bottom) y.value += offNudges.bottom
        if (offNudges.top) y.value -= offNudges.top
        if (offNudges.left) x.value -= offNudges.left
        if (offNudges.right) x.value += offNudges.right

        return done()
    }
}
