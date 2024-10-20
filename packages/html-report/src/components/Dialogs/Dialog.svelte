<svelte:body { onclick } />

<div
	transition:fade={{ duration: 150 }}
	class="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center"
>
	<div
		bind:this={ backdrop }
		class="fixed bg-gray-200/70 w-full h-full backdrop-blur-sm"
		aria-hidden="true"
	>
	</div>

	<div
		class="bg-white relative flex flex-col rounded-lg border p-6 shadow-lg overflow-hidden max-h-[95vh] max-w-[95vw]"
		class:w-[95vw]={ large }
		class:h-[95vh]={ large }
	>
		<div class="mb-4">
			<h2 class="py-2 pr-6 block align-text-bottom font-semibold leading-none tracking-tight text-base border-b-2 border-gray-300 border-dashed">{ heading }</h2>
			<button
				onclick={ () => dialog.close() }
				aria-label="Close dialog"
				class="absolute top-0 right-0 mt-2 mr-2 flex justify-center items-center border border-transparent rounded-full w-10 h-10 text-gray-600 hover:text-gray-900"
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
				>
					<path d="M0 0h24v24H0z" stroke="none"/>
					<path d="M18 6 6 18M6 6l12 12"/>
				</svg>
			</button>
		</div>

		{@render children()}
	</div>
</div>

<script lang="ts">
import { fade } from 'svelte/transition';
import { dialog } from '../../stores/index.svelte.js';
import type { Snippet } from 'svelte';

interface Props {
	children: Snippet;
	heading: string;
	large?: boolean;
}

let {
	children,
	heading,
	large,
}: Props = $props();

let backdrop = $state<HTMLElement>();

function onclick( event: MouseEvent ) {
	if ( event.target === backdrop! ) {
		dialog.close();
	}
}
</script>
