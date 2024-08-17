{#each tiles as tile, index ( children[index].path ) }
	<Tile
		tile={ tile}
		content={ children[index] }
	/>
{/each}

<script lang="ts">
import Tile from './Tile.svelte';
import { TreeMapGenerator } from '../TreeMapGenerator';
import type { Content } from '../data';

interface Props {
	content: Content;
	width: number;
	height: number;
	xStart: number;
	yStart: number;
}

let {
	content,
	width,
	height,
	xStart,
	yStart
}: Props = $props();

const children = $derived.by(() => {
	if ( content.type === 'file' ) {
		return [];
	}

	return Object
		.values<Content>( content.contents )
		.sort( ( a, b ) => b.bytes - a.bytes );
});

const tiles = $derived.by( () => {
	if ( !children.length ) {
		return [];
	}

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
