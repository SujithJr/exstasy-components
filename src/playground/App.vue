<script setup lang="ts">
import AutocompleteExample from './AutocompleteExample.vue'
import DropdownExample from './DropdownExample.vue'
import TooltipExample from './TooltipExample.vue'

defineOptions({ name: 'App' })
</script>

<template>
	<div class="bg-zinc-100 min-h-screen p-8 space-y-6">
		<dropdown-example />

		<autocomplete-example />

		<tooltip-example />
	</div>
</template>
