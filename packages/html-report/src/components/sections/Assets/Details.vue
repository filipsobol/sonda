<template>
	<Collapsible v-model="show">
		<template #title>Details</template>
		<template #description>Details of the source asset</template>

		<div class="overflow-hidden rounded-lg border border-gray-200 shadow-xs">
			<table class="w-full table-fixed text-left text-sm">
				<colgroup>
					<col style="width: 210px" />
					<col style="width: 100%" />
				</colgroup>

				<tbody class="text-gray-500">
					<tr>
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Path</td>
						<td class="p-3 font-normal">{{ name }}</td>
					</tr>

					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Treemap</td>
						<td class="p-3 font-normal">
							<span class="inline-flex">
								<BaseButton
									:link="true"
									:href="router.getUrl('treemap', { item: name })"
									:active="true"
								>
									Treemap view
								</BaseButton>
							</span>
						</td>
					</tr>

					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">File type</td>
						<td class="p-3 font-normal capitalize">{{ asset.type }}</td>
					</tr>

					<tr
						v-if="entrypoints.length"
						class="border-t border-gray-100"
					>
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Entrypoint(s)</td>
						<td class="p-3 font-normal">
							<ul>
								<li
									v-for="entrypoint in entrypoints"
									:key="entrypoint.target"
								>
									<a
										:href="router.getUrl('inputs/details', { item: entrypoint.target })"
										class="rounded-lg py-1 text-sm font-medium underline-offset-2 outline-hidden hover:underline focus:border-gray-500 focus:ring focus:ring-gray-500"
									>
										{{ entrypoint.target }}
									</a>
								</li>
							</ul>
						</td>
					</tr>

					<!-- Uncompressed -->
					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Original file size</td>
						<td class="p-3 font-normal">{{ formatSize(asset.uncompressed) }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td
							class="flex items-center justify-between border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap"
						>
							Original download time

							<span
								class="inline-flex"
								data-hover="Estimated download time on a slow 3G connection"
							>
								<IconInfo
									:size="20"
									class="pointer-events-none ml-2 inline"
								/>
							</span>
						</td>
						<td class="p-3 font-normal">{{ formatTime(downloadTimeOriginal) }}</td>
					</tr>

					<!-- GZIP -->
					<template v-if="asset.gzip">
						<tr class="border-t border-gray-100">
							<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">GZIP size</td>
							<td class="p-3 font-normal">{{ formatSize(asset.gzip) }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td
								class="flex items-center justify-between border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap"
							>
								GZIP download time

								<span
									class="inline-flex"
									data-hover="Estimated download time on a slow 3G connection"
								>
									<IconInfo
										:size="20"
										class="pointer-events-none ml-2 inline"
									/>
								</span>
							</td>
							<td class="p-3 font-normal">{{ formatTime(downloadTimeGzip) }}</td>
						</tr>
					</template>

					<!-- Brotli -->
					<template v-if="asset.brotli">
						<tr class="border-t border-gray-100">
							<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Brotli size</td>
							<td class="p-3 font-normal">{{ formatSize(asset.brotli) }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td
								class="flex items-center justify-between border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap"
							>
								Brotli download time

								<span
									class="inline-flex"
									data-hover="Estimated download time on a slow 3G connection"
								>
									<IconInfo
										:size="20"
										class="pointer-events-none ml-2 inline"
									/>
								</span>
							</td>
							<td class="p-3 font-normal">{{ formatTime(downloadTimeBrotli) }}</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
	</Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { getAssetResource, report } from '@/report.js';
import { formatSize, formatTime } from '@/format.js';
import IconInfo from '@icon/Info.vue';
import BaseButton from '@components/common/Button.vue';
import Collapsible from '@/components/common/Collapsible.vue';

const SLOW_3G = 50 * 1024 * 8;

interface Props {
	name: string;
}

const props = defineProps<Props>();

const show = computed(router.computedQuery('details', true));
const asset = computed(() => getAssetResource(props.name)!);
const entrypoints = computed(() =>
	report.connections.filter(connection => connection.kind === 'entrypoint' && connection.source === props.name)
);

// Download times
const downloadTimeOriginal = computed(() => Math.round((asset.value.uncompressed / SLOW_3G) * 1000));
const downloadTimeGzip = computed(() => Math.round((asset.value.gzip / SLOW_3G) * 1000));
const downloadTimeBrotli = computed(() => Math.round((asset.value.brotli / SLOW_3G) * 1000));
</script>
