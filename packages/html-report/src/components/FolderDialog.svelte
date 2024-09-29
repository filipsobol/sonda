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
			<div class="mb-4 flex flex-col overflow-y-auto">
				<p>Bundled size: <b>{ formatSize( folder!.bytes ) }</b></p>
				<p>GZIP size: <b>{ formatSize( folder!.gzip ) }</b></p>
				<p>Brotli size: <b>{ formatSize( folder!.brotli ) }</b></p>
			</div>

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
import { formatSize } from '../format';
import type { Folder } from '../FileSystemTrie';

interface Props {
	folder: Folder | null;
}

let { folder }: Props = $props();

let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );
</script>
