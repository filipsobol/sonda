<template>
	<nav class="-mx-2 text-gray-700 w-full" aria-label="Breadcrumb">
		<ol class="inline-flex items-center gap-1 w-full">
			<template
				v-for="(part, index) in parts"
				:key="index"
			>
				<li v-if="index !== 0">
					<IconChevronLeft :size="16" class="rotate-180" />
				</li>

				<li v-if="index !== parts.length - 1">
					<a
						:href="part.url"
						class="px-2 py-1 text-sm font-medium text-gray-700 underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
					>
						{{ part.name }}
					</a>
				</li>

				<li
					v-else
					aria-current="page"
					class="px-2 py-1 text-gray-500 truncate"
				>
					{{ part.name }}
				</li>
			</template>
		</ol>
	</nav>
</template>

<script setup lang="ts">
import { router } from '@/router.js';
import IconChevronLeft from '@icon/ChevronLeft.vue';
import { computed } from 'vue';

const parts = computed( () => {
	const parts = [
		{ name: 'Home', url: router.getUrl( '' ) }
	];

	const route = router.path.split( '/' )[ 0 ];
	const itemId = router.query.item;

	if ( route ) {
		parts.push( { name: capitalize( route ), url: router.getUrl( route ) } );
	}

	if ( route && itemId ) {
		parts.push( { name: itemId, url: router.getUrl( route, { id: itemId } ) } );
	}

	return parts;
} );

function capitalize( title: string ): string {
	return title.charAt( 0 ).toUpperCase() + title.slice( 1 );
}
</script>
