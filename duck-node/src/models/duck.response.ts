export interface DuckResponse<T> {
  vqd: Record<string, string>;
  next: string;
  results: T[];
  query: string;
  queryEncoded: string;
}
