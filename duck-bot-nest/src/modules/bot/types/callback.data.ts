export enum CallBackDataType {
  StrictCommand = 'strict_command',
}

export class CallbackData<T> {
  type: CallBackDataType;
  data: T;
}
