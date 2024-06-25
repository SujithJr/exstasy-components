<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const list = [
    { id: 1, value: 'First Dropdown' },
    { id: 2, value: 'Second Dropdown' },
    { id: 3, value: 'Third Dropdown' },
]

const query = ref('')
const selectedValue = ref(list[0])
function searchValue (evt: Event & { target: HTMLInputElement }) {
    query.value = evt.target.value
}

function getDisplayValue (item: { value: string }) {
    return item?.value ?? ''
}

const listFiltered = reactive(list)
const filteredListItems = computed(() => {
    if (!query.value.trim()) return listFiltered

    return listFiltered.filter(item => {
        return item.value.toLowerCase().includes(query.value.toLowerCase())
    })
})

defineOptions({ name: 'DropdownExample' })
</script>

<template>
	<div>
		<h3 class="mb-1 text-base text-gray-600">Autocomplete {{ selectedValue }}</h3>
		<ex-autocomplete
			v-model="selectedValue"
			mode="slide-down"
			clearable
		>
			<ex-autocomplete-input
				@change="searchValue"
				type="text"
				placeholder="Select something.."
				class="active:bg-zinc-100 bg-zinc-200 focus:bg-white border-zinc-300 text-zinc-800 focus:ring-2 focus:ring-zinc-400 px-3 py-2 text-sm transition-all border rounded-md outline-none"
			/>
			<ex-autocomplete-list max-width="250" class="border-zinc-200 p-1 mt-0.5 bg-white border rounded-lg shadow-xl outline-none">
				<template v-if="filteredListItems.length">
					<ex-autocomplete-list-item
						v-for="listItem in filteredListItems"
						v-slot="{ active }"
						:key="listItem.id"
						:value="listItem"
						as="template"
					>
						<button
							:class="[{ 'bg-zinc-100': active }]"
							type="button"
							class="w-full p-2 text-sm text-left text-gray-700 rounded"
						>
							{{ listItem.value }}
						</button>
					</ex-autocomplete-list-item>
				</template>
				<ex-autocomplete-list-item v-else as="template">
					<button
						type="button"
						class="w-full p-2 text-sm text-left text-gray-400 rounded"
					>
						No Data Found
					</button>
				</ex-autocomplete-list-item>
			</ex-autocomplete-list>
		</ex-autocomplete>
	</div>
</template>

<style scoped>
</style>
