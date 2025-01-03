<svelte:body
	{ onclick }
	{ onkeydown }
/>

{#if trie}
	<div class="flex mb-4 items-center">
		<div class="flex-grow flex gap-4">
			<Tabs
				values={ tabs }
				bind:active={
					() => page.state.tab ??= tabs[ 0 ][ 0 ],
					v => pushState( page.url.hash, { tab: v } )
				}
			/>
		</div>

		{#if page.state.tab === 'treemap'}
			<div class="flex gap-4">
				<Tabs values={ colors } bind:active={ activeColor } />
    		<Tabs values={ store.compressions } bind:active={ store.compression } />
			</div>
		{/if}
	</div>

	<div
		role="application"
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow overflow-hidden w-full h-full"
	>
		{#if page.state.tab === 'summary'}
			<h1 class="text-2xl font-bold mb-4 text-gray-900">Summary</h1>
			<p class="text-gray-500">This is a summary of the asset.</p>
		{:else if page.state.tab === 'treemap'}
			<Treemap
				content={ trie.root }
				{ width }
				{ height }
			/>
		{/if}
	</div>
{:else}
	<NoData />
{/if}

<script lang="ts">
import { page } from '$app/state';
import { pushState } from '$app/navigation';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import NoData from '$lib/components/NoData/NoData.svelte';
import Tabs from '$lib/components/Tabs/Tabs.svelte';
import { store } from '$lib/store.svelte.js';
import { getOutputTrie } from '$lib/helpers/FileSystemTrie';

const tabs: Array<[ string, string ]> = [
	[ 'summary', 'Summary' ],
	[ 'treemap', 'Treemap' ],
];

const colors: Array<[ string, string ]> = [
	[ 'size', 'Size' ],
	[ 'difference', 'Difference' ],
	[ 'duplicate', 'Duplicate' ],
];

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeColor = $state( colors[ 0 ][ 0 ] );

const trie = $derived( getOutputTrie( page.params.id, store.report ) );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = trie?.get( path );

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
