<template>
	<div>
		<!-- Tabs list -->
		<div
			role="tablist"
			class="flex items-center gap-2 overflow-x-auto overflow-y-hidden rounded-lg border border-gray-200 bg-gray-50 p-1"
		>
			<button
				v-for="option in props.options"
				:key="option.value"
				:disabled="option.disabled"
				:class="[
					'flex cursor-pointer items-center justify-center gap-2 rounded-md border px-6 py-2 text-sm text-gray-500 outline-hidden select-none hover:border-gray-300 focus:border-gray-300',
					model === option.value ? 'border-gray-300 bg-white text-gray-700 shadow-xs' : 'border-transparent',
					'transition-colors duration-150',
					'disabled:cursor-not-allowed disabled:opacity-50'
				]"
				role="tab"
				@click="() => (model = option.value)"
			>
				{{ option.label }}
			</button>
		</div>

		<!-- Tab content -->
		<div
			role="tabpanel"
			class="pt-4"
		>
			<slot :name="model" />
		</div>
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
