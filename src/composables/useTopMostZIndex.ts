interface zIndexProps {
    selector?: string,
    increaseBy?: number
}

export const useTopMostZIndex = (props?: zIndexProps) => {
    const indices = []
    const increaseBy = props?.increaseBy || 2

    for (const element of Array.from(document.querySelectorAll(props?.selector || 'body *'))) {
        const zIndex = window.getComputedStyle(element).getPropertyValue('z-index')
        if (zIndex !== null && zIndex !== 'auto') {
            indices.push(Number(zIndex))
        }
    }

    return indices.length === 0 ? increaseBy : Math.max(...indices) + increaseBy
}
