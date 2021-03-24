import { FilterQuery, UpdateQuery } from "mongoose";
import { Context, MiddlewareFn } from "telegraf";
import * as mongoose from "mongoose";

export interface Session {
  key: string;
}

export interface SessionContext<T extends Session, TDoc extends mongoose.Document<T>> extends Context {
  session: T;
}

export const getSessionKey = ({ from, chat }: Context): string => {
  if (from == null) {
    throw new Error("From is null");
  }

  const firstKey = from.id;
  const secondKey = chat ? chat.id : firstKey;

  return `${firstKey}:${secondKey}`;
};

export function session<T extends Session, TDoc extends mongoose.Document<T>>(
  model: mongoose.Model<TDoc>,
): MiddlewareFn<SessionContext<T, TDoc>> {
  const saveSession = async (key: string, data: T) => {
    const update = await model.findOneAndUpdate(
      ({ key } as unknown) as FilterQuery<TDoc>,
      (data as unknown) as UpdateQuery<TDoc>,
      { upsert: true },
    );
  };

  const getSession = async (key: string) => {
    const session = await model.findOne(({
      key,
    } as unknown) as FilterQuery<TDoc>);
    return session?.toJSON({ virtuals: false });
  };

  return async (ctx, next) => {
    const key = getSessionKey(ctx);

    ctx.session.key = key;

    const session = await getSession(key);

    if (session) {
      Object.assign(ctx.session, session);
    }

    await next();

    await saveSession(key, ctx.session);
  };
}
