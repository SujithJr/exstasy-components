type FieldValueType = number | string | undefined

export const usePxOrPercent = (value: FieldValueType) => {
    const result = { value: '', raw: [''], rawInt: [0] }

    if (value === undefined || value === null) return result
    if (value === 'inherit') return { value: 'inherit', raw: ['inherit'], rawInt: [0] }
    if (value === 'auto') return { value: 'auto', raw: ['auto'], rawInt: [0] }
    if (value && typeof value === 'string' && value.includes('calc')) return { value, raw: [value], rawInt: [0] }

    const strValue = value.toString()
    const numberedUnits = getNumberedValue(strValue)
    const units = strValue.split(' ').map(unit => {
        return unit.endsWith('px') || unit.endsWith('%') ? unit : unit + 'px'
    })

    return { value: units.join(' '), raw: units, rawInt: numberedUnits }

    // if (returnArray) return units

    // return units.length === 1 ? units[0] : units.join(' ')

    // const formattedValue = { value }
    // if (typeof value === 'number' || (typeof value === 'string' && !value.endsWith('px') && !value.endsWith('%'))) {
    //     formattedValue.value += 'px'
    // }

    // return formattedValue.value
}

const getNumberedValue = (strValue: string) => {
    return strValue
        .split(' ')
        .flatMap(i => i.includes('px') ? i.split('px') : i.split('%'))
        .map(i => i.trim())
        .filter(Boolean)
        .slice(0, 5)
        .map(Number)
}
