<svelte:body
	{ onclick }
	{ onkeydown }
/>

{#if trie}
	<div class="flex mb-4 items-center">
		<div class="grow flex gap-4">
			<p class="col-span-12 text-2xl font-bold text-gray-900">Bundle overview</p>
		</div>

		<div class="flex gap-4">
			<Tabs values={ tabType.options } bind:current={ tabType.value } />
			<Tabs values={ store.compressions } bind:current={ store.compression } />
		</div>
	</div>

	<div
		role="application"
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="grow overflow-hidden w-full h-full"
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

<script module lang="ts">
declare global {
	namespace App {
		interface PageState {
			tab?: string;
		}
	}
}
</script>

<script lang="ts">
import { page } from '$app/state';
import { pushState } from '$app/navigation';
import Treemap from '$lib/components/Treemap/Treemap.svelte';
import NoData from '$lib/components/NoData/NoData.svelte';
import Tabs from '$lib/components/Tabs/Tabs.svelte';
import { store } from '$lib/store.svelte.js';
import { getOutputTrie } from '$lib/helpers/FileSystemTrie';
import type { Tab } from '$lib/types';

const tabType = {
	options: [
		{ value: 'treemap', label: 'Treemap' },
		{ value: 'summary', label: 'Summary' },
	] satisfies Array<Tab>,
	
	get value() {
		return page.state.tab ??= tabType.options[ 0 ].value;
	},

	set value( v: string ) {
		pushState( page.url.hash, { tab: v } )
	}
};

let width = $state<number>( 0 );
let height = $state<number>( 0 );

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
