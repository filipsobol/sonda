import { ref, reactive, readonly, type WritableComputedOptions } from 'vue';

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
	#query = reactive<Query>( {} );

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
		return readonly( this.#query );
	}

	/**
	 * Navigates to a given path with optional query parameters.
	 */
	navigate( path: string, query: Query = {} ): void {
		this.#path.value = path;
		this.#updateQueryParams( query );

		window.history.replaceState( null, '', this.getUrl( path, query ) );
	}

	/**
	 * Adds a query parameter to the current path.
	 */
	updateQuery( key: string, value: QueryValue ): void {
		this.navigate( this.#path.value, {
			...this.#query,
			[ key ]: value.toString()
		} );
	}

	/**
	 * Creates options for a writable computed property that synchronizes with a query parameter.
	 * 
	 * If the parameter is not present, it returns the default value.
	 * If the query parameter is equal to the default value, it removes the query parameter from the URL.
	 */
	computedQuery<T extends string>( key: string, defaults: T ): WritableComputedOptions<T>;
	computedQuery<T extends boolean>( key: string, defaults: T ): WritableComputedOptions<T>;
	computedQuery<T extends number>( key: string, defaults: T ): WritableComputedOptions<T>;
	computedQuery<T extends unknown>( key: string, defaults: Array<T> ): WritableComputedOptions<Array<T>>;
	computedQuery( key: string, defaults: any ): WritableComputedOptions<any> {
		if ( typeof defaults === 'string' ) {
			return {
				get: () => this.#query[ key ] || defaults,
				set: value => areParamsEqual( value, defaults ) ? this.removeQuery( key ) : this.updateQuery( key, value ),
			};
		}

		if ( typeof defaults === 'boolean' ) {
			return {
				get: () => JSON.parse( this.#query[ key ] ?? defaults ),
				set: value => areParamsEqual( value, defaults ) ? this.removeQuery( key ) : this.updateQuery( key, value.toString() )
			};
		}

		if ( typeof defaults === 'number' ) {
			return {
				get: () => Number( this.#query[ key ] ) || defaults,
				set: value => areParamsEqual( value, defaults ) ? this.removeQuery( key ) : this.updateQuery( key, value )
			};
		}

		if ( Array.isArray( defaults ) ) {
			return {
				get: () => this.#query[ key ]?.split( ',' ).filter( Boolean ) || defaults,
				set: value => areParamsEqual( value, defaults ) ? this.removeQuery( key ) : this.updateQuery( key, value.join( ',' ) )
			};
		}
	
		throw new Error( `Unsupported type for query parameter: ${typeof defaults}` );
	}

	/**
	 * Removes a query parameter from the current path.
	 */
	removeQuery( key: string ): void {
		const { [ key ]: _, ...rest } = this.#query;

		this.navigate( this.#path.value, rest );
	}

	/**
	 * Generates a URL based on provided path and optional query parameters.
	 */
	getUrl( path: string, query: Query = {} ): string {
		const queryParams = Object
			.entries( query )
			.filter( pair => pair[ 1 ] !== undefined && pair[ 1 ] !== null )
			.map( pair => pair.map( encodeURIComponent ).join( '=' ) )
			.join( '&' )

		return '#/' + path + (queryParams ? '?' + queryParams : '');
	}

	/**
	 * Checks if a given path and query parameters match the current route.
	 * If the query object is not provided, only the path is checked.
	 */
	isActive( path: string, query: Query = {} ): boolean {
		// Matches if first part of the path is the same, e.g. foo/bar matches foo
		if ( this.#path.value.split( '/' ).at( 0 ) !== path.split( '/' ).at( 0 ) ) {
			return false;
		}

		return Object
			.keys( query )
			.every( key => this.#query[ key ] === query[ key ] );
	}

	/**
	 * Parses the current hash into path and query parameters.
	 */
	#parseHash() {
		const [ path = '', queryString = '' ] = window.location.hash.replace( /^#\//, '' ).split( '?' );

		this.#path.value = path;

		this.#updateQueryParams(
			Object.fromEntries(
				queryString
					.split( '&' )
					.map( pair => pair.split( '=' ).map( decodeURIComponent ) )
					.filter( pair => pair[ 0 ] )
			)
		);
	}

	/**
	 * Updates parameters that have changed and removes those that are no longer present.
	 */
	#updateQueryParams( query: Query ) {
		// Only update queries that have changed
		Object.keys( query ).forEach( key => {
			if ( !areParamsEqual( query[ key ], this.#query[ key ] ) ) {
				this.#query[ key ] = query[ key ];
			}
		} );

		// Remove queries that are no longer present
		Object.keys( this.#query ).forEach( key => {
			if ( !Object.hasOwn( query, key ) ) {
				delete this.#query[ key ];
			}
		} );
	}
}

function areParamsEqual( a: string, b: string ): boolean;
function areParamsEqual( a: boolean, b: boolean ): boolean;
function areParamsEqual( a: number, b: number ): boolean;
function areParamsEqual( a: Array<unknown>, b: Array<unknown> ): boolean;
function areParamsEqual( a: any, b: any ): boolean {
	if ( typeof a === 'string' || typeof a === 'boolean' || typeof a === 'number' ) {
		return a === b;
	}

	if ( Array.isArray( a ) ) {
		return a.length === b.length && a.every( v => b.includes( v ) );
	}

	throw new Error( `Unsupported type for query parameter: ${typeof a}` );
}

export const router = new Router();
