<ul class="text-stone-700">
  {#each items as item }
    <li>
      {#if isFolder(item) }
        <Folder { item } />
      {:else}
        <File { item } />
      {/if}
    </li>
  {/each}
</ul>

<script lang="ts">
import File from './File.svelte';
import Folder from './Folder.svelte';
import { isFolder, type Content } from '$lib/helpers/OutputTrie';

interface Props {
  items: Array<Content>;
}

let { items }: Props = $props();
</script>
