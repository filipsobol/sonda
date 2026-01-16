<template>
	<div class="relative flex">
		<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
			<IconSearch
				:size="16"
				:class="active ? 'text-orange-500' : 'text-gray-500'"
			/>
		</div>

		<input
			v-model="model"
			:placeholder
			:class="[
				active &&
					'border-orange-300 bg-orange-50 text-orange-500 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 focus:border-orange-300 focus:ring-orange-200'
			]"
			type="text"
			class="w-80 rounded-lg border border-gray-300 py-1.25 ps-10 text-sm text-gray-900 shadow-xs outline-hidden placeholder:text-gray-500 focus:border-gray-500 focus:ring focus:ring-gray-500"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IconSearch from '@components/icon/Search.vue';

interface Props {
	placeholder?: string;
}

withDefaults(defineProps<Props>(), {
	placeholder: 'Filter items'
});

const model = defineModel<string>({
	default: ''
});

const active = computed(() => !!model.value);
</script>
