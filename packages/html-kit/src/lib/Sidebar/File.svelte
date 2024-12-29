<Button
  element="link"
  variant="ghost"
  align="start"
  full={ true }
  href="/#/asset/{ item.path }"
  data-hover={ item.path }
>
  <FileIcon
    size={ 16 }
    class="flex-shrink-0 text-stone-600 pointer-events-none"
  />

  <span class="truncate pointer-events-none">{ item.name }</span>
</Button>


<script lang="ts">
import { File as FileIcon } from 'lucide-svelte';
import Button from '$lib/Button/Button.svelte';
import type { File as Item } from '$lib/helpers/OutputTrie';

interface Props {
  item: Item;
}

let { item }: Props = $props();
</script>
