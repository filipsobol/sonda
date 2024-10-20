{#if duplicates.size > 1}
	<button
		aria-label="Details of the entire build output"
		class="text-gray-900 bg-white border border-red-300 focus:outline-none hover:bg-red-50 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10"
		{ onclick }
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-red-600"
		>
			<path stroke="none" d="M0 0h24v24H0z" shape-rendering="geometricPrecision"/>
			<path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 8v4M12 16h.01" shape-rendering="geometricPrecision"/>
		</svg>
	</button>
{/if}

<script lang="ts">
import { duplicates } from '../../stores/dependencies.js';
import { dialog } from '../../stores/index.svelte.js';

function onclick() {
	dialog.open( 'issues', true );
}
</script>
