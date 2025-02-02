<Button
  variant="ghost"
  align="start"
  full={ true }
  onclick={ () => open = !open }
  data-hover={ item.path }
>
  <ChevronRight
    size={ 16 }
    class="flex-shrink-0 text-gray-600 { open && 'rotate-90' }"
  />

  <span class="truncate pointer-events-none">{ item.name }</span>
</Button>

<div class="mt-1 ml-6 pl-1 border-l border-l-gray-200 { !open && 'hidden' }">
  <List items={ item.items } />
</div>

<script lang="ts">
import List from '$lib/components/Sidebar/List.svelte';
import Button from '$lib/components/Button/Button.svelte';
import { ChevronRight } from 'lucide-svelte';
import type { Folder as Item } from '$lib/helpers/OutputTrie';

interface Props {
  item: Item;
}

let { item }: Props = $props();

let open = $state( true );
</script>
