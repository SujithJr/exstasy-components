import { inject } from 'vue'
import { ExTooltipContext } from '../../../utils/injection-keys'

export const useExTooltipContext = (component: string) => {
    const context = inject(ExTooltipContext, null)
    if (context === null) {
        const error = new Error(`<${component}> is missing a parent <ExTooltip /> component.`)
        if (Error.captureStackTrace) Error.captureStackTrace(error, useExTooltipContext)
        throw error
    }

    return context
}
