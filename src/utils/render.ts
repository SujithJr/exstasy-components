import { createElement } from './creator'
import { cloneVNode, Fragment, mergeProps, type Component, type RendererElement, type RendererNode, type Slots, type VNode } from 'vue'

type RenderProps = {
    name: string,
    as: string | Component,
    ourProps: Record<string, any>,
    slotProps: Record<string, any>,
    // slots: VNode<RendererNode, RendererElement, { [key: string]: any; }>[] | RendererNode | RendererNode[] | RendererElement | RendererElement[] | null
    slots: VNode<RendererNode, RendererElement, { [key: string]: any; }>[] | undefined | RendererNode | RendererNode[] | RendererElement | RendererElement[] | null
    // slots: Slots | VNode<RendererNode, RendererElement, { [key: string]: any; }>[] | null
}

export const render = (args: RenderProps) => {
    const incomingProps = mergeProps(args.ourProps)
    const { slots, slotProps } = args

    let children = Array.isArray(slots) ? slots : slots?.default?.(slotProps)
    if (args.as === 'template') {
        children = flattenFragments(children || [])

        if (Object.keys(incomingProps).length) {
            const [firstChild, ...restChildren] = children || []

            if (!isValidElement(firstChild) || restChildren.length > 0) {
                throw new Error(
                    [
                        'Passing props on "template"!',
                        '',
                        `The current component <${args.name} /> is rendering a "template".`,
                        'However we need to passthrough the following props:',
                        Object.keys(incomingProps)
                            .map((name) => name.trim())
                            .filter((current, idx, all) => all.indexOf(current) === idx)
                            .sort((a, z) => a.localeCompare(z))
                            .map((line) => `  - ${line}`)
                            .join('\n'),
                        '',
                        'You can apply a few solutions:',
                        [
                            'Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
                            'Render a single element as the child so that we can forward the props onto that element.',
                        ]
                            .map((line) => `  - ${line}`)
                            .join('\n'),
                    ].join('\n'),
                )
            }

            const mergedProps = mergeProps(firstChild.props || {}, incomingProps)
            const cloned = cloneVNode(firstChild, mergedProps, true)
            for (const prop in mergedProps) {
                if (prop.startsWith('on')) {
                    cloned.props ||= {}
                    cloned.props[prop] = mergedProps[prop]
                }
            }

            return cloned
        }

        if (Array.isArray(children) && children.length === 1) {
            return children[0]
        }

        return children
    }

    return createElement(
        args.as,
        Object.assign({}, incomingProps),
        { default: () => children },
    )
}

function flattenFragments (children: VNode[]): VNode[] {
    return children.flatMap((child) => {
        if (child.type === Fragment) {
            return flattenFragments(child.children as VNode[])
        }

        return [child]
    })
}

function isValidElement (input: any): boolean {
    if (input === null) return false // No children
    if (typeof input?.type === 'string') return true // 'div', 'span'..
    if (typeof input?.type === 'object') return true // Other components
    if (typeof input?.type === 'function') return true // Built-ins -> Transition
    return false // Comments, strings
}
