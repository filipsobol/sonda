<g>
	<rect
		data-tile={ content.path }
		data-hover={ hoverData }
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
		style:--percentage={ percentage }
		class="stroke-gray-400 { isFolder( content ) ? 'cursor-zoom-in' : 'cursor-pointer' }"
		shape-rendering="crispEdges"
		vector-effect="non-scaling-stroke"
	/>

	{#if shouldDisplayText}
		<foreignObject
			x={ tile.x }
			y={ tile.y }
			width={ tile.width }
			height={ tile.height }
			class="pointer-events-none"
		>
			<div
				xmlns="http://www.w3.org/1999/xhtml"
				class="@container px-2 py-1 size-full flex justify-center flex-nowrap text-sm gap-1"
			>
				<!-- https://stackoverflow.com/a/42551367/4617687 -->
				<p dir="rtl" class="text-gray-900 flex-shrink truncate">&lrm;{ content.name }</p>
				<p class="text-gray-600 flex-shrink-0 hidden @2xs:block">—</p>
				<p class="text-gray-600 flex-shrink-0 hidden @2xs:block">{ formattedSize }</p>
			</div>
		</foreignObject>
	{/if}

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
const paddingTop = 26;

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
const hoverData = $derived( `${ content.name } — <b>${ formattedSize } (${ percentageOfTotal.toFixed( 2 ) }%)</b>` );
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
	fill: color-mix(in oklch, var(--color-red-100) var(--percentage), var(--color-green-100));
}

rect:hover {
	fill: color-mix(in oklch, var(--color-red-200) var(--percentage), var(--color-green-200));
}
</style>
