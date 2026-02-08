<template>
	<component
		:is="elementType"
		:disabled
		:class="[
			'flex h-8 cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-300 px-2 text-sm text-gray-500 shadow-xs outline-hidden',
			'transition-opacity duration-150',
			'hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700',
			'focus:border-gray-500 focus:ring focus:ring-gray-500',
			'disabled:cursor-not-allowed disabled:opacity-50',
			active &&
				'border-orange-300 bg-orange-50 text-orange-500 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 focus:border-orange-300 focus:ring-orange-200'
		]"
	>
		<slot />
	</component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	link?: boolean;
	active?: boolean;
	disabled?: boolean;
}

const props = defineProps<Props>();

const elementType = computed(() => (props.link ? 'a' : 'button'));
</script>
