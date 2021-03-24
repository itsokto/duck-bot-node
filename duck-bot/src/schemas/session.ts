import { DuckStrict } from "duck-node";
import * as mongoose from "mongoose";
import { Session } from "../middlewares/session";

export class DuckSession implements Session {
  key: string;
  query: string;
  vqd: string;
  next: string;
  strict: DuckStrict;
}

const SessionSchema = new mongoose.Schema({
  key: String,
  query: String,
  vqd: String,
  next: String,
  strict: {
    type: Number,
    min: -1,
    max: 2,
    default: -1,
  },
});
SessionSchema.loadClass(DuckSession);

export type DuckSessionDocument = mongoose.Document<DuckSession>;

export const DuckSessionModel = mongoose.model<DuckSessionDocument>("session", SessionSchema);
