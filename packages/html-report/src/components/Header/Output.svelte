<div class="flex items-center justify-center space-x-2 max-w-sm">
	{#if outputs.length > 0}
		<select
			value={ activeOutput.index }
			{ onchange }
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10 min-w-80"
		>
			{#each outputs as output, index}
				<option value={ index }>{ index + 1 }. { output.root.name }</option>
			{/each}
		</select>
	{/if}
</div>

<script lang="ts">
import { outputs, activeOutput } from '../../stores.svelte';

function onchange( event: Event ) {
	activeOutput.setIndex( Number( ( event.target as HTMLSelectElement ).value ) );
}
</script>
