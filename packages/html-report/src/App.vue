<template>
	<UploadReport v-if="!report" />

	<template v-else>
		<div class="flex min-h-screen w-full text-gray-900">
			<Sidebar />

			<div class="flex w-full grow flex-col overflow-hidden">
				<Breadcrumbs class="p-4" />

				<div class="grow p-4">
					<transition
						mode="out-in"
						enter-active-class="transition-opacity duration-150"
						enter-from-class="opacity-0"
						enter-to-class="opacity-100"
						leave-active-class="transition-opacity duration-150"
						leave-from-class="opacity-100"
						leave-to-class="opacity-0"
					>
						<component
							:is="currentPage"
							class="relative"
						/>
					</transition>
				</div>
			</div>

			<Tooltip />
		</div>

		<MobileOverlay />
	</template>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { router } from '@/router.js';
import { report } from '@/report.js';
import Breadcrumbs from '@components/layout/Breadcrumbs.vue';
import Sidebar from '@layout/Sidebar.vue';
import MobileOverlay from '@layout/MobileOverlay.vue';
import Tooltip from '@layout/Tooltip.vue';
import UploadReport from '@layout/UploadReport.vue';

const components = import.meta.glob('./pages/**/*.vue');

const pages: Record<string, any> = Object.fromEntries(
	Object.entries(components).map(([path, component]) => {
		const parts = path.replace('./pages/', '').replace('.vue', '').toLowerCase().split('/');

		if (parts.at(-1) === 'index') {
			parts.pop();
		}

		return [parts.join('/'), component];
	})
);

const currentPage = computed(() => defineAsyncComponent(pages[router.path]));
</script>
