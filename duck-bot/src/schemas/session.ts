import * as mongoose from "mongoose";
import { SessionDocument, Session } from "../duck.bot";

export class DuckSession implements Session {
  key: string;
  query: string;
  vqd: string;
  next: string;
}

const SessionSchema = new mongoose.Schema(
  {
    key: String,
    query: String,
    vqd: String,
    next: String,
  }
);
SessionSchema.loadClass(DuckSession);

export type DuckSessionDocument = SessionDocument;

export const DuckSessionModel = mongoose.model<DuckSessionDocument>(
  DuckSession.name,
  SessionSchema
);
