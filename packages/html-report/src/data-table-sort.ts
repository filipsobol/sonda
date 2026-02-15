import type { TableSort } from '@components/common/DataTable.vue';

export type SortValue = string | number | boolean | null | undefined;

export interface SortColumn<T extends object = object> {
	key?: keyof T;
	sortId?: string;
	sort?: (item: T) => SortValue;
	sortable?: boolean;
}

export function isSortableColumn<T extends object>(column: SortColumn<T>): boolean {
	if (column.sortable === false) {
		return false;
	}

	return column.key !== undefined || Boolean(column.sort);
}

export function getSortColumnId<T extends object>(column: SortColumn<T>, columnIndex: number): string {
	if (column.sortId) {
		return column.sortId;
	}

	if (column.key !== undefined) {
		return String(column.key);
	}

	return String(columnIndex);
}

export function parseTableSort<T extends object>(
	sortColumn: string,
	sortOrder: string,
	columns: Array<SortColumn<T>>
): TableSort | null {
	if (!sortColumn || !sortOrder) {
		return null;
	}

	if (sortOrder !== 'asc' && sortOrder !== 'desc') {
		return null;
	}

	if (
		columns.some((item, columnIndex) => isSortableColumn(item) && getSortColumnId(item, columnIndex) === sortColumn)
	) {
		return {
			column: sortColumn,
			direction: sortOrder
		};
	}

	const legacyColumnIndex = Number(sortColumn);

	if (
		Number.isInteger(legacyColumnIndex) &&
		legacyColumnIndex >= 0 &&
		legacyColumnIndex < columns.length &&
		isSortableColumn(columns[legacyColumnIndex]!)
	) {
		return {
			column: getSortColumnId(columns[legacyColumnIndex]!, legacyColumnIndex),
			direction: sortOrder
		};
	}

	return null;
}

export function sortTableData<T extends object>(
	data: Array<T>,
	columns: Array<SortColumn<T>>,
	sort: TableSort | null
): Array<T> {
	if (!sort) {
		return data;
	}

	const column = columns.find((item, columnIndex) => {
		return isSortableColumn(item) && getSortColumnId(item, columnIndex) === sort.column;
	});

	if (!column || !isSortableColumn(column)) {
		return data;
	}

	return data.toSorted((leftItem, rightItem) => {
		const leftValue = getSortValue(leftItem, column);
		const rightValue = getSortValue(rightItem, column);
		const order = compareSortValues(leftValue, rightValue);

		return sort.direction === 'asc' ? order : -order;
	});
}

export function formatTableSortColumn(value: TableSort | null): string {
	if (!value) {
		return '';
	}

	return value.column;
}

export function formatTableSortOrder(value: TableSort | null): string {
	if (!value) {
		return '';
	}

	return value.direction;
}

function getSortValue<T extends object>(item: T, column: SortColumn<T>): SortValue {
	if (column.sort) {
		return normalizeSortValue(column.sort(item));
	}

	if (column.key === undefined) {
		return null;
	}

	return normalizeSortValue(item[column.key]);
}

function normalizeSortValue(value: unknown): SortValue {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return value;
	}

	return String(value);
}

function compareSortValues(leftValue: SortValue, rightValue: SortValue): number {
	if (leftValue === rightValue) {
		return 0;
	}

	if (leftValue === null || leftValue === undefined) {
		return 1;
	}

	if (rightValue === null || rightValue === undefined) {
		return -1;
	}

	if (typeof leftValue === 'number' && typeof rightValue === 'number') {
		return leftValue - rightValue;
	}

	if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
		return Number(leftValue) - Number(rightValue);
	}

	return String(leftValue).localeCompare(String(rightValue), undefined, {
		numeric: true,
		sensitivity: 'base'
	});
}
