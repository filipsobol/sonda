<!-- <dialog
	bind:this={ element }
	onclick={ onClick }
  class="backdrop:bg-white backdrop:opacity-60"
>
  <button onclick={ onClose }>X</button>
	
	{#if open}
		{@render children()}
	{/if}
</dialog> -->

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
			class="absolute { dark? 'bg-black' : 'bg-white' } opacity-60 w-full h-full"
		>
		</div>

		<div class="absolute top-0 right-0 m-2">
			<button
				onclick={ onClose }
				class="flex justify-center items-center border border-transparent rounded-full w-10 h-10 { dark ? 'text-gray-100' : 'text-gray-900' } hover:bg-gray-100 hover:border-gray-300"
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

		<div
			transition:fly
			class="m-8 relative border border-gray-400 max-w-full bg-white overflow-x-auto"
		>
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
	dark?: boolean;
	onClose?: () => void;
}

let {
	children,
	open,
	dark,
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
