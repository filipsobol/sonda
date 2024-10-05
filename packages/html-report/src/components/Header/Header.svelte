<div class="flex flex-row p-4 items-center space-y-0 h-16 justify-end space-x-2 bg-gray-50 shadow">
	<Compression />
	<Output />
	<Details />
	
	<a
		href="https://github.com/filipsobol/sonda"
		target="_blank"
		aria-label="GitHub repository"
		class="flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10"
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
			class="text-gray-900"
		>
			<path d="M0 0h24v24H0z" stroke="none" shape-rendering="geometricPrecision"/>
			<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" shape-rendering="geometricPrecision"/>
		</svg>
	</a>
</div>

<script lang="ts">
import Compression from './Compression.svelte';
import Output from './Output.svelte';
import Details from './Details.svelte';
</script>
