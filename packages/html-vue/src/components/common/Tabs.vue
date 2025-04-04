<template>
	<div
		class="flex items-center gap-2 w-full border-b-2 border-gray-100"
	>
		<button
			v-for="option in props.options"
			:key="option.value"
			:disabled="option.disabled"
			:class="[
				'flex items-center justify-center gap-2 py-2 px-6 -mb-0.5 text-sm rounded-t-lg border-b-2 border-transparent text-gray-500 outline-hidden cursor-pointer',
				model === option.value && 'border-b-gray-500 text-gray-900 bg-gray-50',
				'transition-colors duration-150',
				'disabled:opacity-50 disabled:cursor-not-allowed'
			]"
			@click="() => model = option.value"
		>
			{{ option.label }}
		</button>
	</div>
</template>

<script setup lang="ts">

interface Props {
	options: Array<{
		label: string;
		value: string;
		disabled?: boolean;
	}>;
}

const model = defineModel<string>();
const props = defineProps<Props>();
</script>
