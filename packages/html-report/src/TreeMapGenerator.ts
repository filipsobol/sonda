import type { TileData } from './types';

function sumArray( data: Array<number> ): number {
	return data.reduce( ( acc, cur ) => acc + cur, 0 );
}

function worstRatio( row: Array<number>, width: number ): number {
	const sum = sumArray( row );
	const rowMax = Math.max( ...row );
	const rowMin = Math.min( ...row );

	return Math.max(
		( ( width ** 2 ) * rowMax ) / ( sum ** 2 ),
		( sum ** 2 ) / ( ( width ** 2 ) * rowMin )
	);
}

// https://www.win.tue.nl/~vanwijk/stm.pdf
export class TreeMapGenerator {
	private content: Array<number>;
	private sizes: Array<number> = [];
	private xStart: number;
	private yStart: number;
	private tiles: Array<TileData> = [];
	private widthLeft: number;
	private heightLeft: number;

	public constructor(
		content: Array<number>,
		width: number,
		height: number,
		xStart: number = 0,
		yStart: number = 0,
	) {
		const multiplier = height * width / sumArray( content );

		this.content = content;
		this.sizes = this.content.map( size => size * multiplier );
		this.xStart = xStart;
		this.yStart = yStart;
		this.widthLeft = width;
		this.heightLeft = height;
	}

	private get minSize(): number {
		return Math.min( this.widthLeft, this.heightLeft );
	}

	private layout( tiles: Array<number>, width: number, vertical: boolean ) {
		vertical
			? this.layoutRow( tiles, width )
			: this.layoutColumn( tiles, width );
	}

	private layoutRow( sizes: Array<number>, width: number ): void {
		const rowHeight = sumArray( sizes ) / width;
		let heightOffset = this.yStart;

		const row = sizes.map( size => {
			const tileHeight = size / rowHeight;
			const tileData: TileData = {
				x: this.xStart,
				y: heightOffset,
				width: rowHeight,
				height: tileHeight
			};

			heightOffset += tileHeight;

			return tileData;
		} );

		this.tiles = this.tiles.concat( row );
		this.xStart += rowHeight;
		this.widthLeft -= rowHeight;
	}

	private layoutColumn( sizes: Array<number>, width: number ): void {
		const columnHeight = sumArray( sizes ) / width;
		let widthOffset = this.xStart;

		const column = sizes.map( size => {
			const tileWidth = size / columnHeight;
			const tileData: TileData = {
				x: widthOffset,
				y: this.yStart,
				width: tileWidth,
				height: columnHeight
			};

			widthOffset += tileWidth;

			return tileData;
		} );

		this.tiles = this.tiles.concat( column );
		this.yStart += columnHeight;
		this.heightLeft -= columnHeight;
	}

	public calculate(
		sizes: Array<number> = this.sizes,
		accumulated: Array<number> = [],
		width: number = this.minSize
	): Array<TileData> {
		const vertical = this.minSize === this.heightLeft;

		if ( sizes.length === 1 ) {
			this.layout( accumulated, width, vertical );
			this.layout( sizes, width, vertical );
			
			return this.tiles;
		}

		const acc = [ ...accumulated, sizes[ 0 ] ];

		if ( accumulated.length === 0 || worstRatio( accumulated, width ) > worstRatio( acc, width ) ) {
			sizes.shift();
			return this.calculate( sizes, acc, width );
		}

		this.layout( accumulated, width, vertical );

		return this.calculate( sizes );
	}
}
