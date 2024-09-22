<svelte:body
	bind:clientWidth={ bodyWidth }
	bind:clientHeight={ bodyHeight }
/>

<Dialog
	open={ !!focusedFolder }
	title={ `Details of the <code>${ focusedFolder!.name }</code> directory` }
	description={ `Full path: <code>${ focusedFolder!.path }</code>` }
	onClose={ () => focusedFolder = null }
>
	{#snippet children()}
		<Treemap
			content={ focusedFolder! }
			{ width }
			{ height }
		/>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import Treemap from './Treemap.svelte';
import type { Folder } from '../FileSystemTrie';

interface Props {
	focusedFolder: Folder | null;
}

let { focusedFolder }: Props = $props();

let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );

const width = $derived( bodyWidth * 0.9 );
const height = $derived( bodyHeight * 0.8 );
</script>
