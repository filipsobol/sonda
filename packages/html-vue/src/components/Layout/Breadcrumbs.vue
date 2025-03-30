<template>
	<nav class="text-gray-700 w-full" aria-label="Breadcrumb">
		<ol class="inline-flex items-center space-x-2 w-full">
			<li>
				<a href="#/" class="text-sm font-medium text-gray-700 underline-offset-2 hover:underline">Home</a>
			</li>

			<li><IconChevronLeft :size="16" class="rotate-180" /></li>

			<li aria-current="page">
				<a href="#/" class="text-sm font-medium text-gray-700 underline-offset-2 hover:underline">Assets</a>
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
