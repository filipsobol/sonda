<Dialog
	open={ !!focusedFile }
	title={ `Details of the <code>${ focusedFile!.name }</code> file` }
	description={ `Full path: <code>${ focusedFile!.path }</code>` }
	onClose={ () => focusedFile = null }
>
	{#snippet children()}
		<pre class="p-4">{ JSON.stringify( focusedFile, null, 2 ) }</pre>
		<pre class="p-4">{ JSON.stringify( getImporters(focusedFile!), null, 2 ) }</pre>
	{/snippet}
</Dialog>

<script lang="ts">
import Dialog from './Dialog.svelte';
import type { File } from '../FileSystemTrie';

interface Props {
	focusedFile: File | null;
}

let { focusedFile }: Props = $props();

function getImporters( content: File ) {
	return Object.entries( window.SONDA_JSON_REPORT.inputs )
		.filter( ( [, file ] ) => file.imports.includes( content.path ) )

		// TODO: Remove this to get all importers data
		.map( ( [ path ] ) => path );
}
</script>
