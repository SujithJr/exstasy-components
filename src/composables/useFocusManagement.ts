export const focusableSelectors = [
    '[contentEditable=true]',
    'a[href]',
    'area[href]',
    '[tabindex]',
    'iframe',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
].join(', ')

export enum Focus {
    First,
    Last,
    Previous,
    Next,
    Specific,
    Nothing
}

export const calculateActiveIndex = <T>(
    focusAction: { focus: Focus.Specific, id?: string } | { focus: Exclude<Focus, Focus.Specific> },
    resolvers: {
        resolveItems(): T[],
        resolveActiveIndex(): number | null,
        resolveId(item: T): string,
    },
) => {
    const items = resolvers.resolveItems()
    if (items.length <= 0) return null

    const currentActiveIndex = resolvers.resolveActiveIndex()
    const activeIndex = currentActiveIndex ?? -1

    const calculateIndex = (() => {
        switch (focusAction.focus) {
            case Focus.First: {
                return 0
            }

            case Focus.Last: {
                return items.length - 1
            }

            case Focus.Next: {
                if (activeIndex === (items.length - 1)) return 0
                if (activeIndex === -1) return currentActiveIndex
                return activeIndex + 1
            }

            case Focus.Previous: {
                if (activeIndex === 0) return items.length - 1
                if (activeIndex === -1) return currentActiveIndex
                return activeIndex - 1
            }

            case Focus.Specific: {
                return items.findIndex(i => resolvers.resolveId(i) === focusAction.id)
            }

            case Focus.Nothing: {
                return null
            }

            default: {
                throw new Error('Unexpected object: ' + focusAction)
            }
        }
    })()

    // return calculateIndex === -1 ? currentActiveIndex : calculateIndex
    return calculateIndex === -1 || calculateIndex === null ? 0 : calculateIndex
}
