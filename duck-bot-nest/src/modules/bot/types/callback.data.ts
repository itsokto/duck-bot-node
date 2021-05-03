export enum CallBackDataType {
  StrictCommand = "strict_command"
}

export class CallbackData {
  type: CallBackDataType;
  data: any;
}