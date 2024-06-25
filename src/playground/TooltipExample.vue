<script setup lang="ts">
defineOptions({ name: 'DropdownExample' })
</script>

<template>
	<div>
		<h3 class="mb-1 text-base text-gray-600">Tooltip</h3>
		<ex-tooltip
			mode="slide-down"
			bottom
		>
			<ex-tooltip-trigger>
				<button class="active:bg-zinc-100 bg-zinc-200 border-zinc-300 text-zinc-800 focus:ring-2 focus:ring-zinc-400 px-3 py-2 text-sm transition-all border rounded-md outline-none">
					Example Tooltip
				</button>
			</ex-tooltip-trigger>
			<ex-tooltip-content
				as="div"
				class="p-2 px-3 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-xl"
			>
				Hello World
			</ex-tooltip-content>
		</ex-tooltip>
	</div>
</template>

<style scoped>
</style>
