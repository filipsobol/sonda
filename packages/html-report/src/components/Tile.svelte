<g data-hover={ `${ content.name } - ${ formattedSize } (${ percentageOfTotal }%)` }>
	<rect
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
		fill={ color }
		class="stroke-slate-500 stroke-1"
	/>

	<foreignObject
		x={ tile.x }
		y={ tile.y }
		width={ tile.width }
		height={ tile.height }
	>
		<p
			xmlns="http://www.w3.org/1999/xhtml"
			class="p-1 size-full text-center text-xs truncate"
		>
			{#if shouldDisplayText}
				<span class="text-gray-900 font-semibold">{ content.name }</span>
				<span class="text-gray-600">- { formattedSize }</span>
			{/if}
		</p>
	</foreignObject>

	{#if shouldDisplayChildren}
		<Level
			content={ content }
			width={ childWidth }
			height={ childHeight }
			xStart={ tile.x + padding }
			yStart={ tile.y + paddingTop }
		/>
	{/if}
</g>

<script lang="ts">
import { getContext } from 'svelte';
import Level from './Level.svelte';
import type { Content } from '../parser';
import type { TileData } from '../TreeMapGenerator';

const padding = 6;
const paddingTop = 22;

interface Props {
	tile: TileData;
	content: Content;
}

let { tile, content }: Props = $props();

const totalSize = getContext<number>( 'totalSize' );
const childWidth = $derived( tile.width - ( padding * 2 ) );
const childHeight = $derived( tile.height - padding - paddingTop );
const formattedSize = $derived( formatSize( content.bytes ) );
const percentageOfTotal = $derived( ( content.bytes / totalSize * 100 ).toFixed(2) );
const color = $derived( `color-mix(in oklch, #fca5a5 ${ percentageOfTotal }%, #86efac)` );
const shouldDisplayText = $derived( tile.width >= ( paddingTop * 1.75 ) && tile.height >= paddingTop );

const shouldDisplayChildren = $derived( content.type === 'folder'
		&& Object.keys( content.contents ).length > 0
		&& childHeight > 0
		&& childWidth > 0
);

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
</script>
