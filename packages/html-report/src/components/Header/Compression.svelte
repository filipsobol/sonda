{#if compressions.length > 1}
	<div class="inline-flex space-x-[-1px] bg-white" role="group">
		{#each compressions as [ type, name ] ( type )}
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium hover:bg-gray-100 text-gray-900 border border-gray-300 first:rounded-s-lg last:rounded-e-lg focus:ring-1 focus:ring-blue-300 focus:z-10"
				class:active={ type === compression.type }
				onclick={ () => compression.setType( type ) }
				title={ `Show the ${ name } file size in diagram` }
			>
				{ name }
			</button>	
		{/each}
	</div>
{/if}

<script lang="ts">
import { compression, activeOutput, type CompressionType } from '../../stores/index.svelte.js';

const hasGzip = $derived( activeOutput.output!.root.gzip > 0 );
const hasBrotli = $derived( activeOutput.output!.root.brotli > 0 );

const compressions = $derived.by( () => {
	const compressions: Array<[ CompressionType, string ]> = [
		[ 'uncompressed', 'Uncompressed' ]
	];

	hasGzip && compressions.push( [ 'gzip', 'GZIP' ] );
	hasBrotli && compressions.push( [ 'brotli', 'Brotli' ] );

	return compressions;
} );
</script>

<style>
button.active,
button.active:hover {
	background-color: theme('colors.gray.200');
}
</style>
