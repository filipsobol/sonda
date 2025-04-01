<template>
	<button :class="classes">
		<slot />
	</button>
</template>

<script setup lang="ts">
const classes = `
	flex items-center justify-center space-x-2 h-8 px-2 text-sm text-gray-500 border border-gray-300 bg-white rounded-lg shadow-xs outline-hidden cursor-pointer
	transition-opacity duration-150
	hover:enabled:bg-gray-100 hover:enabled:border-gray-400 hover:enabled:text-gray-700
	focus:ring focus:ring-gray-500 focus:border-gray-500
	disabled:opacity-50 disabled:cursor-not-allowed
`;
</script>
