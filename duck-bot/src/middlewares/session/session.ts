import { FilterQuery, UpdateQuery } from "mongoose";
import { Context, MiddlewareFn } from "telegraf";
import * as mongoose from "mongoose";

export interface Session {
  key: string;
}

export interface SessionContext<T extends Session, TDoc extends mongoose.Document<T>> extends Context {
  session: T;
}

export class MongooseSession<T extends Session, TDoc extends mongoose.Document<T>> {
  /**
   *
   */
  constructor(private _model: mongoose.Model<TDoc>) {}

  getSessionKey({ from, chat }: Context): string {
    if (from == null) {
      throw new Error("From is null");
    }

    const firstKey = from.id;
    const secondKey = chat ? chat.id : firstKey;

    return `${firstKey}:${secondKey}`;
  }

  async getSession(key: string) {
    const session = await this._model.findOne(({
      key,
    } as unknown) as FilterQuery<TDoc>);
    return session?.toJSON({ virtuals: false, versionKey: false });
  }

  async saveSession(key: string, data: T) {
    const update = await this._model.findOneAndUpdate(
      ({ key } as unknown) as FilterQuery<TDoc>,
      (data as unknown) as UpdateQuery<TDoc>,
      { upsert: true },
    );
  }

  session(): MiddlewareFn<SessionContext<T, TDoc>> {
    return async (ctx, next) => {
      const key = this.getSessionKey(ctx);

      ctx.session.key = key;

      const session = await this.getSession(key);

      if (session) {
        Object.assign(ctx.session, session);
      }

      await next();

      await this.saveSession(key, ctx.session);
    };
  }
}
