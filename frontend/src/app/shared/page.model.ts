export interface Page<T> {
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  content: Array<T>;
}
