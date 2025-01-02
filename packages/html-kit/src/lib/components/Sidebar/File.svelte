<Button
  element="link"
  variant="ghost"
  align="start"
  full={ true }
  href="#/assets/{ item.path }"
  data-hover={ item.path }
>
  <span class="truncate pointer-events-none">{ item.name }</span>
</Button>

<script lang="ts">
import Button from '$lib/components/Button/Button.svelte';
import type { File as Item } from '$lib/helpers/OutputTrie';

interface Props {
  item: Item;
}

let { item }: Props = $props();
</script>
