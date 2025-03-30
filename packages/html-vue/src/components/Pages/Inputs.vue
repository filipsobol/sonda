<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Input files</h2>

		<p class="text-gray-500 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex space-x-2 mb-4">
			<div class="relative flex">
				<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<IconSearch :size="16" class="text-gray-500" />
				</div>

				<input
					v-model="search"
					type="text"
					class="py-1.25 ps-10 w-80 text-sm text-gray-900 border border-gray-300 bg-white rounded-lg outline-hidden shadow-xs placeholder:text-gray-500 focus:ring focus:ring-gray-500 focus:border-gray-500"
					placeholder="Filter input files"
				>
			</div>

			<Dropdown
				v-model="formats"
				:options="FORMAT_OPTIONS"
				title="Format"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>

			<Dropdown
				v-model="sources"
				:options="SOURCE_OPTIONS"
				title="Source"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>
		</div>

		<div class="rounded-lg border border-gray-300 overflow-hidden shadow-xs">
			<table class="table-fixed w-full text-sm text-left">
				<colgroup>
					<col style="width: 58px">
					<col style="width: 66.6%">
					<col style="width: 33.3%">
					<col style="width: 106px">
					<col style="width: 106px">
					<col style="width: 106px">
				</colgroup>
				<thead class="text-xs text-gray-900 uppercase bg-gray-50">
					<tr>
						<th class="p-3"></th>
						<th class="p-3 font-bold">Path</th>
						<th class="p-3 font-bold">Used in</th>
						<th class="p-3 font-bold text-right">Size</th>
						<th class="p-3 font-bold text-center">Format</th>
						<th class="p-3 font-bold text-center">Source</th>
					</tr>
				</thead>

				<tbody class="text-gray-500">
					<template
						v-for="item in paginatedData"
						:key="item.path"
					>
						<tr class="bg-white border-t border-gray-200">
							<td class="p-3 font-normal whitespace-nowrap">
								<BaseButton @click="() => active = active === item.path ? '' : item.path">
									<IconChevronLeft
										:size="16"
										:class="[ active === item.path ? 'rotate-90' : 'rotate-270' ]"
										class="text-gray-500 transition-[rotate] duration-150 ease-linear"
									/>
								</BaseButton>
							</td>
							<td class="p-3 font-normal text-gray-900">
								<p :title="item.path" class="truncate">{{ item.name }}</p>
							</td>
							<td class="p-3 font-normal">
								<p
									v-for="output in item.outputs"
									:key="output"
									:title="output"
									class="truncate"
								>
									{{ output }}
								</p>
							</td>
							<td class="p-3 font-normal text-right whitespace-nowrap">{{ item.bytes }}</td>
							<td class="p-3 font-normal text-center whitespace-nowrap">
								<Badge v-if="item.format === 'esm'" variant="yellow">esm</Badge>
								<Badge v-else-if="item.format === 'cjs'" variant="primary">cjs</Badge>
								<Badge v-else variant="dark">unknown</Badge>
							</td>
							<td class="p-3 font-normal text-center whitespace-nowrap">
								<Badge v-if="item.source ==='internal'" variant="dark">internal</Badge>
								<Badge v-else variant="primary">external</Badge>
							</td>
						</tr>

						<tr class="bg-gray-50">
							<td colspan="1"></td>
							<td colspan="5">
								<div
									:class="{ 'grid-rows-[1fr]': active === item.path }"
									class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-150 ease-linear"
								>
									<div class="overflow-hidden">
										<div class="p-4 border-t border-gray-100 font-normal">
											<p class="mb-2 font-bold">Imports</p>

											<ul class="space-y-1">
												<li>@ckeditor/ckeditor5-core/dist/index.js</li>
												<li>@ckeditor/ckeditor5-utils/dist/index.js</li>
												<li>@ckeditor/ckeditor5-engine/dist/index.js</li>
												<li>lodash-es/lodash.js</li>
												<li>@ckeditor/ckeditor5-widget/dist/index.js</li>
												<li>@ckeditor/ckeditor5-ui/dist/index.js</li>
											</ul>

											<p class="mt-8 mb-2 font-bold">Imported by</p>

											<ul class="space-y-1">
												<li>@ckeditor/ckeditor5-code-block/dist/index.js</li>
												<li>@ckeditor/ckeditor5-essentials/dist/index.js</li>
												<li>@ckeditor/ckeditor5-image/dist/index.js</li>
												<li>@ckeditor/ckeditor5-link/dist/index.js</li>
												<li>@ckeditor/ckeditor5-list/dist/index.js</li>
												<li>@ckeditor/ckeditor5-markdown-gfm/dist/index.js</li>
												<li>@ckeditor/ckeditor5-media-embed/dist/index.js</li>
												<li>@ckeditor/ckeditor5-paste-from-office/dist/index.js</li>
												<li>@ckeditor/ckeditor5-table/dist/index.js</li>
												<li>ckeditor5/dist/ckeditor5.js</li>
											</ul>
										</div>
									</div>
								</div>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>

		<Pagination
			v-model="currentPage"
			:count="filteredData.length"
			:items-per-page="ITEMS_PER_PAGE"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { router } from '@router'
import { report } from '@report';
import { formatSize, formatPath } from '@/format.js';
import BaseButton from '@components/Common/Button.vue';
import Dropdown from '@components/Common/Dropdown.vue';
import Pagination from '@components/Common/Pagination.vue';
import Badge from '@components/Common/Badge.vue';
import IconSearch from '@components/Icon/Search.vue';
import IconFunnel from '@components/Icon/Funnel.vue';
import IconChevronLeft from '@components/Icon/ChevronLeft.vue';

const ITEMS_PER_PAGE = 10;

const FORMAT_OPTIONS = [
	{ label: 'ESM', subLabel: 'ES Module', value: 'esm' },
	{ label: 'CJS', subLabel: 'CommonJS', value: 'cjs' },
	{ label: 'Unknown', value: 'unknown' },
];

const SOURCE_OPTIONS = [
	{ label: 'Internal', value: 'internal' },
	{ label: 'External', value: 'external' },
];

const inputs = Object.entries( report.inputs );
const outputs = Object.entries( report.outputs );

// const imports = inputs.reduce( ( carry, [ name, input ] ) => {
// 	input.imports.forEach( importPath => {
// 		if ( !carry[ importPath ] ) {
// 			carry[ importPath ] = [];
// 		}

// 		carry[ importPath ].push( name );
// 	} );

// 	return carry;
// }, {} );

const data = ref(
	inputs.map( ( [ path, input ] ) => ( {
		path,
		name: formatPath( path ),
		bytes: formatSize( input.bytes ),
		format: input.format,
		source: path.includes( 'node_modules' ) ? 'external' : 'internal',
		outputs: outputs
			.filter( ( [ , output ] ) => output.inputs[ path ] )
			.map( ( [ outputPath ] ) => outputPath )
	} ) )
);

const search = computed( router.computedQuery( 'search', '' ) );
const formats = computed( router.computedQuery( 'formats', FORMAT_OPTIONS.map( o => o.value ) ) );
const sources = computed( router.computedQuery( 'sources', SOURCE_OPTIONS.map( o => o.value ) ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value.filter( item => {
		return formats.value.includes( item.format )
			&& sources.value.includes( item.source )
			&& item.path.toLowerCase().includes( lowercaseSearch );
	} );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );

watch( [ search, formats, sources ], () => {
	currentPage.value = 1;
	active.value = '';
} );
</script>
