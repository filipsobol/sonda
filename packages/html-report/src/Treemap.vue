<template>
	<div
		ref="wrapper"
		class="flex size-full cursor-pointer"
	>
		<svg
			v-if="wrapper"
			:width="svgSize!.width"
			:height="svgSize!.height"
			xmlns="http://www.w3.org/2000/svg"
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
			ref="tooltip"
			class="hidden absolute z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap"
		>
			{{ tooltipContent }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Level from './Level.vue';
import type { Content } from './data';

defineProps<{
	content: Content;
}>();

const resizeObserver = new ResizeObserver( entries => {
	entries.forEach( entry => {
		switch ( entry.target ) {
			case wrapper.value: return svgSize.value = entry.contentRect;
		}
	} );
} );

const wrapper = ref<HTMLElement>();
const tooltip = ref<HTMLElement>();
const svgSize = ref<DOMRectReadOnly>();
const tooltipContent = ref('');

function onMouseEnter() {
	tooltip.value!.style.display = 'block';
}

function onMouseLeave() {
	tooltip.value!.style.display = 'none';
}

function onMouseMove( { clientX, clientY }: MouseEvent ) {
	const margin = 12;

	const hoverElement = document
		?.elementFromPoint( clientX, clientY )
		?.closest( 'g[data-hover]' );
	
	if ( !hoverElement ) {
		return onMouseLeave();
	}

	onMouseEnter();

	tooltipContent.value = hoverElement.getAttribute( 'data-hover' ) ?? '';

	requestAnimationFrame( () => {
		const { width, height } = tooltip.value!.getBoundingClientRect();

		// Prevent tooltip from going off screen
		tooltip.value!.style.left = clientX + width + margin > window.innerWidth - margin
			? `${clientX - width - margin}px`
			: `${clientX + margin}px`;

		tooltip.value!.style.top = clientY + height + margin > window.innerHeight - margin
			? `${clientY - height - margin}px`
			: `${clientY + margin}px`;
	} );
}

onMounted( () => {
	// Set initial size
	svgSize.value = wrapper.value!.getBoundingClientRect();

	// Add event listeners
	resizeObserver.observe( wrapper.value! );
	wrapper.value!.addEventListener( 'mousemove', onMouseMove);
	wrapper.value!.addEventListener( 'mouseenter', onMouseEnter);
	wrapper.value!.addEventListener( 'mouseleave', onMouseLeave);
} );

onBeforeUnmount( () => {
	// Remove event listeners
	resizeObserver.disconnect();
	wrapper.value!.removeEventListener( 'mousemove', onMouseMove );
	wrapper.value!.removeEventListener( 'mouseenter', onMouseEnter );
	wrapper.value!.removeEventListener( 'mouseleave', onMouseLeave );
} );
</script>
