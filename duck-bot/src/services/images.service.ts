import { DuckApi, DuckImage, DuckResponse } from "duck-node";
import {
  InlineQuery,
  InlineQueryResultGif,
  InlineQueryResultPhoto,
} from "typegram";
import { DuckSession } from "../schemas/session";
import { v4 as uuid } from "uuid";
import path = require("path");

type PhotoOrGif = InlineQueryResultPhoto | InlineQueryResultGif;

export class ImagesService {
  constructor(private _duckApi: DuckApi) {}

  async getImages(
    inlineQuery: InlineQuery,
    session: DuckSession
  ): Promise<DuckResponse<DuckImage>> {
    let response: DuckResponse<DuckImage>;

    if (session.query === inlineQuery.query && session.vqd && session.next) {
      response = await this._duckApi
        .getImagesNext(session.next, session.vqd)
        .then((res) => res.data);
    } else if (session.query !== inlineQuery.query) {
      response = await this._duckApi
        .getImages(inlineQuery.query)
        .then((res) => res.data);
    } else {
      response = <DuckResponse<DuckImage>>{};
    }

    return response;
  }

  mapToInlineQueryResults(source: DuckImage[]): PhotoOrGif[] {
    const allowedExt = [".jpeg", ".jpg", ".gif"];

    return source.flatMap((image) => {
      const ext = path.extname(image.image);
      if (allowedExt.includes(ext)) {
        const inlineQueryResult = this.mapToInlineQueryResult(image, ext);
        return inlineQueryResult ? [inlineQueryResult] : [];
      }
      return <PhotoOrGif[]>[];
    });
  }

  private mapToInlineQueryResult(
    source: DuckImage,
    ext: string
  ): PhotoOrGif | null {
    switch (ext) {
      case ".jpeg":
      case ".jpg":
        return {
          type: "photo",
          id: uuid(),
          photo_url: source.image,
          thumb_url: source.thumbnail,
        };
      case ".gif":
        return {
          type: "gif",
          id: uuid(),
          gif_url: source.image,
          thumb_url: source.thumbnail,
        };
      default:
        return null;
    }
  }
}
