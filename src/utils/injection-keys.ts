import type { InjectionKey } from 'vue'
import type { ExDropdownStateDefinition } from '../components/ExDropdown/definition'
import type { ExTooltipStateDefinition } from '../components/ExTooltip/definition'
import type { ExAutocompleteStateDefinition } from '../components/ExAutocomplete/definition'
import type { ExDrawerStateDefinition } from '../components/ExDrawer/definition'
import type { ExDialogStateDefinition } from '../components/ExDialog/definition'

export const ExDropdownContext = Symbol('ExDropdownContext') as InjectionKey<ExDropdownStateDefinition>
export const ExTooltipContext = Symbol('ExTooltipContext') as InjectionKey<ExTooltipStateDefinition>
export const ExAutocompleteContext = Symbol('ExAutocompleteContext') as InjectionKey<ExAutocompleteStateDefinition>
export const ExDrawerContext = Symbol('ExDrawerContext') as InjectionKey<ExDrawerStateDefinition>
export const ExDialogContext = Symbol('ExDialogContext') as InjectionKey<ExDialogStateDefinition>
