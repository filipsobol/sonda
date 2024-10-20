<Dialog heading={ output.root.name } >
	{#snippet children()}
		<div class="flex flex-col overflow-y-auto">
			<div class="grid grid-cols-[auto_1fr] gap-x-8">
				<span>Bundled size</span>
				<span class="font-bold">{ formatSize( output.root.uncompressed ) }</span>

				{#if output.root.gzip}
					<span> GZIP size</span>
					<span class="font-bold">{ formatSize( output.root.gzip ) }</span>
				{/if}

				{#if output.root.brotli}
					<span>Brotli size</span>
					<span class="font-bold">{ formatSize( output.root.brotli ) }</span>
				{/if}
			</div>
		</div>

		{#if unknownPercentage < 100}
			<p class="mt-12">Module types</p>

			<div class="mt-2 h-10 w-[40rem] max-w-full flex rounded-lg overflow-hidden">
				<div class="bg-yellow-300 h-full" style={ `width: ${ esmPercentage }%` }></div>
				<div class="bg-blue-300 h-full" style={ `width: ${ cjsPercentage }%` }></div>
				<div class="bg-gray-200 h-full" style={ `width: ${ unknownPercentage }%` }></div>
			</div>

			<div class="flex justify-between mt-2">
				<div class="flex items-center space-x-2">
					<div class="inline-block w-4 h-4 bg-yellow-300"></div>
					<p>ESM: <span class="font-semibold">{ esmPercentage }%</span></p>
				</div>

				<div class="flex items-center space-x-2">
					<div class="inline-block w-4 h-4 bg-blue-300"></div>
					<p>CJS: <span class="font-semibold">{ cjsPercentage }%</span></p>
				</div>

				<div class="flex items-center space-x-2">
					<div class="inline-block w-4 h-4 bg-gray-300"></div>
					<p>Unknown: <span class="font-semibold">{ unknownPercentage }%</span></p>
				</div>
			</div>
		{/if}

		<p class="mt-12">This asset includes <span class="font-semibold">{ dependencies.length }</span> external dependencies</p>

		{#if dependencies.length > 0}
			<code class="mt-2 p-4 w-max leading-5 bg-slate-200 rounded overflow-auto min-w-full">
				<pre>{ dependencyTree }</pre>
			</code>
		{/if}
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import { formatSize } from '../../format';
import { AsciiTree } from '../../AsciiTree';
import type { ModuleFormat } from 'sonda';
import type { FileSystemTrie } from '../../FileSystemTrie';

interface Props {
	output: FileSystemTrie;
}

let { output }: Props = $props();

const data = $derived( window.SONDA_JSON_REPORT.outputs[ output.root.name ] );

const formats = $derived.by( () => {
	const formats: Record<ModuleFormat, number> = {
		esm: 0,
		cjs: 0,
		unknown: 0
	};
	const sources = window.SONDA_JSON_REPORT.inputs;
	
	Object
		.entries( data!.inputs )
		.forEach( ( [ name, sizes ] ) => {
			const format = sources[ name ]?.format ?? 'unknown';

			formats[ format ] += sizes.uncompressed;
		} );

	return formats;
} );

const esmPercentage = $derived( Math.round( formats.esm / data.uncompressed * 10000 ) / 100 );
const cjsPercentage = $derived( Math.round( formats.cjs / data.uncompressed * 10000 ) / 100);
const unknownPercentage = $derived( Math.round( formats.unknown / data.uncompressed * 10000 ) / 100 );

const dependencies = $derived.by<Array<string>>( () => {
	const packageNameRegExp = /(?:.*node_modules\/)(@[^\/]+\/[^\/]+|[^\/]+)/;

	return Object
		.keys( data.inputs )
		.map( name => name.match( packageNameRegExp )?.[ 1 ] ?? null )
		.filter( ( value, index, self ): value is string => value !== null && self.indexOf( value ) === index )
		.sort();
} );

const dependencyTree = $derived( AsciiTree.generate( dependencies ) );
</script>
