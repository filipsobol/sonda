<template>
	<Collapsible
		v-if="parentAssets.length"
		v-model="show"
	>
		<template #title>Usage</template>
		<template #description>Usage details in the selected asset</template>

		<div class="mt-4 mb-2 flex gap-3">
			<span class="text-xl font-bold">Usage in</span>

			<BaseSelect
				v-model="assetId"
				:options="parentAssets"
			/>
		</div>

		<h4 class="mt-4 mb-4 text-lg font-bold text-gray-700">Size</h4>

		<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<colgroup>
					<col style="width: 210px">
					<col style="width: 100%">
				</colgroup>

				<tbody class="text-gray-500">
					<tr>
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Bundled size</td>
						<td class="p-3 font-normal">{{ formatSize( chunk!.uncompressed ) }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. GZIP size</td>
						<td class="p-3 font-normal">{{ report.metadata.gzip ? formatSize( chunk!.gzip! ) : '-' }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. Brotli size</td>
						<td class="p-3 font-normal">{{ report.metadata.brotli ? formatSize( chunk!.brotli! ) : '-' }}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<DependencyChain :name />
		<SourceCode :name />
	</Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { getChunkResource, report } from '@/report.js';
import { formatSize } from '@/format.js';
import BaseSelect from '@components/common/Select.vue';
import Collapsible from '@/components/common/Collapsible.vue';
import DependencyChain from './DependencyChain.vue';
import SourceCode from './SourceCode.vue';
import type { ChunkResource } from 'sonda';

interface Props {
	name: string;
}

const props = defineProps<Props>();

const show = computed( router.computedQuery( 'usage', false ) );
const usedIn = computed( router.computedQuery( 'usedIn', '' ) );

const parentAssets = computed( () => {
	return report.resources
		.filter( ( resource ): resource is ChunkResource => resource.kind === 'chunk' && resource.name === props.name )
		.map( resource => ( {
			label: resource.parent!,
			value: resource.parent!
		} ) );
} );

const assetId = computed( () => {
	return usedIn.value
		// If usedIn is set, find the asset in parentAssets
		&& parentAssets.value.find( asset => asset.value === usedIn.value )?.value

		// Otherwise, use the first asset in parentAssets
		|| parentAssets.value[ 0 ]?.value

		// If no assets are available, return an empty string
		|| '';
} );
const chunk = computed( () => assetId.value && getChunkResource( props.name, assetId.value ) || null );
</script>
