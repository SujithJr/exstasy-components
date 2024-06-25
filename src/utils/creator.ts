export { h as createElement } from 'vue'

export const nextFrame = (cb: () => void) => {
    requestAnimationFrame(() => requestAnimationFrame(cb))
}
