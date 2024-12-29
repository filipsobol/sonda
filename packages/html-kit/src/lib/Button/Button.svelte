<svelte:element
  this={ element === 'link' ? 'a' : 'button' }
  class='h-10 p-2 flex gap-2 items-center { aligns[ align ] } rounded-md overflow-hidden { variants[variant] } { full && 'w-full' }'
  { ...props }
>
  {@render children()}
</svelte:element>

<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'

type Variant = 'primary' | 'secondary' | 'white' | 'destructive' | 'outline' | 'ghost' | 'link';
type Align = 'start' | 'center' | 'end';

interface BaseProps {
  children: Snippet;
  variant?: Variant;
  align?: Align;
  full?: boolean;
}

type ButtonProps = BaseProps & { element?: 'button' } & HTMLButtonAttributes;
type LinkProps = BaseProps & { element?: 'link' } & HTMLAnchorAttributes;

let {
  children,
  element = 'button',
  variant = 'primary',
  align = 'center',
  full = false,
  ...props
}: LinkProps | ButtonProps = $props()

const variants: Record<Variant, string> = {
  primary: 'bg-stone-800 text-stone-100 hover:bg-stone-800/85',
  secondary: 'bg-stone-300 text-stone-800 hover:bg-stone-300/85',
  white: 'bg-white text-stone-800 border hover:border-stone-300',
  destructive: 'bg-red-600 text-red-100 hover:bg-red-600/85',
  outline: 'border hover:bg-stone-200 hover:text-stone-800 hover:border-stone-300',
  ghost: 'hover:bg-stone-200 hover:text-stone-800',
  link: 'texttext-stone-800 underline-offset-4 hover:underline'
};

const aligns: Record<Align, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
};
</script>
