<template>
	<Collapsible
		v-if="inputs.length"
		v-model="show"
		class="mt-4"
	>
		<template #title>Inputs</template>
		<template #description>List of inputs used in the asset</template>

		<div class="rounded-lg border border-gray-200 shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<tbody class="text-gray-700">
					<tr
						v-for="( input, index ) in inputs"
						:key="input"
						class="[&:not(:first-child)]:border-t border-gray-100"
					>
						<td class="p-3 font-normal">
							<span class="select-none mr-2">{{ index + 1 }}.</span>
							<a
								:href="router.getUrl( 'inputs/details', { item: input } )"
								class="px-2 py-1 text-sm font-medium underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
							>
								{{ formatPath( input ) }}
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatPath } from '@/format';
import { router } from '@/router.js';
import Collapsible from '@/components/common/Collapsible.vue';

interface Props {
	name: string;
	inputs: string[];
}

defineProps<Props>();
const show = computed( router.computedQuery( 'inputs', false ) );
</script>
