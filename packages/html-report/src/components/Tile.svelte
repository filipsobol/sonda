<g>
	<rect
		bind:this={ element }
		data-tile={ path }
		data-hover={ `${ name } - ${ formattedSize } (${ percentageOfTotal }%)` }
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
		fill={ color }
		class="stroke-gray-800 stroke-[0.3] { isFolder( content ) ? 'cursor-zoom-in' : 'cursor-pointer' }"
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
				<span class="text-gray-900 font-semibold">{ name }</span>
				<span class="text-gray-600">- { formattedSize }</span>
			{/if}
		</p>
	</foreignObject>

	{#if children}
		<Level
			content={ children }
			width={ childWidth }
			height={ childHeight }
			xStart={ tile.x + padding }
			yStart={ tile.y + paddingTop }
		/>
	{/if}
</g>

<script lang="ts">
import { getContext, onDestroy, onMount } from 'svelte';
import Level from './Level.svelte';
import { isFolder, type Content } from '../parser';
import type { TileData } from '../TreeMapGenerator';

const padding = 6;
const paddingTop = 22;

interface Props {
	tile: TileData;
	content: Content;
}

let { tile, content }: Props = $props();

let element = $state<SVGRectElement & { contentData?: Content }>();

const totalSize = getContext<number>( 'totalSize' );
const childWidth = $derived( tile.width - ( padding * 2 ) );
const childHeight = $derived( tile.height - padding - paddingTop );
const formattedSize = $derived( formatSize( content.bytes ) );
const percentageOfTotal = $derived( ( content.bytes / totalSize * 100 ).toFixed(2) );
const color = $derived( `color-mix(in oklch, #fca5a5 ${ percentageOfTotal }%, #86efac)` );
const shouldDisplayText = $derived( tile.width >= ( paddingTop * 1.75 ) && tile.height >= paddingTop );
const name = $derived( isFolder( content ) ? content.name : content.filename );
const path = $derived( isFolder( content ) ? content.path : content.mappedPath );

const children = $derived.by(() => {
	if ( !isFolder(content) ) {
		return;
	}

	const children = Object.values( content.contents );

	if ( !children.length || childHeight <= 0 || childWidth <= 0 ) {
		return;
	}

	return children;
} );

function formatSize( bytes: number ) {
	const distance = 1024;
	const sizes = [
		'b',
		'KiB',
		'MiB',
		'GiB',
		'TiB',
		'PiB',
	];

	let size = bytes;
	let iterations = 0;

	while ( size > distance && ( sizes.length > iterations + 1 ) ) {
		size = size/distance;
		iterations++;
	}

	// Use `toFixed` only if the size is in KiB or greater.
	return `${ iterations ? size.toFixed(2) : size } ${ sizes[iterations] }`;
}

onMount( () => {
	element!.contentData = content;
} );

onDestroy( () => {
	element!.contentData = undefined;
} );
</script>
