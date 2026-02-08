<template>
	<div
		v-if="!dismissed"
		class="absolute top-0 left-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-white/60 p-6 backdrop-blur-sm md:hidden"
	>
		<p class="text-center text-3xl font-bold">Mobile layout is not supported</p>

		<p class="mt-3 text-center text-balance text-gray-500">
			The layout is not optimized for mobile devices. Please use a desktop browser or wider screen.
		</p>

		<BaseButton
			type="button"
			class="mt-6 px-5 text-gray-700"
			@click="() => (dismissed = true)"
		>
			Dismiss
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from '@components/common/Button.vue';

const dismissed = ref(false);
</script>
