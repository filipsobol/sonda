interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function generateTreemapSVG(
	rectangles: Array<Rectangle>,
	width: number,
	height: number
): string {
	let svgContent =
		`<svg
			xmlns="http://www.w3.org/2000/svg"
			width="${ width }"
			height="${ height }"
		>`;

	rectangles.forEach( ( { x, y, width, height } ) => {
		svgContent +=
			`<rect
				x="${ x.toFixed(2) }"
				y="${ y.toFixed( 2 ) }"
				width="${ width.toFixed( 2 ) }"
				height="${ height.toFixed( 2 ) }"
				fill="hsl(${ Math.random() * 360 }, 100%, 75%)"
				stroke="#fff"
				stroke-width="2"
				rx="5"
				ry="5"
			/>`;
	} );

	svgContent += `</svg>`;

	return svgContent;
}
