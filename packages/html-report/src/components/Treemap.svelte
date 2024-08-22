<div
	bind:this={ wrapper }
	class="wrapper relative flex size-full cursor-pointer overflow-hidden font-mono"
>
	{#if svgSize}
		<svg
			width={ svgSize!.width }
			height={ svgSize!.height }
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			onmousemove={ onMouseMove }
			onmouseleave={ onMouseLeave }
		>
			<Level
				content={ content }
				width={ svgSize!.width }
				height={ svgSize!.height }
				xStart={ 0 }
				yStart={ 0 }
			/>
		</svg>
	{/if}

	<div
		bind:this={ tooltip }
		style:visibility={ tooltipStyle.visibility }
		style:transform={ tooltipStyle.transform }
		class="invisible absolute z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none"
		role="tooltip"
	>
		{ tooltipContent }
	</div>
</div>

<script lang="ts">
import { setContext, onMount, onDestroy } from 'svelte';
import Level from './Level.svelte';
import { parse } from '../data';

type TrackerDomElements = 'wrapper' | 'tooltip' | 'body';

const resizeObserver = new ResizeObserver( entries => {
	entries.forEach( entry => {
		switch ( entry.target ) {
			case wrapper: return sizes.wrapper = entry.contentRect ;
			case tooltip: return sizes.tooltip = entry.contentRect ;
			case document.body: return sizes.body = entry.contentRect;
		}
	} );
} );

const content = parse( window.SONAR_JSON_REPORT );
let wrapper = $state<HTMLElement>();
let tooltip = $state<HTMLElement>();
let hoveredElement = $state<Element | null>( null );

let tooltipStyle = $state<Record<'visibility' | 'transform', string>>( {
	visibility: 'hidden',
	transform: 'translate(-9999px, -9999px)',
} );

let sizes = $state<Record<TrackerDomElements, DOMRectReadOnly | null>>( {
	wrapper: null,
	tooltip: null,
	body: null,
} );

setContext<number>( 'totalSize', content.bytes );

const tooltipContent = $derived( hoveredElement?.getAttribute( 'data-hover' ) )
const svgSize = $derived( sizes.wrapper );

function onMouseLeave() {
	hoveredElement?.classList.remove( 'hovered' );
	hoveredElement = null;

	tooltipStyle = {
		visibility: 'hidden',
		transform: 'translate(-9999px, -9999px)',
	};
}

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	const margin = 12;

	hoveredElement?.classList.remove( 'hovered' );
	hoveredElement = ( target as Element ).closest( '[data-hover]' );

	if ( !hoveredElement ) {
		return onMouseLeave();
	}

	// Prevent tooltip from going off screen
	const { width: tooltipWidth, height: tooltipHeight } = sizes.tooltip!;
	const { width: bodyWidth, height: bodyHeight } = sizes.body!;
	const overflows = ( clientX + tooltipWidth + ( margin * 3) > bodyWidth ) || ( clientY + tooltipHeight + ( margin * 3 ) > bodyHeight );
	const left = clientX + margin + 'px';
	const top = clientY + margin + 'px';
	const marg = `${ overflows ? -margin : 0 }px`;
	const offset = `${ overflows ? 100 : 0 }%`;

	hoveredElement.classList.add( 'hovered' );

	tooltipStyle = {
		visibility: 'visible',
		transform: `translate( calc( ${left} + ${marg} - ${offset} ), calc( ${top} + ${marg} - ${offset} ) )`,
	};
}

onMount( () => {
	// Add event listeners
	resizeObserver.observe( wrapper! );
	resizeObserver.observe( tooltip! );
	resizeObserver.observe( document.body );
} );

onDestroy( () => {
	// Remove event listeners
	resizeObserver.disconnect();
} );
</script>
