<template>
	<div
		v-if="!dismissed"
		class="absolute left-0 top-0 w-screen h-screen bg-white/60 z-50 backdrop-blur-sm md:hidden flex flex-col items-center justify-center p-6"
	>
		<p class="text-3xl font-bold text-center">
			Mobile layout is not supported
		</p>
	
		<p class="mt-3 text-gray-500 text-balance text-center">
			The layout is not optimized for mobile devices. Please use a desktop browser or wider screen.
		</p>

		<button
			type="button"
			class="mt-6 py-2.5 px-5 me-2 text-sm text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
			@click="() => dismissed = true"
		>
			Dismiss
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dismissed = ref(false);
</script>
