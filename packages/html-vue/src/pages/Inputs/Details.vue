<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">{{ formatPath( router.query.item ) }}</h2>

		<p class="text-gray-500 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex flex-col mb-4">
			<h3 class="mb-4 text-xl font-bold">Asset details</h3>

			<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
				<table class="table-fixed w-full text-sm text-left">
					<colgroup>
						<col style="width: 200px">
						<col style="width: 100%">
					</colgroup>

					<tbody class="text-gray-500">
						<tr>
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Path</td>
							<td class="p-3 font-normal">{{ router.query.item }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">File format</td>
							<td class="p-3 font-normal">Script</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Module type</td>
							<td class="p-3 font-normal">ESM</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Source</td>
							<td class="p-3 font-normal">External</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Original file size</td>
							<td class="p-3 font-normal">123</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="mt-12 mb-2 flex gap-3">
				<span class="text-xl font-bold">Usage in</span>

				<BaseSelect
					v-model="formats"
					:options="FORMAT_OPTIONS"
				/>
			</div>

			<h4 class="mt-2 mb-4 text-lg font-bold text-gray-700">Size</h4>

			<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
				<table class="table-fixed w-full text-sm text-left">
					<colgroup>
						<col style="width: 200px">
						<col style="width: 100%">
					</colgroup>

					<tbody class="text-gray-500">
						<tr>
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Bundled size</td>
							<td class="p-3 font-normal">123</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. GZIP size</td>
							<td class="p-3 font-normal">123</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. Brotli size</td>
							<td class="p-3 font-normal">123</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h4 class="mt-8 mb-4 text-lg font-bold text-gray-700">Dependency graph</h4>

			<h4 class="mt-8 mb-4 text-lg font-bold text-gray-700">Code</h4>

			<div class="p-4 rounded-lg border border-gray-200 overflow-hidden shadow-xs font-mono text-gray-700 bg-gray-50">
				Hello world
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatPath } from '@/format.js';
import { router } from '@/router.js';
import BaseSelect from '@components/common/Select.vue';

const FORMAT_OPTIONS = [
	{ label: 'ESM', subLabel: 'ES Module', value: 'esm' },
	{ label: 'CJS', subLabel: 'CommonJS', value: 'cjs' },
	{ label: 'Unknown', value: 'unknown' },
];

const formats = computed( router.computedQuery( 'formats', 'esm' ) );
</script>
