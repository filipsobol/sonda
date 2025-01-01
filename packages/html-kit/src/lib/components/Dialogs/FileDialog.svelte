<Dialog heading={ file.path }>
	{#snippet children()}
		<div class="flex flex-col overflow-auto p-1">
			<div class="grid grid-cols-[auto_1fr] gap-x-12 max-w-[400px]">
				{#if format !== 'UNKNOWN'}
					<span>File format</span>
					<span class="font-bold text-right">{ format }</span>
				{/if}

				<span>Original file size</span>
				<span class="font-bold text-right">{ formatSize( input?.bytes || 0 ) }</span>

				<span>Bundled size</span>
				<span class="font-bold text-right">{ formatSize( file.uncompressed ) }</span>

				{#if file.gzip}
					<span>Approx. GZIP size</span>
					<span class="font-bold text-right">{ formatSize( file.gzip ) }</span>
				{/if}

				{#if file.brotli}
					<span>Approx. Brotli size</span>
					<span class="font-bold text-right">{ formatSize( file.brotli ) }</span>
				{/if}
			</div>

			{#if dependencyTree}
				<p class="mt-8">This file is in the bundle, because it is:</p>
				<pre class="mt-2 p-4 w-full leading-5 bg-slate-100 rounded overflow-auto text-sm"><code>{ dependencyTree }</code></pre>
			{/if}

			{#if hasSource}
				<div class="mt-8">
					<button
						type="button"
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 rounded-lg text-sm px-5 h-10"
						onclick={ () => console.log( 'TODO' ) }
					>
						Show used code
					</button>
				</div>
			{/if}
		</div>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import { formatSize } from '$lib/helpers/format';
import { AsciiTree, type Items } from '$lib/helpers/AsciiTree';
import type { File } from '$lib/helpers/FileSystemTrie';
import { store } from '$lib/store.svelte';

interface Props {
	file: File;
}

let { file }: Props = $props();

const input = $derived( store.report.inputs[ file.path ] );
const format = $derived( input?.format.toUpperCase() ?? 'UNKNOWN' );
const hasSource = $derived( store.output!.root.map?.sources.includes( file.path ) );

function getImporters(
	key: string,
	items: Items
): Array<[ string, string ]> {
	// Do not show more importers if current file already has multiple importers
	if ( items.length > 1 ) {
		return [];
	}

	return Object
		.entries( store.report.inputs )
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
