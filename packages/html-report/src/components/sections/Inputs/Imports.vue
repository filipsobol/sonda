<template>
	<Collapsible
		v-if="imports.length"
		v-model="show"
	>
		<template #title>Imports</template>
		<template #description>List of other inputs imported from this input</template>

		<div class="rounded-lg border border-gray-200 overflow-y-scroll max-h-[475px] shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<tbody class="text-gray-700">
						<tr
							v-for="( item, index ) in imports"
							:key="item.target"
							class="[&:not(:first-child)]:border-t border-gray-100"
						>
							<td class="p-3 font-normal">
								<span class="select-none mr-2">{{ index + 1 }}.</span>
								<a
									:href="router.getUrl( 'inputs/details', { item: item.target } )"
									class="px-2 py-1 text-sm font-medium underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
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
const show = computed( router.computedQuery( 'imports', false ) );
const imports = computed( () => report.connections.filter( ( { kind, source } ) => {
	return kind !== 'sourcemap'
		&& kind !== 'entrypoint'
		&& source === props.name;
} ) );
</script>
