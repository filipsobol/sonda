<svelte:body
	onclick={ onClick }
	onkeydown={ onClick }
/>

<div
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	role="application"
	class="wrapper relative flex size-full overflow-hidden font-mono"
>
	{#if width && height}
		<Treemap
			content={ parsedReport }
			width={ width }
			height={ height }
		/>
	{/if}

	<Dialog
		open={ !!activeFolder }
		onClose={ () => activeFolder = null }
	>
		{#snippet children()}
			<Treemap
				content={ activeFolder! }
				width={ width * 0.9 }
				height={ height * 0.9 }
			/>
		{/snippet}
	</Dialog>

	<Dialog
		open={ !!activeFile }
		onClose={ () => activeFile = null }
		dark={ true }
	>
		{#snippet children()}
			<pre class="p-4">{ JSON.stringify( activeFile, null, 2 ) }</pre>
			<pre class="p-4">{ JSON.stringify( getImporters(activeFile!), null, 2 ) }</pre>
		{/snippet}
	</Dialog>

	<Tooltip />
</div>

<script lang="ts">
import { setContext } from 'svelte';
import type { NormalizedSource } from 'sonar';
import { isFolder, parse, type Folder } from '../parser';

import Treemap from './Treemap.svelte';
import Dialog from './Dialog.svelte';
import Tooltip from './Tooltip.svelte';

const report = window.SONAR_JSON_REPORT;
const parsedReport = parse( report );

setContext<number>( 'totalSize', parsedReport.bytes );

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let activeFolder = $state<Folder | null>( null );
let activeFile = $state<NormalizedSource | null>( null );

function onClick( { target }: Event ) {
	const contentData = (target as any)?.contentData;

	if ( !contentData ) {
		return;
	}

	if ( isFolder( contentData ) ) {
		return activeFolder = contentData;
	}

	return activeFile = contentData;
}

function getImporters( content: NormalizedSource ) {
	let parent = content.parent;
	let nodes = [
		content.originalPath
	];

	while ( parent ) {
		nodes.push( parent );
		parent = report[ parent ]?.parent;
	}

	return Object
		.entries( report )
		.filter( ( [ _path, source ] ) => source.bytes > 0  )
		.filter( ( [ _path, source ] ) => source.imports.some( node => nodes.includes( node ) ) )
		.map( ( [ path ] ) => path );
}
</script>
