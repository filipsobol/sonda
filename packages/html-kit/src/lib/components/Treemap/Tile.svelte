<g>
	<rect
		data-tile={ content.path }
		data-hover={ hoverData }
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
		style:--percentage={ percentage }
		class="stroke-gray-500 { isFolder( content ) ? 'cursor-zoom-in' : 'cursor-pointer' }"
		shape-rendering="crispEdges"
		vector-effect="non-scaling-stroke"
	/>

	<foreignObject
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
		class="pointer-events-none"
	>
		<p
			xmlns="http://www.w3.org/1999/xhtml"
			class="p-1 size-full text-center text-xs truncate"
		>
			{#if shouldDisplayText}
				<span class="text-gray-900">{ content.name }</span>
				<span class="text-gray-600">- { formattedSize }</span>
			{/if}
		</p>
	</foreignObject>

	{#if children.length}
		<Level
			content={ children }
			{ totalBytes }
			width={ childWidth }
			height={ childHeight }
			xStart={ tile.x + padding }
			yStart={ tile.y + paddingTop }
		/>
	{/if}
</g>

<script lang="ts">
import Level from './Level.svelte';
import { formatSize } from '$lib/helpers/format';
import { store } from '$lib/store.svelte.js';
import { isFolder, type Content } from '$lib/helpers/FileSystemTrie';
import type { TileData } from '$lib/helpers/treemap';

const tresholdInPixels = 20;
const padding = 6;
const paddingTop = 22;

interface Props {
	tile: TileData;
	content: Content;
	totalBytes: number;
}

let { tile, content, totalBytes }: Props = $props();

const childWidth = $derived( tile.width - ( padding * 2 ) );
const childHeight = $derived( tile.height - padding - paddingTop );
const formattedSize = $derived( formatSize( content[ store.compression ] ) );
const percentageOfTotal = $derived( Math.min( content[ store.compression ] / totalBytes * 100, 100 ) );
const hoverData = $derived( `${ content.name } - ${ formattedSize } (${ percentageOfTotal.toFixed( 2 ) }%)` );
const percentage = $derived( Math.round( percentageOfTotal ) + '%' );
const shouldDisplayText = $derived( tile.width >= ( paddingTop * 1.75 ) && tile.height >= paddingTop );

const children = $derived.by(() => {
	if ( !isFolder( content ) || childHeight <= tresholdInPixels || childWidth <= tresholdInPixels ) {
		return [];
	}

	return content.items;
} );
</script>

<style>
rect {
	fill: color-mix(in oklch, #fca5a5 var(--percentage), #86efac)
}

rect:hover {
	fill: color-mix(in oklch, #fecaca var(--percentage), #bbf7d0);
}
</style>
