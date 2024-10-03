{#if folder}
	<Dialog
		heading={ folder!.path }
		onClose={ () => folder = null }
		large={ true }
	>
		{#snippet children()}
			<div class="mb-4 grid grid-cols-[auto_1fr] gap-x-8">
				<span>Bundled size</span>
				<span class="font-bold">{ formatSize( folder!.uncompressed ) }</span>

					<span>Approx. GZIP size</span>
					<span class="font-bold">{ formatSize( folder!.gzip ) }</span>

					<span>Approx. Brotli size</span>
					<span class="font-bold">{ formatSize( folder!.brotli ) }</span>
			</div>

			<div
				bind:clientWidth={ width }
				bind:clientHeight={ height }
				class="flex-grow overflow-hidden"
			>
				<Treemap
					content={ folder! }
					width={ width }
					height={ height }
				/>
			</div>
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

let width = $state<number>( 0 );
let height = $state<number>( 0 );
</script>
