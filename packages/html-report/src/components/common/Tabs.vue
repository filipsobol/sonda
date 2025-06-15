<template>
	<div>
		<!-- Tabs list -->
		<div
			role="tablist"
			class="flex items-center gap-2 p-1 rounded-lg border border-gray-200 bg-gray-50 overflow-x-auto overflow-y-hidden"
		>
			<button
				v-for="option in props.options"
				:key="option.value"
				:disabled="option.disabled"
				:class="[
					'flex items-center justify-center gap-2 py-2 px-6 text-sm rounded-md border text-gray-500 outline-hidden cursor-pointer select-none focus:border-gray-300 hover:border-gray-300',
					model === option.value ? 'border-gray-300 text-gray-700 bg-white shadow-xs' : 'border-transparent',
					'transition-colors duration-150',
					'disabled:opacity-50 disabled:cursor-not-allowed'
				]"
				role="tab"
				@click="() => model = option.value"
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
