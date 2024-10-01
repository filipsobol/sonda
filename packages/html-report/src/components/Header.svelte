<div class="flex flex-row p-4 items-center space-y-0 h-16 justify-end space-x-2 bg-gray-50 shadow">
	<div class="flex items-center justify-center space-x-2 max-w-sm">
		{#if outputs.length > 0}
			<select
				bind:value={ activeOutputIndex }
				class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10 min-w-80"
			>
				{#each outputs as output, index}
					<option value={ index }>{ index + 1 }. { output.root.name }</option>
				{/each}
			</select>
		{/if}
	</div>

	<button
		aria-label="Details of the entire build output"
		class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-1 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 h-10"
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
			<path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.697M18 12V7a2 2 0 0 0-2-2h-2" shape-rendering="geometricPrecision"/>
			<path d="M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM8 11h4M8 15h3M14 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M18.5 19.5 21 22" shape-rendering="geometricPrecision"/>
		</svg>
	</button>
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
import type { FileSystemTrie } from '../FileSystemTrie';

interface Props {
	activeOutputIndex: number;
	outputs: Array<FileSystemTrie>;
}

let {
	activeOutputIndex = $bindable(),
	outputs
}: Props = $props();
</script>
