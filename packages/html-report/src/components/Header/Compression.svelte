{#if compressions.length > 1}
	<div class="inline-flex" role="group">
		{#each compressions as type, index ( type )}
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 focus:ring-1 focus:ring-blue-300 focus:z-10"
				class:ml-[-1px]={ index > 0 }
				class:rounded-s-lg={ index === 0 }
				class:rounded-e-lg={ index === compressions.length - 1 }
				class:hover:bg-gray-100={ type.toLowerCase() !== compression.type }
				class:bg-gray-200={ type.toLowerCase() === compression.type }
				onclick={ () => onclick( type ) }
			>
				{ type }
			</button>	
		{/each}
	</div>
{/if}

<script lang="ts">
import { compression, activeOutput, type CompressionType } from '../../stores.svelte';

const hasGzip = $derived( activeOutput.output!.root.gzip > 0 );
const hasBrotli = $derived( activeOutput.output!.root.brotli > 0 );

const compressions = $derived.by( () => {
	const compressions = [ 'Uncompressed' ];

	hasGzip && compressions.push( 'GZIP' );
	hasBrotli && compressions.push( 'Brotli' );

	return compressions;
} );

function onclick( type: string ) {
	compression.setType( type.toLocaleLowerCase() as CompressionType );
}
</script>
