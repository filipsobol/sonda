<template>
	<nav class="-mx-2 text-gray-700 w-full" aria-label="Breadcrumb">
		<ol class="inline-flex items-center space-x-1 w-full">
			<li>
				<a href="#/" class="px-2 py-1 text-sm font-medium text-gray-700 underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline">Home</a>
			</li>

			<li><IconChevronLeft :size="16" class="rotate-180" /></li>

			<li aria-current="page">
				<a href="#/" class="px-2 py-1 text-sm font-medium text-gray-700 underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline">Assets</a>
			</li>

			<li><IconChevronLeft :size="16" class="rotate-180" /></li>

			<li aria-current="page" class="text-gray-500 truncate">
				/home/filip/Projects/sonda/packages/sonda/src/report/dependencies.ts
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import IconChevronLeft from '@icon/ChevronLeft.vue';
</script>
