<template>
	<div
		ref="wrapper"
		class="wrapper relative flex size-full cursor-pointer overflow-hidden font-mono"
	>
		<svg
			v-if="wrapper"
			:width="svgSize!.width"
			:height="svgSize!.height"
			xmlns="http://www.w3.org/2000/svg"
			@mousemove="onMouseMove"
			@mouseleave="onMouseLeave"
		>
			<Level
				:content="content"
				:width="svgSize!.width"
				:height="svgSize!.height"
				:xStart="0"
				:yStart="0"
			/>
		</svg>

		<div
			v-text="tooltipContent"
			:style="tooltipStyle"
			ref="tooltip"
			class="invisible absolute z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none"
		/>
	</div>
</template>

<script setup lang="ts">
import {
	ref,
	reactive,
	computed,
	markRaw,
	onMounted,
	onBeforeUnmount,
	provide,
	watch
} from 'vue';
import Level from './Level.vue';
import { parse } from '../data';
import data from '../output';

type TrackerDomElements = 'wrapper' | 'tooltip' | 'body';

const resizeObserver = new ResizeObserver( entries => {
	entries.forEach( entry => {
		switch ( entry.target ) {
			case wrapper.value: return sizes.set( 'wrapper', entry.contentRect );
			case tooltip.value: return sizes.set( 'tooltip', entry.contentRect );
			case document.body: return sizes.set( 'body', entry.contentRect );
		}
	} );
} );

const content = markRaw( parse( data ) );
const wrapper = ref<HTMLElement>();
const tooltip = ref<HTMLElement>();
const tooltipContent = ref<string>();
const tooltipStyle = ref<Record<string, string>>();
const sizes = reactive<Map<TrackerDomElements, DOMRectReadOnly>>( new Map() );

provide<number>( 'totalSize', content.bytes );

const svgSize = computed(() => sizes.get('wrapper'));

function onMouseLeave() {
	tooltipStyle.value = {
		visibility: 'hidden',
		transform: 'translate(-9999px, -9999px)',
	};
}

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	const margin = 12;
	const element = ( target as Element ).closest( '[data-hover]' );
	
	if ( !element || sizes.size < 3 ) {
		return onMouseLeave();
	}

	tooltipContent.value = element.getAttribute( 'data-hover' )!;

	// Prevent tooltip from going off screen
	const { width: tooltipWidth, height: tooltipHeight } = sizes.get( 'tooltip' )!;
	const { width: bodyWidth, height: bodyHeight } = sizes.get( 'body' )!;
	const overflows = ( clientX + tooltipWidth + ( margin * 3) > bodyWidth ) || ( clientY + tooltipHeight + ( margin * 3 ) > bodyHeight );
	const left = clientX + margin + 'px';
	const top = clientY + margin + 'px';
	const marg = `${ overflows ? -margin : 0 }px`;
	const offset = `${ overflows ? 100 : 0 }%`;

	tooltipStyle.value = {
		visibility: 'visible',
		transform: `translate( calc( ${left} + ${marg} - ${offset} ), calc( ${top} + ${marg} - ${offset} ) )`,
	};
}

onMounted( () => {
	// Set initial size
	sizes.set( 'wrapper', wrapper.value!.getBoundingClientRect() );

	// Add event listeners
	resizeObserver.observe( wrapper.value! );
	resizeObserver.observe( tooltip.value! );
	resizeObserver.observe( document.body );
} );

onBeforeUnmount( () => {
	// Remove event listeners
	resizeObserver.disconnect();
} );
</script>

<style>
/* Add grayscale filter to all elements that are not hovered or not containing a hovered element */
.wrapper:hover {
	g:not(
		:is(
			:has(:hover),
			:hover
		)
	) {
		filter: grayscale(100%);
	}
}

/* Add brightness filter only to immediate "<g>" tag of the hovered elements */
g:has(:hover):not(:has(g :hover)) {
	filter: brightness(1.1);
}
</style>

