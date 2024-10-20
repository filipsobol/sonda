<div class="flex items-center justify-center space-x-2 max-w-sm">
	{#if outputs.length > 0}
		<select
			value={ activeOutput.index }
			{ onchange }
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm pl-4 pr-8 h-10 min-w-80"
			title="Select the active output"
		>
			{#each outputs as output, index}
				<option value={ index }>{ index + 1 }. { output.root.name }</option>
			{/each}
		</select>
	{/if}
</div>

<script lang="ts">
import { outputs, activeOutput } from '../../stores/index.svelte.js';

function onchange( event: Event ) {
	activeOutput.setIndex( Number( ( event.target as HTMLSelectElement ).value ) );
}
</script>

<style>
select {
	appearance: none;
	background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m8 9 4-4 4 4M16 15l-4 4-4-4"/></svg>');
	background-position: right 0.5rem center;
  background-repeat: no-repeat;
}
</style>
