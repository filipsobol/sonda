<template>
	<Collapsible
		v-if="dependencies!.length"
		v-model="show"
	>
		<template #title>Dependencies</template>
		<template #description>List of dependencies used in the asset</template>

		<div class="rounded-lg border border-gray-200 shadow-xs">
			<table class="w-full table-fixed text-left text-sm">
				<tbody class="text-gray-700">
					<tr
						v-for="(dependency, index) in dependencies"
						:key="dependency"
						class="border-gray-100 not-first:border-t"
					>
						<td class="p-3 font-normal">
							<span class="mr-2 select-none">{{ index + 1 }}.</span>
							<a
								:href="
									router.getUrl('dependencies', {
										search: dependency,
										usage: name,
										active: dependency
									})
								"
								class="rounded-lg px-2 py-1 text-sm font-medium underline-offset-2 outline-hidden hover:underline focus:border-gray-500 focus:ring focus:ring-gray-500"
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
const show = computed(router.computedQuery('dependencies', false));

const dependencies = computed(() => {
	return report
		.value!.dependencies.filter(dependency =>
			dependency.paths.some(path => props.inputs.some(input => input.includes(path)))
		)
		.map(dependency => dependency.name)
		.toSorted();
});
</script>
