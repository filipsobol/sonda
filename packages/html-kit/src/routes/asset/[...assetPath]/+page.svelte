<svelte:body
	{ onclick }
	{ onkeydown }
/>

<div class="flex">
  <Button variant="outline">Search</Button>
  <Button variant="outline">See details</Button>
</div>

<div
	role="application"
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="flex-grow overflow-hidden w-full h-full"
>
	{#if store.trie[assetPath]}
		<Treemap
			content={ store.trie[assetPath].root }
			{ width }
			{ height }
		/>
	{:else}
    asd
		<NoData />
	{/if}
</div>

<script lang="ts">
import { page } from '$app/state';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import NoData from '$lib/components/NoData.svelte';
import Button from '$lib/Button/Button.svelte';
import { store } from '$lib/store.svelte.js';

let width = $state<number>( 0 );
let height = $state<number>( 0 );

const assetPath = $derived( page.params.assetPath );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = store.trie[assetPath]?.get( path );

	if ( !content ) {
		return;
	}

	// TODO: Open dialog
	// dialog.open( isFolder( content ) ? 'folder' : 'file', content );
}

function onkeydown(  event: KeyboardEvent  ) {
	if ( event.key !== 'Escape' ) {
		return;
	}

	event.stopPropagation();

	// TODO: Close dialog
	// dialog.close();
}
</script>
