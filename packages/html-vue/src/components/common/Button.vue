<template>
	<component
		:is="elementType"
		:class="[
			'flex items-center justify-between gap-2 h-8 px-2 text-sm text-gray-500 border border-gray-300 rounded-lg shadow-xs outline-hidden cursor-pointer',
			'transition-opacity duration-150',
			'hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700',
			'focus:ring focus:ring-gray-500 focus:border-gray-500',
			'disabled:opacity-50 disabled:cursor-not-allowed',
			active && 'bg-orange-50 text-orange-500 border-orange-300 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 focus:ring-orange-200 focus:border-orange-300'
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
}

const props = defineProps<Props>();

const elementType = computed(() => props.link ? 'a' : 'button');
</script>
