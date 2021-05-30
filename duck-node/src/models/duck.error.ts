export class DuckError<T> extends Error {
  constructor(message: string, public request: any, public response: T) {
    super(message);
  }
}
