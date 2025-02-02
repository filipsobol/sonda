<button
	title="Show details of the active output"
	aria-label="Details of the entire build output"
	class="text-gray-900 bg-white border border-gray-300 focus:outline-hidden hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10"
	{ onclick }
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="text-gray-900 pointer-events-none"
	>
		<path d="M0 0h24v24H0z" stroke="none" shape-rendering="geometricPrecision"/>
		<path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.697M18 12V7a2 2 0 0 0-2-2h-2" shape-rendering="geometricPrecision"/>
		<path d="M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM8 11h4M8 15h3M14 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M18.5 19.5 21 22" shape-rendering="geometricPrecision"/>
	</svg>
</button>

<script lang="ts">
import { activeOutput, dialog } from '../../stores/index.svelte.js';

function onclick() {
	dialog.open( 'output', activeOutput.output! )
}
</script>
