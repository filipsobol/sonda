<svelte:body { onclick } />

<div
	transition:fade={{ duration: 150 }}
	class="fixed top-0 right-0 left-0 bottom-0 flex justify-center items-center"
>
	<div
		bind:this={ backdrop }
		class="fixed bg-gray-200/70 w-full h-full backdrop-blur-xs"
		aria-hidden="true"
	>
	</div>

	<div
		class="bg-white relative flex flex-col rounded-lg border border-gray-200 p-6 shadow-lg overflow-hidden max-h-[95vh] max-w-[95vw]"
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
				<CloseIcon />
			</button>
		</div>

		{@render children()}
	</div>
</div>

<script lang="ts">
import CloseIcon from '../Icons/Close.svelte';
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
