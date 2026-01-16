<template>
	<div
		v-if="!dismissed"
		class="absolute top-0 left-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-white/60 p-6 backdrop-blur-sm md:hidden"
	>
		<p class="text-center text-3xl font-bold">Mobile layout is not supported</p>

		<p class="mt-3 text-center text-balance text-gray-500">
			The layout is not optimized for mobile devices. Please use a desktop browser or wider screen.
		</p>

		<button
			type="button"
			class="me-2 mt-6 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-700 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
			@click="() => (dismissed = true)"
		>
			Dismiss
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dismissed = ref(false);
</script>
