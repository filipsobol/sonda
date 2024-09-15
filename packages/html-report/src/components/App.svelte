<svelte:body
	onclick={ onClick }
	onkeydown={ onClick }
/>

<div
	role="application"
	class="wrapper relative flex flex-col overflow-hidden h-screen w-screen"
>
	<div class="flex flex-row p-4 items-center space-y-0 h-16 justify-end space-x-2 bg-gray-50">
		<div class="flex items-center justify-center space-x-2 max-w-sm">
			<label for="outputs" class="block text-sm font-medium text-gray-900">Output</label>
			<select
				bind:value={ activeOutput }
				onchange={() => activeOutput = activeOutput }
				id="outputs"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
			>
				{#each outputs as output, index}
					<option value={ output }>{ index + 1 }. { output.name }</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Treemap -->
	<div
		bind:clientWidth={ width }
		bind:clientHeight={ height }
		class="flex-grow font-mono"
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
>
	{#snippet children()}
		<pre class="p-4">{ JSON.stringify( focusedFile, null, 2 ) }</pre>
		<pre class="p-4">{ JSON.stringify( getImporters(focusedFile!), null, 2 ) }</pre>
	{/snippet}
</Dialog>

<Tooltip />

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
