export interface Tab<T extends string = string> {
  value: T;
  label: string;
  active ?: boolean;
}
