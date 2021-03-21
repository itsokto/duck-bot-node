import axios, { AxiosInstance, AxiosResponse } from "axios";
import { DuckImage, DuckResponse } from "./models";

export class DuckApi {
  private _client: AxiosInstance;

  constructor(baseUrl: string) {
    this._client = axios.create({ baseURL: baseUrl });
  }

  getImages(query: string): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    return this._client.get<DuckResponse<DuckImage>>("duck/images", {
      params: { query },
    });
  }

  getImagesNext(
    next: string,
    vqd: string
  ): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    return this._client.get<DuckResponse<DuckImage>>("duck/images/next", {
      params: { next, vqd },
    });
  }
}
