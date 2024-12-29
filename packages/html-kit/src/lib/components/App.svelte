<svelte:body
	{ onclick }
	{ onkeydown }
/>

<div
	role="application"
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="flex-grow overflow-hidden w-full h-full"
>
	{#if store.output}
		<Treemap
			content={ store.output!.root }
			{ width }
			{ height }
		/>
	{:else}
		<NoData />
	{/if}
</div>

<script lang="ts">
import Treemap from './Treemap/Treemap.svelte';
import NoData from './NoData.svelte';
import { store } from '$lib/store.svelte.js';

let width = $state<number>( 0 );
let height = $state<number>( 0 );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = store.output?.get( path );

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
