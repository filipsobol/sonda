<Dialog heading={ file.path } >
	{#snippet children()}
		<div class="flex flex-col overflow-y-auto">
			<div class="grid grid-cols-[auto_1fr] gap-x-8">
				{#if format !== 'UNKNOWN'}
					<span>File format</span>
					<span class="font-bold">{ format }</span>
				{/if}

				<span>Original file size</span>
				<span class="font-bold">{ formatSize( input?.bytes || 0 ) }</span>

				<span>Bundled size</span>
				<span class="font-bold">{ formatSize( file.uncompressed ) }</span>

				{#if file.gzip}
					<span>Approx. GZIP size</span>
					<span class="font-bold">{ formatSize( file.gzip ) }</span>
				{/if}

				{#if file.brotli}
					<span>Approx. Brotli size</span>
					<span class="font-bold">{ formatSize( file.brotli ) }</span>
				{/if}
			</div>

			{#if dependencyTree}
				<p class="mt-12">This file is in the bundle, because it is:</p>
				<code class="mt-2 p-4 w-max leading-5 bg-slate-200 rounded overflow-auto min-w-full">
					<pre>{ dependencyTree }</pre>
				</code>
			{/if}
		</div>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import { formatSize } from '../../format';
import { AsciiTree, type Items } from '../../AsciiTree';
import type { File } from '../../FileSystemTrie';

interface Props {
	file: File;
}

let { file }: Props = $props();

const input = $derived( window.SONDA_JSON_REPORT.inputs[ file.path ] );
const format = $derived( input?.format.toUpperCase() ?? 'UNKNOWN' );

function getImporters(
	key: string,
	items: Items
): Array<[ string, string ]> {
	// Do not show more importers if current file already has multiple importers
	if ( items.length > 1 ) {
		return [];
	}

	return Object
		.entries( window.SONDA_JSON_REPORT.inputs )
		.filter( ( [ , file ] ) => file.imports.includes( key ) )
		.map( ( [ path ] ) => [ path, `imported by ${ path }` ] );
}

const dependencyTree = $derived.by<string | null>( () => {
	if ( !input ) {
		return null;
	}

	const start: Array<[ string, string ]> = input.belongsTo
		// If the file is part of a bundle, show the bundle name first
		? [ [ input.belongsTo, `part of the ${ input.belongsTo } bundle` ] ]
		// Otherwise, show file importers
		: getImporters( file.path, [] );

	return AsciiTree.generate(
		start,
		getImporters
	);
} );
</script>
