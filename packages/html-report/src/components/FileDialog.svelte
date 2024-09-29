{#if file}
	<Dialog
		heading={ file!.path }
		onClose={ () => file = null }
	>
		{#snippet children()}
			<div class="flex flex-col overflow-y-auto">
				{#if format !== 'UNKNOWN'}<p>File format: <b>{ format }</b></p>{/if}
				<p>Original size: <b>{ formatSize( input?.bytes || 0 ) }</b></p>
				<p>Bundled size: <b>{ formatSize( file!.bytes ) }</b></p>
				<p>GZIP size: <b>{ formatSize( file!.gzip ) }</b></p>
				<p>Brotli size: <b>{ formatSize( file!.brotli ) }</b></p>

				{#if dependencyTree}
					<p class="mt-8">This file is in the bundle, because it is:</p>
					<code class="mt-2 p-4 leading-5 bg-slate-200 rounded overflow-auto">
						<pre>{ dependencyTree }</pre>
					</code>
				{/if}
			</div>
		{/snippet}
	</Dialog>
{/if}

<script lang="ts">
import Dialog from './Dialog.svelte';
import { formatSize } from '../format';
import type { File } from '../FileSystemTrie';
import { AsciiTree } from '../AsciiTree';

interface Props {
	file: File | null;
}

let { file }: Props = $props();

const input = $derived( file && window.SONDA_JSON_REPORT.inputs[ file.path ] );

const format = $derived.by( () => {
	if ( input ) {
		return input.format.toUpperCase();
	}

	const parent = window.SONDA_JSON_REPORT.inputs[ file!.path ]?.belongsTo;

	if ( !parent ) {
		return 'UNKNOWN';
	}

	return window.SONDA_JSON_REPORT.inputs[ parent ].format.toUpperCase;
} );

const dependencyTree = $derived.by<string | null>( () => {
	if ( !input ) {
		return null;
	}

	const tree = new AsciiTree();

	return tree.render( file!.path );
} );

</script>
