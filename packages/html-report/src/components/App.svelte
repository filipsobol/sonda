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

	<!-- Treemap -->
	<div
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow font-mono"
	>
		{#if width && height}
			<Treemap
				content={ activeOutput.root }
				{ width }
				{ height }
			/>
		{/if}
	</div>
</div>

<Dialog
	open={ !!focusedFolder }
	title={ `Details of the <code>${ focusedFolder!.name }</code> directory` }
	description={ `Full path: <code>${ focusedFolder!.path }</code>` }
	onClose={ () => focusedFolder = null }
>
	{#snippet children()}
		<Treemap
			content={ focusedFolder! }
			width={ width * 0.9 }
			height={ height * 0.9 }
		/>
	{/snippet}
</Dialog>

<Dialog
	open={ !!focusedFile }
	title={ `Details of the <code>${ focusedFile!.name }</code> file` }
	description={ `Full path: <code>${ focusedFile!.path }</code>` }
	onClose={ () => focusedFile = null }
>
	{#snippet children()}
		<pre class="p-4">{ JSON.stringify( focusedFile, null, 2 ) }</pre>
		<pre class="p-4">{ JSON.stringify( getImporters(focusedFile!), null, 2 ) }</pre>
	{/snippet}
</Dialog>

<Tooltip />

<script lang="ts">
import { isFolder, getTrie, type File, type Folder } from '../FileSystemTrie';

import Header from './Header.svelte';
import Treemap from './Treemap.svelte';
import Dialog from './Dialog.svelte';
import Tooltip from './Tooltip.svelte';

const report = window.SONDA_JSON_REPORT;
const outputs = getTrie( report );

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let focusedFolder = $state<Folder | null>( null );
let focusedFile = $state<File | null>( null );
let activeOutputIndex = $state<number>( 0 );

const activeOutput = $derived( outputs[ activeOutputIndex ] );

function onclick( { target }: Event ) {
	const path = target instanceof Element && target.getAttribute( 'data-tile' );

	if ( !path ) {
		return;
	}

	const content = activeOutput.get( path );

	if ( !content ) {
		return;
	}

	if ( isFolder( content ) ) {
		return focusedFolder = content;
	}

	return focusedFile = content;
}

function onkeydown(  event: KeyboardEvent  ) {
	if ( event.key !== 'Escape' ) {
		return;
	}

	event.stopPropagation();

	if ( focusedFile ) {
		return focusedFile = null;
	}

	if ( focusedFolder ) {
		return focusedFolder = null;
	}
}

function getImporters( content: File ) {
	return Object.entries( report.inputs )
		.filter( ( [, file ] ) => file.imports.includes( content.path ) )

		// TODO: Remove this to get all importers data
		.map( ( [ path ] ) => path );
}
</script>
