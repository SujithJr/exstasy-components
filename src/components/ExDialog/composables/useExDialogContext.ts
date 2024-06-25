import { inject } from 'vue'
import { ExDialogContext } from '../../../utils/injection-keys'

export const useExDialogContext = (component: string) => {
    const context = inject(ExDialogContext, null)
    if (context === null) {
        const error = new Error(`<${component}> is missing a parent <ExDialog /> component.`)
        if (Error.captureStackTrace) Error.captureStackTrace(error, useExDialogContext)
        throw error
    }

    return context
}
