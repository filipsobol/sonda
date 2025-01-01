<svelte:body
	{ onclick }
	{ onkeydown }
/>

<div class="flex mb-4">
	<div class="flex-grow flex gap-4">
		<Tabs values={ tabs } bind:active={ activeTab } />

  	<Button variant="outline">Search</Button>
	</div>

	{#if activeTab === 'treemap'}
		<div class="flex gap-4">
			<Tabs values={ colors } bind:active={ activeColor } />
			<Tabs values={ sizes } bind:active={ activeSize } />
		</div>
	{/if}
</div>

<div
	role="application"
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="flex-grow overflow-hidden w-full h-full"
>
	{#if store.trie[assetPath]}
		{#if activeTab === 'summary'}
			<h1 class="text-2xl font-bold">Summary</h1>
			<p class="text-gray-500">This is a summary of the asset.</p>
		{:else if activeTab === 'treemap'}
			<Treemap
				content={ store.trie[assetPath].root }
				{ width }
				{ height }
			/>
		{/if}
	{:else}
		<NoData />
	{/if}
</div>

<script lang="ts">
import { page } from '$app/state';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import NoData from '$lib/components/NoData.svelte';
import Tabs from '$lib/Tabs/Tabs.svelte';
import Button from '$lib/Button/Button.svelte';
import { store } from '$lib/store.svelte.js';

const tabs: Array<[ string, string ]> = [
	[ 'summary', 'Summary' ],
	[ 'treemap', 'Treemap' ],
];

const colors: Array<[ string, string ]> = [
	[ 'size', 'Size' ],
	[ 'difference', 'Difference' ],
	[ 'duplicate', 'Duplicate' ],
];

const sizes: Array<[ string, string ]> = [
	[ 'uncompressed', 'Uncompressed' ],
	[ 'gzip', 'GZIP' ],
	[ 'brotli', 'Brotli' ],
];

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeTab = $state( 'summary' );
let activeSize = $state( 'uncompressed' );
let activeColor = $state( 'size' );

$inspect(activeTab);

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
