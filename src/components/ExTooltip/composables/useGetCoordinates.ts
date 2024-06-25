import type { CoordinatesType } from '../../../types'
import type { Ref } from 'vue'

export const useElCoordinates = (element: Ref<HTMLElement | null>): CoordinatesType | null => {
    const coordinates: CoordinatesType = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    if (!element.value) return null

    const { x, y, width, height, left, top } = element.value.getClientRects()[0]
    coordinates.x = x
    coordinates.y = y
    coordinates.width = width
    coordinates.height = height
    coordinates.left = left
    coordinates.top = top

    return coordinates
}
