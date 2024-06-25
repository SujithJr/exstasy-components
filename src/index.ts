import type { App } from 'vue'

import * as components from './components'

const install = (app: App) => {
    for (const key in components) {
        // @ts-expect-error
        app.component(key, components[key])
    }
}

export default { install }

export * from './components'

declare module 'vue' {
    export interface GlobalComponents {
        ExAvatar: typeof components.ExAvatar
        ExCard: typeof components.ExCard
        ExDrawer: typeof components.ExDrawer
        ExDrawerContent: typeof components.ExDrawerContent
        ExDrawerClose: typeof components.ExDrawerClose
        ExDrawerOverlay: typeof components.ExDrawerOverlay
        ExDialog: typeof components.ExDialog
        ExDialogClose: typeof components.ExDialogClose
        ExDialogContent: typeof components.ExDialogContent
        ExDialogOverlay: typeof components.ExDialogOverlay
        ExTooltip: typeof components.ExTooltip
        ExTooltipTrigger: typeof components.ExTooltipTrigger
        ExTooltipContent: typeof components.ExTooltipContent
        ExDropdown: typeof components.ExDropdown
        ExDropdownTrigger: typeof components.ExDropdownTrigger
        ExDropdownList: typeof components.ExDropdownList
        ExDropdownListItem: typeof components.ExDropdownListItem
        ExAutocomplete: typeof components.ExAutocomplete
        ExAutocompleteInput: typeof components.ExAutocompleteInput
        ExAutocompleteList: typeof components.ExAutocompleteList
        ExAutocompleteListItem: typeof components.ExAutocompleteListItem
    }
}

// export * from './components/ExDropdown/definition'
// export * from './components/ExAutocomplete/definition'
// export * from './components/ExTooltip/definition'

// export * from './utils/injection-keys'
