import { DuckApi, DuckImage, DuckResponse } from "duck-node";
import {
  InlineQuery,
  InlineQueryResultGif,
  InlineQueryResultPhoto,
} from "typegram";
import { DuckSession } from "../schemas/session";
import { AxiosResponse } from "axios";
import { v4 as uuid } from "uuid";
import path = require("path");

type PhotoGif = InlineQueryResultPhoto | InlineQueryResultGif;

export class ImagesService {
  constructor(private _duckApi: DuckApi) {}

  async getImages(
    inlineQuery: InlineQuery,
    session: DuckSession
  ): Promise<DuckResponse<DuckImage>> {
    let response: AxiosResponse<DuckResponse<DuckImage>>;

    if (session.query === inlineQuery.query && session.vqd && session.next) {
      response = await this._duckApi.getImagesNext(session.next, session.vqd);
    } else {
      response = await this._duckApi.getImages(inlineQuery.query);
    }

    return response.data;
  }

  getQueryInlineResults(source: DuckImage[]): PhotoGif[] {
    return source.map((image) => {
      const ext = path.extname(image.image);
      switch (ext) {
        case ".jpeg":
        case ".jpg":
          return {
            type: "photo",
            id: uuid(),
            photo_url: image.image,
            thumb_url: image.thumbnail,
          };
        case ".gif":
          return {
            type: "gif",
            id: uuid(),
            gif_url: image.image,
            thumb_url: image.thumbnail,
          };
        default:
          throw new Error(`${ext} is out of range.`);
      }
    });
  }
}
