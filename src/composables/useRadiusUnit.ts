const useRadiusUnit = (radius: string | number | undefined) => {
    if (radius === undefined || radius === null) return ''

    const strRadius = radius.toString()
    const units = strRadius.split(' ').map(unit => {
        return unit.includes('px') || unit.includes('%') ? unit : unit + 'px'
    })

    return units.length === 1 ? units[0] : units.join(' ')
}
