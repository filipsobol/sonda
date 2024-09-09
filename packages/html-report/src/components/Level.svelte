{#each tiles as tile, index ( tile ) }
	<Tile
		tile={ tile }
		content={ children[index] }
		totalBytes={ totalBytes }
	/>
{/each}

<script lang="ts">
import Tile from './Tile.svelte';
import { TreeMapGenerator } from '../TreeMapGenerator';
import type { Content } from '../parser';

interface Props {
	content: Content | Array<Content>;
	totalBytes: number;
	width: number;
	height: number;
	xStart: number;
	yStart: number;
}

let {
	content,
	totalBytes,
	width,
	height,
	xStart,
	yStart
}: Props = $props();

const children = $derived.by(() => {
	if ( !Array.isArray( content ) ) {
		return [ content ];
	}

	return Object
		.values<Content>( content )
		.sort( ( a, b ) => b.bytes - a.bytes );
});

const tiles = $derived.by( () => {
	const generator = new TreeMapGenerator(
		children.map( child => child.bytes ),
		width,
		height,
		xStart,
		yStart
	);

	return generator.calculate();
} );
</script>
