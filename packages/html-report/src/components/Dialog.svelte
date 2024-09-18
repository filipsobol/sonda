<svelte:body
	{ onclick }
/>

{#if open}
	<div
		transition:fade={{ duration: 150 }}
		class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-5 flex justify-center items-center"
	>
		<div
			bind:this={ backdrop }
			class="absolute bg-gray-200/70 w-full h-full backdrop-blur-sm"
			aria-hidden="true"
		>
		</div>

		<div
			class="bg-white fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] flex flex-col rounded-lg border p-6 shadow-lg"
		>
			<button
				onclick={ onClose }
				aria-label="Close dialog"
				class="absolute right-4 top-4 flex justify-center items-center border border-transparent rounded-full w-8 h-8 text-gray-900"
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
			
			<div class="mb-4">
				<h2 class="block align-text-bottom text-lg font-semibold leading-none tracking-tight">{@html title }</h2>
				<p class="pt-2 block align-text-bottom text-gray-500 text-sm">{@html description }</p>
			</div>

			{@render children()}
		</div>
	</div>
{/if}

<script lang="ts">
import { fade } from 'svelte/transition';
import type { Snippet } from 'svelte';

interface Props {
	children: Snippet;
	title: string;
	description: string;
	open: boolean;
	onClose?: () => void;
}

let {
	children,
	title,
	description,
	open,
	onClose
}: Props = $props();

let backdrop = $state<HTMLElement>();

function onclick( event: MouseEvent ) {
	if ( onClose && event.target === backdrop! ) {
		onClose();
	}
}
</script>
