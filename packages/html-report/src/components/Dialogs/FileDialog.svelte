<Dialog heading={ file.path } >
	{#snippet children()}
		<div class="flex flex-col overflow-auto">
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
				<pre class="mt-2 p-4 w-full leading-5 bg-slate-200 rounded overflow-auto flex-shrink-0"><code>{ dependencyTree }</code></pre>
			{/if}

			{#if sourceCode}
				<p class="mt-12">Code that ended up in the bundle is highlighted:</p>
				<pre class="mt-2 p-4 w-full leading-5 bg-slate-200 rounded overflow-auto"><code bind:this={ codeElement }>{ sourceCode }</code></pre>
			{/if}
		</div>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import { formatSize } from '../../format';
import { AsciiTree, type Items } from '../../AsciiTree';
import type { File } from '../../FileSystemTrie';
import { activeOutput } from '../../stores/index.svelte';

interface Props {
	file: File;
}

let { file }: Props = $props();

let codeElement = $state<HTMLElement>();

const input = $derived( window.SONDA_JSON_REPORT.inputs[ file.path ] );
const format = $derived( input?.format.toUpperCase() ?? 'UNKNOWN' );
const sourceMap = $derived( activeOutput.output!.root.map );
const sourceIndex = $derived( sourceMap?.sources.indexOf( file.path ) ?? -1 );
const sourceCode = $derived( sourceIndex >= 0 ? sourceMap!.sourcesContent![ sourceIndex ] : null );

$effect( () => {
	if ( !codeElement ) {
		return;
	}

	const sourceCodeNode = codeElement.firstChild!;
	const highlight = new Highlight();

	const lineStartOffsets = sourceCode!
		.split( /(?<=\r?\n)/ )
		.reduce((offsets, line) => {
			offsets.push(offsets[offsets.length - 1] + line.length);
			return offsets;
		}, [0] as Array<number>);

	sourceMap!.mappings
		.flat()
		.filter( segment => segment[1] === sourceIndex )
		.forEach( ( segment, index, segments ) => {
			const [ , , line, column ] = segment as [ number, number, number, number ];
			const nextSegment = segments[ index + 1 ];
			const lineOffset = lineStartOffsets[ line ];
			const start = lineOffset + column;
			const end = line === nextSegment?.[2]
				? nextSegment[3]! + lineOffset
				: lineStartOffsets[ line + 1 ];

			const range = new Range();
			range.setStart( sourceCodeNode, start );
			range.setEnd( sourceCodeNode, end );
			// @ts-ignore
			highlight.add( range );
		});

	// @ts-ignore
	CSS.highlights.set('used-code', highlight);
} );

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

<style>
::highlight(used-code) {
	background-color: theme( 'colors.orange.200' );
	color: theme( 'colors.orange.900' );
}
</style>
