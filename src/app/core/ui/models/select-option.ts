export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
}
