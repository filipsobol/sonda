<template>
	<Collapsible
		v-if="imports.length"
		v-model="show"
	>
		<template #title>Imports</template>
		<template #description>List of other inputs imported from this input</template>

		<div class="max-h-[475px] overflow-y-scroll rounded-lg border border-gray-200 shadow-xs">
			<table class="w-full table-fixed text-left text-sm">
				<tbody class="text-gray-700">
					<tr
						v-for="(item, index) in imports"
						:key="item.target"
						class="border-gray-100 [&:not(:first-child)]:border-t"
					>
						<td class="p-3 font-normal">
							<span class="mr-2 select-none">{{ index + 1 }}.</span>
							<a
								:href="router.getUrl('inputs/details', { item: item.target })"
								class="rounded-lg px-2 py-1 text-sm font-medium underline-offset-2 outline-hidden hover:underline focus:border-gray-500 focus:ring focus:ring-gray-500"
							>
								<template v-if="item.original">
									{{ item.original }} <span class="text-gray-500">({{ item.target }})</span>
								</template>

								<template v-else>
									{{ item.target }}
								</template>
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
}

const props = defineProps<Props>();
const show = computed(router.computedQuery('imports', false));
const imports = computed(() =>
	report.connections.filter(({ kind, source }) => {
		return kind !== 'sourcemap' && kind !== 'entrypoint' && source === props.name;
	})
);
</script>
