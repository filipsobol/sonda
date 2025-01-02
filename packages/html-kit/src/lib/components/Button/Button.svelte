<svelte:element
  { ...props }
  this={ element === 'link' ? 'a' : 'button' }
  class={ [
    'py-3 px-4 flex gap-2 items-center rounded-md',
    aligns[ align ],
    variants[variant],
    full && 'w-full',
    props.class
  ] }
  data-active={ active }
>
  {@render children()}
</svelte:element>

<script lang="ts">
import { page } from '$app/state';
import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

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
  primary: 'bg-gray-800 text-gray-100 hover:bg-gray-900 data-[active=true]:bg-gray-800',
  secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400 data-[active=true]:bg-gray-300',
  white: 'bg-white text-gray-800 border hover:border-gray-300 hover:bg-gray-200',
  destructive: 'bg-red-600 text-red-100 hover:bg-red-700 data-[active=true]:bg-red-600',
  outline: 'border hover:bg-gray-300 hover:text-gray-800 hover:border-gray-300 data-[active=true]:bg-gray-200',
  ghost: 'hover:bg-gray-300 hover:text-gray-800 data-[active=true]:bg-gray-200',
  link: 'text-gray-800 underline-offset-4 hover:underline data-[active=true]:underline'
};

const aligns: Record<Align, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end'
};

const active = $derived( element === 'link' && page.url.pathname === ( props as LinkProps ).href );
</script>
