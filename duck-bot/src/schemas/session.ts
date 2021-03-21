import { Document } from 'mongoose';
import * as mongoose from "mongoose";

export class DuckSession {
  query: string;
  vqd: string;
  next: string;
}

const SessionSchema = new mongoose.Schema({
    query: String,
    vqd: String,
    next: String,
});

export type SessionDocument = DuckSession & Document;

export const SessionModel = mongoose.model<SessionDocument>(DuckSession.name, SessionSchema);