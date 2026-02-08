<template>
	<div class="flex max-w-7xl flex-col">
		<template v-if="input">
			<h2 class="text-2xl font-bold">{{ formatPath(name) }}</h2>

			<p class="mt-4 text-gray-500">Details of the input discovered during the build process.</p>

			<hr class="mt-4 mb-6 border-gray-100" />

			<div class="mt-4 flex flex-col">
				<Details :name />
				<Usage
					:name
					class="mt-4"
				/>
				<Imports
					:name
					class="mt-4"
				/>
			</div>
		</template>

		<template v-else>
			<Alert variant="error">
				<template #header>
					<p>The input does not exist</p>
				</template>

				<template #body>
					<p>
						The input you are looking for does not exist. Go back to the
						<a
							:href="router.getUrl('inputs')"
							class="underline"
							>Inputs</a
						>
						page to see all the available inputs.
					</p>
				</template>
			</Alert>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { formatPath } from '@/format.js';
import { getSourceResource } from '@/report.js';
import Alert from '@/components/common/Alert.vue';
import Details from '@/components/sections/Inputs/Details.vue';
import Imports from '@/components/sections/Inputs/Imports.vue';
import Usage from '@/components/sections/Inputs/Usage.vue';

const name = computed(() => router.query.item);
const input = computed(() => getSourceResource(name.value));
</script>
