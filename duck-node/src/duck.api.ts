import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DuckImage, DuckResponse, DuckStrict, DuckError } from './models';
import constants from './constants';

const defaultFactory = (requestConfig: AxiosRequestConfig): AxiosRequestConfig => {
  return requestConfig;
};

export class DuckApi {
  private _client: AxiosInstance;

  constructor(
    private readonly configFactory: (requestConfig: AxiosRequestConfig) => AxiosRequestConfig = defaultFactory,
  ) {
    this._client = axios.create();
    this._client.defaults.baseURL = constants.baseURL;

    this._client.interceptors.request.use((request) => {
      if (request.url) {
        request.headers = {
          ...request.headers,
          authority: 'duckduckgo.com',
          accept: 'application/json, text/javascript, */*; q=0.01',
          'sec-fetch-dest': 'empty',
          'x-requested-with': 'XMLHttpRequest',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          referer: 'https://duckduckgo.com/',
          'accept-language': 'en-US,en;q=0.9',
        };
      }

      return this.configFactory(request);
    });
  }

  async getToken(query: string): Promise<string> {
    const response = await this._client.get<string>('/', { params: { q: query } });

    const math = constants.vqdRegex.exec(response.data);
    if (math?.groups) {
      return math.groups['vqd'];
    }

    throw new DuckError('No match for vqd-token.', response.request, response.data);
  }

  async getImages(query: string, strict: DuckStrict = DuckStrict.Off): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    const vqd = await this.getToken(query);
    return this._client.get<DuckResponse<DuckImage>>(constants.imagesURL, {
      params: { q: query, p: strict, vqd, o: 'json', f: ',,,', l: 'us-en' },
    });
  }

  next<T>(next: string, vqd: string): Promise<AxiosResponse<DuckResponse<T>>> {
    return this._client.get<DuckResponse<T>>(next, { params: { vqd } });
  }
}
