<template>
	<div class="relative flex">
		<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
			<IconSearch :size="16" :class="active ? 'text-orange-500' : 'text-gray-500'" />
		</div>

		<input
			v-model="model"
			:placeholder
			:class="[
				active && 'bg-orange-50 text-orange-500 border-orange-300 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 focus:ring-orange-200 focus:border-orange-300'
			]"
			type="text"
			class="py-1.25 ps-10 w-80 text-sm text-gray-900 border border-gray-300 rounded-lg outline-hidden shadow-xs placeholder:text-gray-500 focus:ring focus:ring-gray-500 focus:border-gray-500"
		>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IconSearch from '@components/icon/Search.vue';

interface Props {
	placeholder?: string;
}

withDefaults( defineProps<Props>(), {
	placeholder: 'Filter items'
} );

const model = defineModel<string>( {
	default: ''
} );

const active = computed( () => !!model.value );
</script>
