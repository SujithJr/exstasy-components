export const MI_PORTAL_ID = 'mi-portal'
export const MI_PORTAL_ROOT_ID = 'mi-portal-root'
export const MI_VISIBILITY_STATE = 'data-mi-visiblity-state'

export const mergeIds = (initial: string, ids: string | string[]): string => {
    if (typeof ids === 'string') return initial + (ids.trim() ? ' ' + ids : '')

    return initial + (ids.length ? ' ' + ids.join(' ') : '')
}
export const toRawId = (value: string) => `#${value}`
export const toRawClass = (value: string) => `.${value}`
