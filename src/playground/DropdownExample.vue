<script setup lang="ts">
import { ref } from 'vue'

const selectedValue = ref('Hello World')
function selectDropdown (value: string) {
    selectedValue.value = value
}

defineOptions({ name: 'DropdownExample' })
</script>

<template>
	<div>
		<h3 class="mb-1 text-base text-gray-600">Dropdown</h3>
		<ex-dropdown mode="slide-down">
			<ex-dropdown-trigger class="active:bg-zinc-100 bg-zinc-200 border-zinc-300 text-zinc-800 focus:ring-2 focus:ring-zinc-400 px-3 py-2 text-sm transition-all border rounded-md outline-none">
				{{ selectedValue }}
			</ex-dropdown-trigger>
			<ex-dropdown-list max-width="250" class="border-zinc-200 p-1 mt-0.5 bg-white border rounded-lg shadow-xl outline-none">
				<ex-dropdown-list-item v-slot="{ active }" as="template">
					<button
						@click="selectDropdown('First dropdown')"
						:class="[{ 'bg-zinc-100': active }]"
						type="button"
						class="w-full p-2 text-sm text-left rounded"
					>
						First dropdown
					</button>
				</ex-dropdown-list-item>
				<ex-dropdown-list-item v-slot="{ active }" as="template">
					<button
						@click="selectDropdown('Second dropdown')"
						:class="[{ 'bg-zinc-100': active }]"
						type="button"
						class="w-full p-2 text-sm text-left rounded"
					>
						Second dropdown
					</button>
				</ex-dropdown-list-item>
				<ex-dropdown-list-item v-slot="{ active }" as="template">
					<button
						@click="selectDropdown('Third dropdown')"
						:class="[{ 'bg-zinc-100': active }]"
						type="button"
						class="w-full p-2 text-sm text-left rounded"
					>
						Third dropdown
					</button>
				</ex-dropdown-list-item>
			</ex-dropdown-list>
		</ex-dropdown>
	</div>
</template>

<style scoped>
</style>
