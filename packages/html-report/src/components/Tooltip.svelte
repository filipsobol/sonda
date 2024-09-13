<svelte:body
	bind:clientWidth={ bodyWidth }
	bind:clientHeight={ bodyHeight }
	onmousemove={ onMouseMove }
	onmouseleave={ onMouseLeave }
	onclick={ onMouseLeave }
/>

<div
	bind:clientWidth={ width }
	bind:clientHeight={ height }
	style:visibility={ visibility }
	style:transform={ transform }
	class="invisible absolute z-10 px-2 py-1 bg-gray-800 text-gray-100 rounded-md whitespace-nowrap pointer-events-none"
	role="tooltip"
>
	{ content }
</div>

<script lang="ts">
interface MousePosition {
	x: number;
	y: number;
}

const margin = 12;

let width = $state<number>( 0 );
let height = $state<number>( 0 );
let bodyWidth = $state<number>( 0 );
let bodyHeight = $state<number>( 0 );
let mousePosition = $state<MousePosition>( { x: 0, y: 0 } );
let hoveredElement = $state<Element | null>( null );

const visibility = $derived( hoveredElement ? 'visible' : 'hidden' );
const content = $derived( hoveredElement?.getAttribute( 'data-hover' ) );

let transform = $derived.by( () => {
	if ( !hoveredElement ) {
		return 'translate(-9999px, -9999px)';
	}

	// Prevent tooltip from going off screen
	const { x, y } = mousePosition;
	const overflows = ( x + width + ( margin * 3) > bodyWidth ) || ( y + height + ( margin * 3 ) > bodyHeight );
	const left = x + margin + 'px';
	const top = y + margin + 'px';
	const marg = `${ overflows ? -margin : 0 }px`;
	const offset = `${ overflows ? 100 : 0 }%`;

	return `translate( calc( ${left} + ${marg} - ${offset} ), calc( ${top} + ${marg} - ${offset} ) )`;
} );

function onMouseMove( { target, clientX, clientY }: MouseEvent ) {
	const element = target instanceof Element
		&& target.hasAttribute( 'data-hover' )
		&& target;

	if ( !element ) {
		return onMouseLeave();
	}

	hoveredElement = element;
	mousePosition = { x: clientX, y: clientY };
}

function onMouseLeave() {
	hoveredElement = null;
}
</script>
