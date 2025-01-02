<div class="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-2 text-gray-500">
  {#each values as [value, text]}
    <button
      class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 { value === active && 'bg-white shadow text-gray-800' }"
      onclick={() => active = value}
    >
      {text}
    </button>
  {/each}
</div>

<script lang="ts">
interface Props {
  values: Array<[ value: string, text: string ]>;
  active: string;
}

let { values, active = $bindable() }: Props = $props();
</script>
