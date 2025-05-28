<template>
	<aside class="flex-shrink-0 w-72" aria-label="Sidebar">
		<div class="h-full px-2 py-3 overflow-y-auto bg-gray-50 border-r border-gray-200">
			<a href="https://sonda.dev/" target="_blank" class="px-2 py-1 flex items-center justify-center gap-2 text-gray-700 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:text-gray-900">
				<svg
					width="24"
					height="24"
					viewBox="0 0 512 512"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="inline-block"
				>
					<path d="M0 0h512v512H0V0Z" fill="#FACC15"/>
					<path d="m264.536 203.704-41.984 89.6-21.504-9.728c-20.139-9.216-35.669-21.504-46.592-36.864-10.923-15.36-16.384-37.717-16.384-67.072 0-37.547 9.728-65.536 29.184-83.968 19.797-18.773 52.395-28.33 97.792-28.672 18.773 0 35.84.853 51.2 2.56s27.648 3.584 36.864 5.632l13.824 2.56-10.24 82.432-12.8-1.536c-8.192-1.024-18.432-1.877-30.72-2.56-12.288-1.024-24.235-1.536-35.84-1.536-12.288 0-21.675 1.877-28.16 5.632-6.144 3.413-9.216 10.069-9.216 19.968 0 5.461 2.219 9.899 6.656 13.312 4.437 3.413 10.411 6.827 17.92 10.24Zm-18.432 100.864 42.496-90.624 22.016 9.728c23.211 10.24 40.107 23.04 50.688 38.4 10.581 15.019 15.872 36.523 15.872 64.512 0 37.888-9.899 67.072-29.696 87.552-19.797 20.48-52.395 30.891-97.792 31.232-22.528 0-43.52-1.536-62.976-4.608-19.456-2.731-36.693-5.973-51.712-9.728l10.24-82.432 12.288 2.048c8.533 1.365 19.797 2.731 33.792 4.096 13.995 1.365 29.355 2.048 46.08 2.048 12.971 0 22.699-1.877 29.184-5.632 6.485-3.755 9.728-9.899 9.728-18.432 0-5.803-1.536-10.411-4.608-13.824-3.072-3.413-8.533-6.827-16.384-10.24l-9.216-4.096Z" fill="#000"/>
				</svg>

				<span class="font-bold text-lg">Sonda</span>
			</a>

			<ul class="mt-6 flex flex-col gap-1 font-medium">
				<li
					v-for="item in items"
					:key="item.title"
				>
					<a
						:href="router.getUrl( item.link )"
						:class="[ router.isActive( item.link ) ? 'bg-white border-gray-300 shadow-xs' : 'border-transparent hover:border-gray-300' ]"
						class="flex items-center px-3 py-2 text-gray-800 rounded-lg border transition-colors duration-150 outline-hidden focus:border-gray-300"
					>
						<component :is="item.icon" :size="18" class="flex-shrink-0 text-gray-400" />
						<span class="flex-grow ms-3 truncate text-gray-900">{{ item.title }}</span>
						<span
							v-if="item.count !== undefined"
							class="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-lg"
						>
							{{ item.count }}
						</span>
					</a>
				</li>
			</ul>
		</div>
	</aside>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { getAssets, getSources, report } from '@/report.js';
import { router } from '@/router.js';
import IconGrid from '@icon/Grid.vue';
import IconBoxes from '@icon/Boxes.vue';
import IconFileInput from '@icon/FileInput.vue';
import IconShare2 from '@icon/Share2.vue';
// import IconCircleAlert from '@icon/CircleAlert.vue';

interface Link {
	title: string;
	link: string;
	icon: Component;
	count?: number;
}

const items: Array<Link> = [
	{
		title: 'Home',
		link: '',
		icon: IconGrid
	},
	{
		title: 'Assets',
		link: 'assets',
		icon: IconBoxes,
		count: Object.values( getAssets() ).length
	},
	{
		title: 'Inputs',
		link: 'inputs',
		icon: IconFileInput,
		count: Object.values( getSources() ).length
	},
	{
		title: 'Dependencies',
		link: 'dependencies',
		icon: IconShare2,
		count: Object.values( report.dependencies ).length
	},
	/*
	{
		title: 'Issues',
		link: 'issues',
		icon: IconCircleAlert,
		count: report.issues.length
	}
	*/
];
</script>
