<svelte:body
	{ onclick }
	{ onkeydown }
/>

<div
	role="application"
	class="wrapper relative flex flex-col overflow-hidden h-screen w-screen"
>
	<Header
		bind:activeOutputIndex={ activeOutputIndex }
		{ outputs }
	/>

	<div
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow overflow-hidden"
	>
		{#if activeOutput}
			<Treemap
				content={ activeOutput.root }
				{ width }
				{ height }
			/>
		{:else}
			<NoData />
		{/if}
	</div>
</div>

{#if activeOutput}
	<FolderDialog
		{ folder }
		{ activeOutput }
	/>

	<FileDialog
		{ file }
		{ activeOutput }
	/>
{/if}

<Tooltip />

<script lang="ts">
import Header from './Header.svelte';
import Treemap from './Treemap.svelte';
import NoData from './NoData.svelte';
import FileDialog from './FileDialog.svelte';
import FolderDialog from './FolderDialog.svelte';
import Tooltip from './Tooltip.svelte';
import { isFolder, getTrie, type File, type Folder, type FileSystemTrie } from '../FileSystemTrie';

const outputs = getTrie( window.SONDA_JSON_REPORT );

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let folder = $state<Folder | null>( null );
let file = $state<File | null>( null );
let activeOutputIndex = $state<number>( 0 );

const activeOutput = $derived<FileSystemTrie | undefined>( outputs.at( activeOutputIndex ) );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = activeOutput!.get( path );

	if ( !content ) {
		return;
	}

	if ( isFolder( content ) ) {
		return folder = content;
	}

	return file = content;
}

function onkeydown(  event: KeyboardEvent  ) {
	if ( event.key !== 'Escape' ) {
		return;
	}

	event.stopPropagation();

	if ( file ) {
		return file = null;
	}

	if ( folder ) {
		return folder = null;
	}
}
</script>
