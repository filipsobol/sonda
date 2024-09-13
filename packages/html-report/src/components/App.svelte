<svelte:body
	onclick={ onClick }
	onkeydown={ onClick }
/>

<div
	role="application"
	class="wrapper relative flex flex-col overflow-hidden font-mono h-screen w-screen"
>
	<!-- Tabs-->
	<div class="relative flex w-full h-auto overflow-scroll p-4">
		{#each outputs as output}
			<button
				class="py-2.5 px-5 me-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
				onclick={() => activeOutput = output!}
				data-hover={ output.path }
			>
				{ output.name }
			</button>
		{/each}
	</div>

	<!-- Treemap -->
	<div
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow"
	>
		{#if width && height}
			<Treemap
				content={ activeFolder }
				width={ width }
				height={ height }
			/>
		{/if}
	</div>

	<Dialog
		open={ !!focusedFolder }
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
		onClose={ () => focusedFile = null }
		dark={ true }
	>
		{#snippet children()}
			<pre class="p-4">{ JSON.stringify( focusedFile, null, 2 ) }</pre>
			<pre class="p-4">{ JSON.stringify( getImporters(focusedFile!), null, 2 ) }</pre>
		{/snippet}
	</Dialog>

	<Tooltip />
</div>

<script lang="ts">
import { isFolder, parse, type Content, type Folder } from '../parser';

import Treemap from './Treemap.svelte';
import Dialog from './Dialog.svelte';
import Tooltip from './Tooltip.svelte';

const report = window.SONAR_JSON_REPORT;
const outputs = Object.keys( report.outputs ).map( key => ({
	name: key.split( '/' ).pop(),
	path: key,
}) );
const parsedReport = parse( report );

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeOutput = $state( outputs[0]! );
let focusedFolder = $state<Folder | null>( null );
let focusedFile = $state<Content | null>( null );

const activeFolder = $derived( parsedReport[ outputs.findIndex( output => output.name === activeOutput.name ) ] );

function onClick( { target }: Event ) {
	const contentData = (target as any)?.contentData;

	if ( !contentData ) {
		return;
	}

	if ( isFolder( contentData ) ) {
		return focusedFolder = contentData;
	}

	return focusedFile = contentData;
}

function getImporters( content: Content ) {
	return Object.entries( report.inputs )
		.filter( ( [, file ] ) => file.imports.includes( content.path ) )

		// TODO: Remove this to get all importers data
		.map( ( [ path ] ) => path );
}
</script>
