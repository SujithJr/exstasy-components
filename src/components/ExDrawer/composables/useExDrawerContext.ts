import { inject } from 'vue'
import { ExDrawerContext } from '../../../utils/injection-keys'

export const useExDrawerContext = (component: string) => {
    const context = inject(ExDrawerContext, null)
    if (context === null) {
        const error = new Error(`<${component}> is missing a parent <ExDrawer /> component.`)
        if (Error.captureStackTrace) Error.captureStackTrace(error, useExDrawerContext)
        throw error
    }

    return context
}
