<div class="flex items-center justify-center space-x-2 max-w-sm">
	{#if store.trie.length > 0}
		<select
			value={ store.outputIndex }
			{ onchange }
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm pl-4 pr-8 h-10 min-w-80"
			title="Select the active output"
		>
			{#each store.trie as output, index}
				<option value={ index }>{ index + 1 }. { output.root.name }</option>
			{/each}
		</select>
	{/if}
</div>

<script lang="ts">
import { store } from '$lib/store.svelte.js';

function onchange( event: Event ) {
	store.outputIndex = Number( ( event.target as HTMLSelectElement ).value );
}
</script>

<style>
select {
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5M7 9l5-5 5 5'/%3E%3C/svg%3E");
	background-position: right 0.5rem center;
  background-repeat: no-repeat;
}
</style>
