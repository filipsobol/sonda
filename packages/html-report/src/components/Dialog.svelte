<svelte:body
	onclick={ onClick }
	onkeydown={ onKeyDown }
/>

{#if open}
	<div
		transition:fade={{ duration: 150 }}
		class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-5 flex justify-center items-center"
	>
		<div
			bind:this={ backdrop }
			class="absolute bg-gray-200/60 w-full h-full backdrop-blur-sm"
			aria-hidden="true"
		>
		</div>

		<div
			class="bg-white fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] flex flex-col rounded-lg border p-6 shadow-lg"
		>
			<button
				onclick={ onClose }
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
				<h2 class="text-lg font-semibold leading-none tracking-tight">123</h2>
				<p class="text-gray-500 text-sm">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Distinctio, soluta.</p>
			</div>

			{@render children()}
		</div>
	</div>
{/if}

<script lang="ts">
import { fade, fly } from 'svelte/transition';
import type { Snippet } from 'svelte';

interface Props {
	children: Snippet;
	open: boolean;
	onClose?: () => void;
}

let {
	children,
	open,
	onClose
}: Props = $props();

let backdrop = $state<HTMLElement>();

function onClick( event: MouseEvent ) {
	if ( onClose && event.target === backdrop! ) {
		onClose();
	}
}

function onKeyDown( event: KeyboardEvent ) {
	if ( onClose && event.key === 'Escape' ) {
		onClose();
	}
}
</script>
