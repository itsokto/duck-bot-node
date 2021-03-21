export interface DuckResponse<T> {
    vqd: string;
    next: string;
    results: T[];
    query: string;
}