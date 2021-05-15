import { DuckImage, DuckResponse } from 'duck-node';
import { InlineQueryResultGif, InlineQueryResultPhoto } from 'typegram';
import path = require('path');
import { SessionEntity } from '@modules/storage';
import { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import { DuckApiFactory } from '@modules/bot/services/duck-api-factory.service';
import { Chance } from 'chance';

type JpegGifQueryResult = InlineQueryResultPhoto | InlineQueryResultGif;
const allowedExt = ['.jpeg', '.jpg', '.gif'];

@Injectable()
export class ImagesService {
  private readonly _chance = new Chance();

  constructor(private _duckApiFactory: DuckApiFactory) {}

  getImages(query: string, session: SessionEntity): Promise<DuckResponse<DuckImage>> {
    if (session.query === query && session.vqd && session.next) {
      return this._duckApiFactory
        .create()
        .next<DuckImage>(session.next, session.vqd)
        .then((res) => res.data)
        .catch(this.handle403);
    }

    if (session.query !== query) {
      return this._duckApiFactory
        .create()
        .getImages(query, session.strict)
        .then((res) => res.data)
        .catch(this.handle403);
    }

    return Promise.resolve({
      vqd: null,
      next: null,
      results: [],
      query: null,
      queryEncoded: null,
    });
  }

  mapToInlineQueryResults(source: DuckImage[]): JpegGifQueryResult[] {
    return source.flatMap((image) => {
      const ext = path.extname(image.image);
      if (!allowedExt.includes(ext)) {
        return [];
      }
      const inlineQueryResult = this.mapToInlineQueryResult(image, ext);
      return inlineQueryResult ? [inlineQueryResult] : [];
    });
  }

  private mapToInlineQueryResult(source: DuckImage, ext: string): JpegGifQueryResult {
    switch (ext) {
      case '.jpeg':
      case '.jpg':
        return {
          type: 'photo',
          id: this._chance.guid(),
          photo_url: source.image,
          thumb_url: source.thumbnail,
        };
      case '.gif':
        return {
          type: 'gif',
          id: this._chance.guid(),
          gif_url: source.image,
          thumb_url: source.thumbnail,
        };
      default:
        return null;
    }
  }

  private handle403(err: AxiosError<DuckResponse<DuckImage>>): DuckResponse<DuckImage> {
    if (err.response?.status === 403) {
      return err.response?.data;
    }
    throw err;
  }
}
