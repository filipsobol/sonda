<svg
	width={ width }
	height={ height }
	xmlns="http://www.w3.org/2000/svg"
	role="img"
>
	<Level
		content={ content }
		totalBytes={ content.bytes }
		width={ width }
		height={ height }
		xStart={ 0 }
		yStart={ 0 }
	/>
</svg>

<script lang="ts">
import Level from './Level.svelte';
import type { Content } from '../parser';

interface Props {
	width: number;
	height: number;
	content: Content;
}

let {
	width,
	height,
	content
}: Props = $props();
</script>
