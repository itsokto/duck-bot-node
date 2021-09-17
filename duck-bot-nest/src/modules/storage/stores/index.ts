import { SceneSession } from 'telegraf/src/scenes/context';

export type SessionData = Pick<Record<string, unknown>, KeyColumn> & Partial<SceneSession>;
export type KeyColumn = 'key';
export const key: KeyColumn = 'key';
export const omitKeys: Array<keyof SessionData> = [key, '__scenes'];
