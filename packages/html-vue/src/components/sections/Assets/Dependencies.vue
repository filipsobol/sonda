<template>
	<Collapsible
		v-if="dependencies.length"
		v-model="show"
	>
		<template #title>Dependencies</template>
		<template #description>List of dependencies used in the asset</template>

		<div class="rounded-lg border border-gray-200 shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<tbody class="text-gray-700">
					<tr
						v-for="( dependency, index ) in dependencies"
						:key="dependency"
						class="[&:not(:first-child)]:border-t border-gray-100"
					>
						<td class="p-3 font-normal">
							<span class="select-none mr-2">{{ index + 1 }}.</span>
							<a
								:href="router.getUrl( 'dependencies', { search: dependency, active: dependency } )"
								class="px-2 py-1 text-sm font-medium underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
							>
								{{ dependency }}
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
import { router } from '@/router.js';
import { report } from '@/report.js';
import Collapsible from '@/components/common/Collapsible.vue';

interface Props {
	name: string;
	inputs: string[];
}

const props = defineProps<Props>();
const show = computed( router.computedQuery( 'dependencies', false ) );

const dependencies = computed( () => {
	return report.dependencies
		.filter( dependency => dependency.paths.some( path => props.inputs.some( input => input.includes( path ) ) ) )
		.map( dependency => dependency.name )
		.toSorted();
} )
</script>
