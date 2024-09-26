<svelte:body
	bind:clientWidth={ bodyWidth }
	bind:clientHeight={ bodyHeight }
/>

{#if folder}
	<Dialog
		heading={ folder!.path }
		onClose={ () => folder = null }
	>
		{#snippet children()}
			<Treemap
				content={ folder! }
				width={ bodyWidth * 0.9 }
				height={ bodyHeight * 0.8 }
			/>
		{/snippet}
	</Dialog>
{/if}

<script lang="ts">
import Dialog from './Dialog.svelte';
import Treemap from './Treemap.svelte';
import type { Folder } from '../FileSystemTrie';

interface Props {
	folder: Folder | null;
}

let { folder }: Props = $props();

let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );
</script>
