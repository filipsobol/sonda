<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">{{ formatPath( name ) }}</h2>

		<div class="flex flex-col mt-4">
			<Details :name />
			<Imports :name class="mt-4" />
			<Usage :name class="mt-4" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { formatPath } from '@/format.js';
import Details from '@/components/sections/Inputs/Details.vue';
import Imports from '@/components/sections/Inputs/Imports.vue';
import Usage from '@/components/sections/Inputs/Usage.vue';

const name = computed( () => router.query.item );
</script>
