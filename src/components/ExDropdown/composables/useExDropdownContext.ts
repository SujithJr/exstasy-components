import { inject } from 'vue'
import { ExDropdownContext } from '../../../utils/injection-keys'

export const useExDropdownContext = (component: String) => {
    const context = inject(ExDropdownContext, null)
    if (context === null) {
        const error = new Error(`<${component}> is missing a parent <ExDropdown/> component.`)
        if (Error.captureStackTrace) Error.captureStackTrace(error, useExDropdownContext)
        throw error
    }

    return context
}
