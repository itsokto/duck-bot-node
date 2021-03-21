import * as mongoose from "mongoose";
import { SessionDocument, Session } from "../duck.bot";

export class DuckSession implements Session {
  key: string;
  query: string;
  vqd: string;
  next: string;
}

const SessionSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);
SessionSchema.loadClass(DuckSession);

export type DuckSessionDocument = SessionDocument<DuckSession>;

export const DuckSessionModel = mongoose.model<DuckSessionDocument>(
  DuckSession.name,
  SessionSchema
);
