<Dialog
	heading={ folder.path }
	large={ true }
>
	{#snippet children()}
		<div class="mb-4 grid grid-cols-[auto_1fr] gap-x-8">
			<span>Bundled size</span>
			<span class="font-bold">{ formatSize( folder.uncompressed ) }</span>

			{#if folder.gzip}
				<span>Approx. GZIP size</span>
				<span class="font-bold">{ formatSize( folder.gzip ) }</span>
			{/if}

			{#if folder.brotli}
				<span>Approx. Brotli size</span>
				<span class="font-bold">{ formatSize( folder.brotli ) }</span>
			{/if}
		</div>

		<div
			bind:clientWidth={ width }
			bind:clientHeight={ height }
			class="grow overflow-hidden"
		>
			<Treemap
				content={ folder }
				width={ width }
				height={ height }
			/>
		</div>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import Treemap from '../Treemap/Treemap.svelte';
import { formatSize } from '../../format';
import type { Folder } from '../../FileSystemTrie';

interface Props {
	folder: Folder;
}

let { folder }: Props = $props();

let width = $state<number>( 0 );
let height = $state<number>( 0 );
</script>
