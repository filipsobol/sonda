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

interface GetTreeMapParameters {
	data: Array<{ value: number }>;
	width: number;
	height: number;
}

interface TileData {
	data: { value: number };
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Tile {
	data: Array<TileData>;
	totalHeight: number;
	totalWidth: number;
	xBeginning: number;
	yBeginning: number
}

export function getTreemap( { data, width, height }: GetTreeMapParameters ): Array<TileData> {
	let initialData: GetTreeMapParameters['data'] = data;
	let tile: Tile = {
		data: [],
		xBeginning: 0,
		yBeginning: 0,
		totalWidth: width,
		totalHeight: height,
	};

	const getMinWidth = () => {
		if ( tile.totalHeight ** 2 > tile.totalWidth ** 2 ) {
			return { value: tile.totalWidth, vertical: false };
		}
		return { value: tile.totalHeight, vertical: true };
	};

	const layoutRow = ( row: Array<number>, width: number, vertical: boolean ) => {
		const rowHeight = sumArray( row ) / width;

		row.forEach( ( rowItem ) => {
			const rowWidth = rowItem / rowHeight;
			const { xBeginning } = tile;
			const { yBeginning } = tile;

			let data: TileData;
			if ( vertical ) {
				data = {
					x: xBeginning,
					y: yBeginning,
					width: rowHeight,
					height: rowWidth,
					data: initialData[ tile.data.length ],
				};
				tile.yBeginning += rowWidth;
			} else {
				data = {
					x: xBeginning,
					y: yBeginning,
					width: rowWidth,
					height: rowHeight,
					data: initialData[ tile.data.length ],
				};
				tile.xBeginning += rowWidth;
			}

			tile.data.push( data );
		} );

		if ( vertical ) {
			tile.xBeginning += rowHeight;
			tile.yBeginning -= width;
			tile.totalWidth -= rowHeight;
		} else {
			tile.xBeginning -= width;
			tile.yBeginning += rowHeight;
			tile.totalHeight -= rowHeight;
		}
	};

	const layoutLastRow = ( rows: Array<number>, children: Array<number>, width: number ) => {
		const { vertical } = getMinWidth();

		layoutRow( rows, width, vertical );
		layoutRow( children, width, vertical );
	};

	const squarify = ( children: Array<number>, row: Array<number>, width: number ) => {
		if ( children.length === 1 ) {
			return layoutLastRow( row, children, width );
		}

		const rowWithChild = [ ...row, children[ 0 ] ];

		if ( row.length === 0 || worstRatio( row, width ) >= worstRatio( rowWithChild, width ) ) {
			children.shift();
			return squarify( children, rowWithChild, width );
		}

		const { value, vertical } = getMinWidth();

		layoutRow( row, width, vertical );

		return squarify( children, [], value );
	};

	const totalValue = sumArray( data.map( point => point.value ) );
	const dataScaled = data.map( point => ( point.value * height * width ) / totalValue );

	squarify( dataScaled, [], getMinWidth().value );

	return tile.data;
};
