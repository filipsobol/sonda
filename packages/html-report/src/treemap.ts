export interface TileData {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Generates a squarified treemap layout.
 */
export function generateTreeMap(
	values: number[],
	totalWidth: number,
	totalHeight: number,
	startX: number = 0,
	startY: number = 0
): TileData[] {
	const tiles: TileData[] = [];
	const areas = new Float32Array( values.length );
	const totalValue = values.reduce( ( sum, value ) => sum + value, 0 );
	const areaScale = ( totalWidth * totalHeight ) / totalValue;

	for ( let i = 0; i < values.length; i++ ) {
		areas[ i ] = values[ i ] * areaScale;
	}

	// Initialize position and dimensions
	let x = startX;
	let y = startY;
	let width = totalWidth;
	let height = totalHeight;

	// Determine initial orientation
	let isVertical = width >= height;
	let sideLength = isVertical ? height : width;

	// Initialize variables for tracking rows
	let rowStartIndex = 0;
	let rowSum = areas[ 0 ];
	let minArea = areas[ 0 ];
	let maxArea = areas[ 0 ];

	// Calculate initial aspect ratio
	let previousRatio = calculateAspectRatio( sideLength, rowSum, minArea, maxArea );

	// Loop through the areas to build the treemap
	for ( let i = 1; i < areas.length; i++ ) {
		const area = areas[ i ];
		const newRowSum = rowSum + area;
		const newMinArea = Math.min( minArea, area );
		const newMaxArea = Math.max( maxArea, area );

		// Calculate aspect ratio if we include the new area
		const currentRatio = calculateAspectRatio( sideLength, newRowSum, newMinArea, newMaxArea );

		// Decide whether to start a new row
		if ( previousRatio < currentRatio ) {
			// Layout the current row
			layoutRow( areas, rowStartIndex, i - 1, rowSum / sideLength, isVertical, x, y, tiles );

			// Update positions and remaining dimensions
			const layoutLength = rowSum / sideLength;
			if ( isVertical ) {
				x += layoutLength;
				width -= layoutLength;
			} else {
				y += layoutLength;
				height -= layoutLength;
			}

			// Update orientation and side length
			isVertical = width >= height;
			sideLength = isVertical ? height : width;

			// Reset row variables for the next row
			rowStartIndex = i;
			rowSum = area;
			minArea = area;
			maxArea = area;
			previousRatio = calculateAspectRatio( sideLength, rowSum, minArea, maxArea );
		} else {
			// Continue adding to the current row
			rowSum = newRowSum;
			minArea = newMinArea;
			maxArea = newMaxArea;
			previousRatio = currentRatio;
		}
	}

	// Layout the last row
	layoutRow( areas, rowStartIndex, areas.length - 1, rowSum / sideLength, isVertical, x, y, tiles );

	return tiles;
}

/**
 * Calculates the worst aspect ratio for the current row.
 */
function calculateAspectRatio(
	sideLength: number,
	rowSum: number,
	minArea: number,
	maxArea: number
): number {
	const sideSquared = sideLength * sideLength;
	const sumSquared = rowSum * rowSum;
	return Math.max(
		( sideSquared * maxArea ) / sumSquared,
		sumSquared / ( sideSquared * minArea )
	);
}

/**
 * Layouts a row of tiles in the treemap.
 */
function layoutRow(
	areas: Float32Array,
	startIndex: number,
	endIndex: number,
	layoutLength: number,
	isVertical: boolean,
	x: number,
	y: number,
	tiles: TileData[]
): void {
	let position = isVertical ? y : x;

	for ( let i = startIndex; i <= endIndex; i++ ) {
		const area = areas[ i ];
		const tileLength = area / layoutLength;

		if ( isVertical ) {
			tiles.push( {
				x: x,
				y: position,
				width: layoutLength,
				height: tileLength,
			} );
		} else {
			tiles.push( {
				x: position,
				y: y,
				width: tileLength,
				height: layoutLength,
			} );
		}

		position += tileLength;
	}
}
