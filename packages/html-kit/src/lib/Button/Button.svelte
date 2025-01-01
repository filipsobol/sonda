<svelte:element
  { ...props }
  this={ element === 'link' ? 'a' : 'button' }
  class={ [
    'h-10 p-2 flex gap-2 items-center rounded-md',
    aligns[ align ],
    variants[variant],
    full && 'w-full',
    props.class
  ] }
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
  primary: 'bg-gray-800 text-gray-100 hover:bg-gray-800/85',
  secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-300/85',
  white: 'bg-white text-gray-800 border hover:border-gray-300',
  destructive: 'bg-red-600 text-red-100 hover:bg-red-600/85',
  outline: 'border hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300',
  ghost: 'hover:bg-gray-200 hover:text-gray-800',
  link: 'texttext-gray-800 underline-offset-4 hover:underline'
};

const aligns: Record<Align, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
};
</script>
