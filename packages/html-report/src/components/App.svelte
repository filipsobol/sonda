<svelte:body
	onclick={ onClick }
	onkeydown={ onClick }
/>

<div
	role="application"
	class="wrapper relative flex overflow-hidden font-mono p-4 h-screen w-screen"
>
	<div class="flex flex-col flex-grow">
		<!-- Tabs-->
		<div class="">
			{#each outputs as output}
				<button
					class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
					onclick={() => activeOutput = output!}
				>
					{ output }
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
import type { ReportInput } from 'sonar';
import { isFolder, parse, type Content, type Folder } from '../parser';

import Treemap from './Treemap.svelte';
import Dialog from './Dialog.svelte';
import Tooltip from './Tooltip.svelte';

const report = window.SONAR_JSON_REPORT;
const outputs = Object.keys( report.outputs ).map( key => key.split( '/' ).pop() );
const parsedReport = parse( report );

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeOutput = $state<string>( outputs[0]! );
let focusedFolder = $state<Folder | null>( null );
let focusedFile = $state<Content | null>( null );

const activeFolder = $derived( parsedReport[ outputs.indexOf( activeOutput ) ] );

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
