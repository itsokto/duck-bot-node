export interface DuckResponse<T> {
  vqd: { [query: string]: string };
  next: string;
  results: T[];
  query: string;
  queryEncoded: string;
}
