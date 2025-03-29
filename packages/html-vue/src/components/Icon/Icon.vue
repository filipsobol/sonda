<template>
	<svg
		:width="size"
		:height="size"
		:stroke-width="strokeWidth"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		vector-effect="non-scaling-stroke"
	>
		<slot />
	</svg>
</template>

<script setup lang="ts">
interface Props {
	size?: number;
	strokeWidth?: number;
}

withDefaults(defineProps<Props>(), {
	size: 24,
	strokeWidth: 2
});
</script>
