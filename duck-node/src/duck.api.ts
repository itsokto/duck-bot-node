import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DuckImage, DuckResponse, DuckStrict } from './models';
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

    this._client.interceptors.response.use((response) => {
      if (response.data instanceof Object && response.data.query) {
        response.data.query = Buffer.from(response.data.query, 'latin1').toString();
      }
      return response;
    });
  }

  async getToken(query: string): Promise<string> {
    const page = await this._client
      .get<string>('', this.configFactory({ params: { q: query } }))
      .then((res) => res.data);

    const math = constants.vqdRegex.exec(page);
    if (math?.groups) {
      return math.groups['vqd'];
    }

    throw 'No match for vqd-token.';
  }

  async getImages(query: string, strict: DuckStrict = DuckStrict.Off): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    const vqd = await this.getToken(query);
    return this._client.get<DuckResponse<DuckImage>>(
      'i.js',
      this.configFactory({ params: { q: query, p: strict, vqd, o: 'json', f: ',,,', l: 'us-en' } }),
    );
  }

  next<T>(next: string, vqd: string): Promise<AxiosResponse<DuckResponse<T>>> {
    return this._client.get<DuckResponse<T>>(next, this.configFactory({ params: { vqd } }));
  }
}
