<svelte:body
	{ onclick }
	{ onkeydown }
/>

<div
	role="application"
	class="wrapper relative flex flex-col overflow-hidden h-screen w-screen"
>
	<Header />

	<div
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow overflow-hidden"
	>
		{#if activeOutput.output}
			<Treemap
				content={ activeOutput.output!.root }
				{ width }
				{ height }
			/>
		{:else}
			<NoData />
		{/if}
	</div>
</div>

<Dialogs />
<Tooltip />

<script lang="ts">
import Dialogs from './Dialogs/Dialogs.svelte';
import Header from './Header/Header.svelte';
import Treemap from './Treemap/Treemap.svelte';
import NoData from './NoData.svelte';
import Tooltip from './Tooltip.svelte';
import { activeOutput, dialog } from '../stores/index.svelte.js';
import { isFolder } from '../FileSystemTrie';

let width = $state<number>( 0 );
let height = $state<number>( 0 );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = activeOutput.output?.get( path );

	if ( !content ) {
		return;
	}

	dialog.open( isFolder( content ) ? 'folder' : 'file', content );
}

function onkeydown(  event: KeyboardEvent  ) {
	if ( event.key !== 'Escape' ) {
		return;
	}

	event.stopPropagation();
	dialog.close();
}
</script>

<style>
:global {
	* {
		scrollbar-width: thin;
	}
}
</style>
