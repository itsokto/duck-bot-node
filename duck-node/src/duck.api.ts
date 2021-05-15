import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DuckImage, DuckResponse, DuckStrict } from './models';
import constants from './constants';

export class DuckApi {
  private _client: AxiosInstance;

  constructor(axiosConfig?: AxiosRequestConfig) {
    axiosConfig ??= {};
    axiosConfig.baseURL ??= constants.baseURL;
    this._client = axios.create(axiosConfig);
  }

  async getToken(query: string): Promise<String> {
    const page = await this._client
      .get<string>("", {
        params: { q: query },
      })
      .then((res) => res.data);

    const math = constants.vqdRegex.exec(page);
    if (math && math.groups) {
      return math.groups["vqd"];
    }

    throw "No match for vqd-token.";
  }

  async getImages(
    query: string,
    strict: DuckStrict = DuckStrict.Off
  ): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    const vqd = await this.getToken(query);
    return this._client.get<DuckResponse<DuckImage>>("i.js", {
      params: { q: query, p: strict, vqd, o: "json", f: ",,,", l: "us-en" },
    });
  }

  next<T>(next: string, vqd: string): Promise<AxiosResponse<DuckResponse<T>>> {
    return this._client.get<DuckResponse<T>>(next, {
      params: { vqd },
    });
  }
}
