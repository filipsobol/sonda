export class AsciiTree {
	private depth: number = 0;
	private tree: Array<string> = [];

	/**
	 * Processes the given asset and its importers and adds them to the tree.
	 */
	private process( asset: string ): void {
		const importers = this.getImporters( asset );

		if ( !importers.length ) {
			return;
		}

		// Narrow down the tree only if there is a single importer.
		if ( importers.length === 1 ) {
			this.addLast( `imported by ${ importers[ 0 ] }` );
			
			return this.process( importers[ 0 ] );
		}

		const last = importers.pop()!;

		importers.forEach( importer => this.add( `imported by ${ importer }` ) );

		this.addLast( `imported by ${ last }` );
	}

	/**
	 * Returns an array of all the files that import the given asset.
	 */
	private getImporters( asset: string ): Array<string> {
		if ( !asset ) {
			return [];
		}

		return Object.entries( window.SONDA_JSON_REPORT.inputs )
			.filter( ( [ , file ] ) => file.imports.includes( asset! ) )
			.map( ( [ path ] ) => path );
	}

	/**
	 * Adds a new line to the tree with the last element	.
	 */
	private addLast( text: string ): void {
		this.tree.push( ' '.repeat( this.depth * 4 ) + '└── ' + text );
		this.depth++;
	}

	/**
	 * Adds a new line to the tree.
	 */
	private add( text: string ): void {
		this.tree.push( ' '.repeat( this.depth * 4 ) + '├── ' + text );
	}

	/**
	 * Renders the entire dependency tree.
	 */
	public render( asset: string ): string {
		const input = window.SONDA_JSON_REPORT.inputs[ asset ];

		if ( input.belongsTo ) {
			this.tree.push( `└── part of the ${ input.belongsTo } bundle` );
			this.depth++;

			asset = input.belongsTo;
		}

		this.process( asset! );

		return this.tree.join( '\n' );
	}
}
