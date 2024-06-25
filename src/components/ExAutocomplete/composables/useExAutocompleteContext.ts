import { inject } from 'vue'
import { ExAutocompleteContext } from '../../../utils/injection-keys'

export const useExAutocompleteContext = (component: String) => {
    const context = inject(ExAutocompleteContext, null)
    if (context === null) {
        const error = new Error(`<${component}> is missing a parent <ExAutocomplete /> component.`)
        if (Error.captureStackTrace) Error.captureStackTrace(error, useExAutocompleteContext)
        throw error
    }

    return context
}
