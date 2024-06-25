enum Units {
    vw = 'vw',
    vh = 'vh',
    rem = 'rem',
    em = 'em',
    inherit = 'inherit',
    auto = 'auto',
}

export const convertUnit = (value: string | number | undefined) => {
    return {
        toPx: () => {
            if (!value) return ''
            if (typeof value === 'number') return value + 'px'

            return ['inherit', 'auto'].includes(value) ? value : ''
        },
        toPercent: () => {
            if (!value) return ''
            if (typeof value === 'number') return value + '%'
            if (value.includes('%')) return value

            return ['inherit', 'auto'].includes(value) ? value : value + '%'
        },
        to: (unit: keyof typeof Units) => {
            if (!value) return ''
            return ['inherit', 'auto'].includes(unit) ? value : value + unit
        },
    }
}
