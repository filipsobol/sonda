import { ref, readonly, type WritableComputedOptions } from 'vue';

type QueryValue = string | number | Array<unknown>;
type Query = Record<string, string>;

class Router {
	/**
	 * The current path.
	 */
	#path = ref<string>( '' );

	/**
	 * The current query parameters.
	 */
	#query = ref<Query>( {} );

	constructor() {
		window.addEventListener( 'hashchange', () => this.#parseHash() );

		this.#parseHash();
	}

	/**
	 * The read-only path.
	 */
	get path(): Readonly<string> {
		return readonly( this.#path ).value;
	}

	/**
	 * The read-only query parameters.
	 */
	get query(): Readonly<Query> {
		return readonly( this.#query ).value;
	}

	/**
	 * Navigates to a given path with optional query parameters.
	 */
	navigate( path: string, query: Query = {} ): void {
		this.#path.value = path;
		this.#query.value = query;

		window.history.replaceState( null, '', this.getUrl( path, query ) );
	}

	/**
	 * Adds a query parameter to the current path.
	 */
	updateQuery( key: string, value: QueryValue ): void {
		this.navigate( this.#path.value, {
			...this.#query.value,
			[ key ]: value.toString()
		} );
	}

	/**
	 * Creates options for a writable computed property that synchronizes with a query parameter.
	 * 
	 * If the parameter is not present, it returns the default value.
	 * If the query parameter is equal to the default value, it removes the query parameter from the URL.
	 */
	computedQuery( key: string, defaults: string ): WritableComputedOptions<string>;
	computedQuery( key: string, defaults: number ): WritableComputedOptions<number>;
	computedQuery<T extends unknown>( key: string, defaults: Array<T> ): WritableComputedOptions<Array<T>>;
	computedQuery( key: string, defaults: any ): WritableComputedOptions<any> {
		if ( typeof defaults === 'string' ) {
			return {
				get: () => this.#query.value[ key ] || defaults,
				set: ( value: string ) => value === defaults ? this.removeQuery( key ) : this.updateQuery( key, value ),
			};
		}

		if ( typeof defaults === 'number' ) {
			return {
				get: () => Number( this.#query.value[ key ] ) || defaults,
				set: ( value: number ) => value === defaults ? this.removeQuery( key ) : this.updateQuery( key, value )
			};
		}

		if ( Array.isArray( defaults ) ) {
			return {
				get: () => this.#query.value[ key ]?.split( ',' ).filter( Boolean ) || defaults,
				set: ( value: Array<any> ) => value.length === defaults.length && value.every( v => defaults.includes( v ) )
					? this.removeQuery( key )
					: this.updateQuery( key, value.join( ',' ) )
				}
		}
	
		throw new Error( `Unsupported type for query parameter: ${typeof defaults}` );
	}

	/**
	 * Removes a query parameter from the current path.
	 */
	removeQuery( key: string ): void {
		const { [ key ]: _, ...rest } = this.#query.value;

		this.navigate( this.#path.value, rest );
	}

	/**
	 * Generates a URL based on provided path and optional query parameters.
	 */
	getUrl( path: string, query: Query = {} ): string {
		const queryParams = Object
			.entries( query )
			.map( pair => pair.map( encodeURIComponent ).join( '=' ) )
			.join( '&' )

		return '#/' + path + (queryParams ? '?' + queryParams : '');
	}

	/**
	 * Checks if a given path and query parameters match the current route.
	 * If the query object is not provided, only the path is checked.
	 */
	isActive( path: string, query: Query = {} ): boolean {
		if ( this.#path.value !== path ) {
			return false;
		}

		return Object
			.keys( query )
			.every( key => this.#query.value[ key ] === query[ key ] );
	}

	/**
	 * Parses the current hash into path and query parameters.
	 */
	#parseHash() {
		const [ path = '', queryString = '' ] = window.location.hash.replace( /^#\//, '' ).split( '?' );

		this.#path.value = path;

		this.#query.value = Object.fromEntries(
			queryString
				.split( '&' )
				.map( pair => pair.split( '=' ).map( decodeURIComponent ) )
				.filter( pair => pair[ 0 ] )
		);
	}
}

export const router = new Router();
