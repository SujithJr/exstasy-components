import type { Slot } from 'vue'

export type CoordinatesType = {
    x: number,
    y: number,
    top: number,
    left: number,
    right: number,
    bottom: number,
    height: number,
    width: number,
}

export type ComponentSlots = {
    default: Slot,
}

export type ContentStyleTypes = {
    left: number | string,
    top: number | string,
    minWidth: number | string,
    maxWidth: number | string,
}

export type NudgeTypes = {
    top?: number,
    right?: number,
    bottom?: number,
    left?: number
}

export type OptionsType = {
    position?: { left?: boolean, right?: boolean, top?: boolean, bottom?: boolean },
    nudges?: NudgeTypes
}
