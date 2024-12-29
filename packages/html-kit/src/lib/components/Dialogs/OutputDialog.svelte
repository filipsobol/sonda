<Dialog heading={ output.root.name } >
	{#snippet children()}
		<div class="flex flex-col overflow-y-auto max-w-[500px]">
			<div class="grid grid-cols-[auto_auto_auto] gap-x-12">
				<span class="font-bold">Type</span>
				<span class="font-bold text-right">Size</span>
				<span class="font-bold text-right">
					Download time

					<span data-hover="Estimations for a slow 3G connection">
						<Info size={20} class="inline-block pointer-events-none" />
					</span>
				</span>

				<span class="font-bold">Uncompressed</span>
				<span class="text-right">{ formatSize( output.root.uncompressed ) }</span>
				<span class="text-right">{ downloadTimeOriginal }</span>

				{#if output.root.gzip}
					<span class="font-bold"> GZIP</span>
					<span class="text-right">{ formatSize( output.root.gzip ) }</span>
					<span class="text-right">{ downloadTimeGzip }</span>
				{/if}

				{#if output.root.brotli}
					<span class="font-bold">Brotli</span>
					<span class="text-right">{ formatSize( output.root.brotli ) }</span>
					<span class="text-right">{ downloadTimeBrotli }</span>
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
			<pre class="mt-2 p-4 w-max leading-5 bg-slate-100 rounded overflow-auto min-w-full"><code>{ dependencyTree }</code></pre>
		{/if}
	{/snippet}
</Dialog>

<script lang="ts">
import { Info } from 'lucide-svelte';
import Dialog from './Dialog.svelte';
import { store } from '$lib/store.svelte';
import { formatSize, formatTime } from '$lib/helpers/format';
import { AsciiTree } from '$lib/helpers/AsciiTree';
import type { ModuleFormat } from 'sonda';
import type { FileSystemTrie } from '$lib/helpers/FileSystemTrie';

interface Props {
	output: FileSystemTrie;
}

let { output }: Props = $props();

const SLOW_3G = 50 * 1024 * 8;

const data = $derived( store.report.outputs[ output.root.name ] );
const downloadTimeOriginal = $derived( formatTime( Math.round( output.root.uncompressed / SLOW_3G * 1000 ) ) );
const downloadTimeGzip = $derived( formatTime( Math.round( output.root.gzip / SLOW_3G * 1000 ) ) );
const downloadTimeBrotli = $derived( formatTime( Math.round( output.root.brotli / SLOW_3G * 1000 ) ) );

const formats = $derived.by( () => {
	const formats: Record<ModuleFormat, number> = {
		esm: 0,
		cjs: 0,
		unknown: 0
	};
	const sources = store.report.inputs;
	
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
