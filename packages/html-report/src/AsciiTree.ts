export type Item = string | [ id: string, name: string ];
export type Items = Item[];
export type NullishItems = Items | null | undefined;
export type GetChildren = ( ( id: string, items: Items ) => NullishItems ) | null;

export class AsciiTree {
	public static generate(
		items: Items,
		getChildren?: GetChildren,
	): string {
		return AsciiTree.processItems( items, getChildren ).join( '\n' );
	}

	private static processItems(
		items: Items,
		getChildren: GetChildren = null,
		prefix: string = '',
	): string[] {
		const lines: string[] = [];
		const lastIndex = items.length - 1;

		items.forEach( ( item, index ) => {
			const isLast = index === lastIndex;
			const connector = isLast ? '└── ' : '├── ';
			const [ id, name ] = typeof item === 'string' ? [ item, item ] : item;
			const children = getChildren?.( id, items );

			lines.push( prefix + connector + name );

			if ( children ) {
				const newPrefix = prefix + ( isLast ? '    ' : '│   ' );
				lines.push( ...this.processItems( children, getChildren, newPrefix ) );
			}
		} );

		return lines;
	}
}
