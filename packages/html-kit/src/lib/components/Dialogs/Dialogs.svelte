<!-- {#if dialog.folder}
	<FolderDialog folder={ dialog.folder } />
{/if}

{#if dialog.file}
	<FileDialog file={ dialog.file } />
{/if}

{#if dialog.output}
	<OutputDialog output={ dialog.output } />
{/if}

{#if dialog.duplicates}
	<DuplicatesDialog />
{/if}

{#if dialog.code}
	<CodeDialog file={ dialog.code } />
{/if} -->

<script lang="ts">
import CodeDialog from './CodeDialog.svelte';
import DuplicatesDialog from './DuplicatesDialog.svelte';
import FileDialog from './FileDialog.svelte';
import FolderDialog from './FolderDialog.svelte';
import OutputDialog from './OutputDialog.svelte';
// import { dialog } from '../../store.svelte.js';
</script>
