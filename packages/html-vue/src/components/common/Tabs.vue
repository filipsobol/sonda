<template>
	<div>
		<!-- Tabs list -->
		<ul
			role="tablist"
			class="flex items-center gap-2 px-2 w-full border-b border-gray-300 overflow-x-auto"
		>
			<li
				v-for="option in props.options"
				:key="option.value"
				:disabled="option.disabled"
				:class="[
					'flex items-center justify-center gap-2 py-2.5 px-6 -mb-0.25 text-sm rounded-t-lg border text-gray-500 outline-hidden cursor-pointer select-none',
					model === option.value ? 'border-gray-300 text-gray-900 bg-gray-50' : 'border-transparent',
					'transition-colors duration-150',
					'disabled:opacity-50 disabled:cursor-not-allowed'
				]"
				role="tab"
				@click="() => model = option.value"
			>
				{{ option.label }}
			</li>
		</ul>

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
