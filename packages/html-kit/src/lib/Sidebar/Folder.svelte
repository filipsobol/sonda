<Button
  variant="ghost"
  align="start"
  full={ true }
  onclick={ () => open = !open }
  data-hover={ item.path }
>
  <ChevronRight
    size={ 16 }
    class="flex-shrink-0 text-stone-600 { open && 'rotate-90' }"
  />

  <Folder
    size={ 16 }
    class="flex-shrink-0 ml-1 text-stone-600 pointer-events-none"
  />

  <span class="truncate pointer-events-none">{ item.name }</span>
</Button>

<div class="mt-1 ml-4 pl-3 border-l border-l-stone-200 { !open && 'hidden' }">
  <List items={ item.items } />
</div>

<script lang="ts">
import List from '$lib/Sidebar/List.svelte';
import Button from '$lib/Button/Button.svelte';
import { Folder, ChevronRight } from 'lucide-svelte';
import type { Folder as Item } from '$lib/helpers/OutputTrie';

interface Props {
  item: Item;
}

let { item }: Props = $props();

let open = $state( true );
</script>
