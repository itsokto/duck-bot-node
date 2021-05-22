import { DuckApi, DuckImage, DuckResponse } from 'duck-node';
import { InlineQueryResultGif, InlineQueryResultPhoto } from 'typegram';
import path = require('path');
import { SessionEntity } from '@modules/storage';
import { AxiosError, AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { DuckApiFactory } from '@modules/bot/services/duck-api-factory.service';
import Chance from 'chance';

type JpegGifQueryResult = InlineQueryResultPhoto | InlineQueryResultGif;
const allowedExt = ['.jpeg', '.jpg', '.gif'];

@Injectable()
export class ImagesService {
  private readonly _chance = new Chance();
  private readonly _duckApi: DuckApi;

  constructor(_duckApiFactory: DuckApiFactory) {
    this._duckApi = _duckApiFactory.create();
  }

  getImages(query: string, session: SessionEntity): Promise<DuckResponse<DuckImage>> {
    if (session.query === query && session.vqd && session.next) {
      return this._duckApi
        .next<DuckImage>(session.next, session.vqd)
        .then((res) => this.handleResponse(res, query))
        .catch(this.handleError);
    }

    if (session.query !== query) {
      return this._duckApi
        .getImages(query, session.strict)
        .then((res) => this.handleResponse(res, query))
        .catch(this.handleError);
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

  private handleResponse(response: AxiosResponse<DuckResponse<DuckImage>>, query: string): DuckResponse<DuckImage> {
    response.data.query = query;
    response.data.results = response.data.results.filter((_, i) => i < 50);
    return response.data;
  }

  private handleError(err: AxiosError<DuckResponse<DuckImage>>): DuckResponse<DuckImage> {
    if (err.response?.status === 403) {
      return err.response?.data;
    }

    if (err.response?.status === 418) {
      console.warn('Provided config results strange error:', err.config);
      return err.response?.data;
    }
    throw err;
  }
}
