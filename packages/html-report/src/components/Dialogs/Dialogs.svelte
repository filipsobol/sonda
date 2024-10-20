{#if dialog.folder}
	<FolderDialog folder={ dialog.folder } />
{/if}

{#if dialog.file}
	<FileDialog file={ dialog.file } />
{/if}

{#if dialog.output}
	<OutputDialog output={ dialog.output } />
{/if}

{#if dialog.issues}
	<IssuesDialog />
{/if}

<script lang="ts">
import FolderDialog from './FolderDialog.svelte';
import FileDialog from './FileDialog.svelte';
import IssuesDialog from './IssuesDialog.svelte';
import OutputDialog from './OutputDialog.svelte';
import { dialog } from '../../stores/index.svelte.js';
</script>
