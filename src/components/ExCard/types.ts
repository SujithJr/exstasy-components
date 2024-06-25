export type ExCardPropsType = {
    as: string
    tile: boolean
    size?: string | number
    width?: string | number
    minWidth?: string | number
    maxWidth?: string | number
    height?: string | number
    radius?: string | number
    maxHeight?: string | number
    minHeight?: string | number
}

export type ActiveLinkState = {
    isActive: boolean,
    isExactActive: boolean,
    tag: string | undefined,
    isRouterLink: boolean,
    href: string | null,
    onClick: Function | null,
}
