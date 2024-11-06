<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{ ...props }
>
	<path d="M0 0h24v24H0z" stroke="none"/>
	<path d="M18 6 6 18M6 6l12 12"/>
</svg>

<script lang="ts">
import type { SVGAttributes } from 'svelte/elements'

let props: SVGAttributes<SVGSVGElement> = $props();
</script>
