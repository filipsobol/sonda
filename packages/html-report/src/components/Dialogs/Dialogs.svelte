{#if dialog.folder}
	<FolderDialog folder={ dialog.folder } />
{/if}

{#if dialog.file}
	<FileDialog file={ dialog.file } />
{/if}

{#if dialog.output}
	<OutputDialog output={ dialog.output } />
{/if}

<script lang="ts">
import FolderDialog from './FolderDialog.svelte';
import FileDialog from './FileDialog.svelte';
import OutputDialog from './OutputDialog.svelte';
import { dialog } from '../../stores.svelte';
</script>
