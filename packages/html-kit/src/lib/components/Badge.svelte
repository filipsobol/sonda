<span class={ [
  'text-sm font-medium me-2 px-2 py-1 rounded-sm',
  variants[variant]
] }>
  {@render children()}
</span>

<script lang="ts">
import type { Snippet } from 'svelte';

type Variant = 'default' | 'dark' | 'red' | 'green' | 'yellow' | 'indigo' | 'purple' | 'pink';

interface Props {
  children: Snippet;
  variant: Variant;
}

let {
  children,
  variant = 'default'
}: Props = $props();

const variants: Record<Variant, string> = {
  default: 'bg-blue-100 text-blue-800',
  dark: 'bg-gray-100 text-gray-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800'
};
</script>
