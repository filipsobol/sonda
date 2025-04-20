<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Build summary</h2>

		<p class="text-gray-600 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<h3 class="text-xl font-bold mb-4">Assets</h3>

		<div class="grid grid-cols-4 gap-2">
			<a
				href="#"
				class="col-span-2 xl:col-span-1 p-4 flex flex-col border border-gray-300 rounded-lg shadow-xs transition-colors duration-150 hover:bg-gray-50"
			>
				<div class="flex items-start justify-between">
					<p class="text-gray-500">Total size</p>
					<IconBox :size="16" class="text-gray-400" />
				</div>

				<p class="text-xl mt-1">{{ formatSize( totalSize ) }} <span class="text-gray-500">({{ totalCount }})</span></p>
			</a>

			<a
				href="#"
				class="col-span-2 xl:col-span-1 p-4 flex flex-col border border-gray-300 rounded-lg shadow-xs transition-colors duration-150 hover:bg-gray-50"
			>
				<div class="flex items-start justify-between">
					<p class="text-gray-500">JavaScript</p>
					<IconCode :size="16" class="text-gray-400" />
				</div>

				<p class="text-xl mt-1">{{ formatSize( scriptSize ) }} <span class="text-gray-500">({{ scriptCount }})</span></p>
			</a>

			<a
				href="#"
				class="col-span-2 xl:col-span-1 p-4 flex flex-col border border-gray-300 rounded-lg shadow-xs transition-colors duration-150 hover:bg-gray-50"
			>
				<div class="flex items-start justify-between">
					<p class="text-gray-500">CSS</p>
					<IconBrush :size="16" class="text-gray-400" />
				</div>

				<p class="text-xl mt-1">{{ formatSize( styleSize ) }} <span class="text-gray-500">({{ styleCount }})</span></p>
			</a>

			<a
				href="#"
				class="col-span-2 xl:col-span-1 p-4 flex flex-col border border-gray-300 rounded-lg shadow-xs transition-colors duration-150 hover:bg-gray-50"
			>
				<div class="flex items-start justify-between">
					<p class="text-gray-500">Other</p>
					<IconImage :size="16" class="text-gray-400" />
				</div>

				<p class="text-xl mt-1">{{ formatSize( otherSize ) }} <span class="text-gray-500">({{ otherCount }})</span></p>
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { report } from '@/report.js';
import { formatSize } from '@/format.js';
import IconBox from '@icon/Box.vue';
import IconCode from '@icon/Code.vue';
import IconBrush from '@icon/Brush.vue';
import IconImage from '@icon/Image.vue';

const totalOutputs = Object.values( report.outputs );

const totalCount = totalOutputs.length;
const totalSize = totalOutputs.reduce( ( acc, output ) => output.uncompressed + acc, 0 );

const scriptOutputs = totalOutputs.filter( output => output.type === 'script' );
const scriptCount = scriptOutputs.length;
const scriptSize = scriptOutputs.reduce( ( acc, output ) => output.uncompressed + acc, 0 );

const styleOutputs = totalOutputs.filter( output => output.type === 'style' );
const styleCount = styleOutputs.length;
const styleSize = styleOutputs.reduce( ( acc, output ) => output.uncompressed + acc, 0 );

const otherOutputs = totalOutputs.filter( output => output.type === 'other' );
const otherCount = otherOutputs.length;
const otherSize = otherOutputs.reduce( ( acc, output ) => output.uncompressed + acc, 0 );
</script>
