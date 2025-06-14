<template>
	<Collapsible v-model="show">
		<template #title>Details</template>
		<template #description>Details of the source input</template>
	
		<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<colgroup>
					<col style="width: 210px">
					<col style="width: 100%">
				</colgroup>

				<tbody class="text-gray-500">
					<tr>
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Path</td>
						<td class="p-3 font-normal">{{ name }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">File type</td>
						<td class="p-3 font-normal capitalize">{{ source.type }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Module format</td>
						<td class="p-3 font-normal uppercase">{{ source.format }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Source</td>
						<td class="p-3 font-normal capitalize">{{ name.includes( 'node_modules' ) ? 'external' : 'internal' }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Original file size</td>
						<td class="p-3 font-normal">{{ formatSize( source.uncompressed ) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { getSourceResource } from '@/report.js';
import { formatSize } from '@/format.js';
import Collapsible from '@/components/common/Collapsible.vue';

interface Props {
	name: string;
}

const props = defineProps<Props>();
const show = computed( router.computedQuery( 'details', true ) );
const source = computed( () => getSourceResource( props.name )! );
</script>
