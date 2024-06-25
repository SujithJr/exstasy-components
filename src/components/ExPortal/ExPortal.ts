import { defineComponent, ref, Teleport, type Ref, onUnmounted, computed } from 'vue'
import { createElement } from '../../utils/creator'
import { MI_PORTAL_ID } from '../../utils/states-ids'

export const ExPortal = defineComponent({
    name: 'ExPortal',
    props: {
        target: { type: String, default: `#${MI_PORTAL_ID}` },
    },
    setup: (props, { slots }) => {
        const element = ref<HTMLElement | null>(null)
        const ownerDocument = computed(() => getOwnerDocument(element))
        const myTarget = ref(getPortalRoot(element.value, props.target))

        onUnmounted(() => {
            const root = ownerDocument.value?.querySelector(props.target || MI_PORTAL_ID)
            if (!root) return
            if (myTarget.value !== root) return

            if (myTarget.value.children.length <= 0) {
                myTarget.value.parentElement?.removeChild(myTarget.value)
            }
        })

        return () => {
            if (myTarget.value === null) return null

            const defaultSlots = slots.default ? slots?.default() : null
            return createElement(
                Teleport,
                { to: myTarget.value },
                [defaultSlots],
            )
        }
    },
})

const getPortalRoot = (element?: HTMLElement | null, targetId: string = `#${MI_PORTAL_ID}`) => {
    const ownerDocument = getOwnerDocument(element)
    if (!ownerDocument) {
        throw new Error(
            '[Ex Components]: Cannot find ownerDocument',
        )
    }

    const existingRoot = ownerDocument.querySelector(targetId)
    if (existingRoot) return existingRoot

    const root = ownerDocument.createElement('div')
    root.setAttribute('id', extractIdStr(targetId))

    return ownerDocument.body.appendChild(root)
}

const getOwnerDocument = <T extends HTMLElement | Ref<HTMLElement | null>>(element: T | null | undefined) => {
    if (element instanceof Node) return element.ownerDocument
    return document
}

const toId = (value: string) => {
    return value.startsWith('#') ? value : `#${value}`
}

const extractIdStr = (value: string) => {
    return value.startsWith('#') ? value.split('#')[1] : value
}
