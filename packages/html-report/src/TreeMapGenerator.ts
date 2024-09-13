export interface TileData {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class TreeMapGenerator {
	private sizes: Float32Array;
	private tiles: Array<TileData>;
	private xStart: number;
	private yStart: number;
	private widthLeft: number;
	private heightLeft: number;

	public constructor (
		content: Array<number>,
		width: number,
		height: number,
		xStart: number = 0,
		yStart: number = 0
	) {
		const total = content.reduce( ( acc, cur ) => acc + cur, 0 );
		const multiplier = ( height * width ) / total;

		this.sizes = new Float32Array( content.length );

		for ( let i = 0; i < content.length; i++ ) {
			this.sizes[ i ] = content[ i ] * multiplier;
		}

		this.tiles = new Array();
		this.xStart = xStart;
		this.yStart = yStart;
		this.widthLeft = width;
		this.heightLeft = height;
	}

	private layout(
		startIndex: number,
		endIndex: number,
		layoutLength: number,
		vertical: boolean,
		tileIndex: number
	): number {
		let offset = vertical ? this.yStart : this.xStart;
		let dimension: number;

		const sizes = this.sizes;
		const tiles = this.tiles;

		for ( let i = startIndex; i <= endIndex; i++ ) {
			dimension = sizes[ i ] / layoutLength;

			if ( vertical ) {
				tiles.push( {
					x: this.xStart,
					y: offset,
					width: layoutLength,
					height: dimension 
				} );
			} else {
				tiles.push( {
					x: offset,
					y: this.yStart,
					width: dimension,
					height: layoutLength
				} );
			}

			offset += dimension;
			tileIndex++;
		}

		// Update offsets after layout
		if ( vertical ) {
			this.xStart += layoutLength;
			this.widthLeft -= layoutLength;
		} else {
			this.yStart += layoutLength;
			this.heightLeft -= layoutLength;
		}

		return tileIndex;
	}

	public calculate(): Array<TileData> {
		let vertical = this.heightLeft < this.widthLeft;
		let width = vertical ? this.heightLeft : this.widthLeft;
		let widthSquared = width * width;
		let rowStart = 0;
		let rowEnd = 0;
		let rowSum = this.sizes[ 0 ];
		let rowMin = this.sizes[ 0 ];
		let rowMax = this.sizes[ 0 ];
		let tileIndex = 0;
		let sumSquared = rowSum * rowSum;
		let prevRatio = Math.max(
			( widthSquared * rowMax ) / sumSquared,
			sumSquared / ( widthSquared * rowMin )
		);

		for ( let i = 1; i < this.sizes.length; i++ ) {
			const size = this.sizes[ i ];
			const newSum = rowSum + size;
			const newMin = rowMin < size ? rowMin : size;
			const newMax = rowMax > size ? rowMax : size;
			const newSumSquared = newSum * newSum;
			const nextRatio = Math.max(
				( widthSquared * newMax ) / newSumSquared,
				newSumSquared / ( widthSquared * newMin )
			);
			const shouldLayout = prevRatio <= nextRatio ? 1 : 0;

			if ( shouldLayout ) {
				// Layout current row
				tileIndex = this.layout(
					rowStart,
					rowEnd,
					rowSum / width,
					vertical,
					tileIndex
				);

				// Update positions
				vertical = this.heightLeft < this.widthLeft;
				width = vertical ? this.heightLeft : this.widthLeft;
				widthSquared = width * width;

				// Reset row variables
				rowStart = i;
				rowEnd = i;
				rowSum = size;
				rowMin = size;
				rowMax = size;
				sumSquared = size * size;
				prevRatio = Math.max(
					( widthSquared * rowMax ) / sumSquared,
					sumSquared / ( widthSquared * rowMin )
				);
			} else {
				// Expand current row
				rowEnd = i;
				rowSum = newSum;
				rowMin = newMin;
				rowMax = newMax;
				sumSquared = newSumSquared;
				prevRatio = nextRatio;
			}
		}

		// Layout the final row
		tileIndex = this.layout(
			rowStart,
			rowEnd,
			rowSum / width,
			vertical,
			tileIndex
		);

		return this.tiles;
	}
}
