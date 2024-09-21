<svelte:body
	bind:clientWidth={ bodyWidth }
	bind:clientHeight={ bodyHeight }
	onmouseover={ onMouseMove }
	onmousemove={ onMouseMove }
	onmouseleave={ () => hoveredElement = null }
/>

<div
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	class="fixed z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none font-mono will-change-transform"
	style="transform: translate( calc( var(--x) - var(--x-offset) ), calc( var(--y) - var(--y-offset) ) )"
	role="tooltip"
	style:--x={ x }
	style:--x-offset={ xOffset }
	style:--y={ y }
	style:--y-offset={ yOffset }
>
	{ content }
</div>

<script lang="ts">
const margin = 12;

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );
let mouseX = $state<number>( 0 );
let mouseY = $state<number>( 0 );
let hoveredElement = $state<Element | null>( null );

const content = $derived( hoveredElement?.getAttribute( 'data-hover' ) );
const x = $derived( hoveredElement ? `${ mouseX }px` : '-9999px' );
const y = $derived( hoveredElement ? `${ mouseY }px` : '-9999px' );
const xOffset = $derived( mouseX + width > bodyWidth - margin ? `${ margin }px - 100%` : `-${ margin }px` );
const yOffset = $derived( mouseY + height > bodyHeight - margin ? '0px - 100%' : `-${ margin }px` );

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	hoveredElement = target instanceof Element
		&& target.hasAttribute( 'data-hover' )
		&& target
		|| null;

	if ( !hoveredElement ) return;

	mouseX = clientX;
	mouseY = clientY;
}
</script>
