import axios, { AxiosInstance, AxiosResponse } from "axios";
import { DuckImage, DuckResponse } from "./models";

export class DuckApi {
  private readonly baseURL = "https://duckduckgo.com/";
  private readonly regexp = new RegExp(`vqd='?(?<vqd>[\d-]+)'?`, "mi");
  private _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      baseURL: this.baseURL,
      params: { o: "json", f: ",,,", l: "us-en" },
    });

    this._client.interceptors.request.use((config) => {
      if (config.url === config.baseURL) {
        config.params = { q: config.params["q"] };
      }
      return config;
    });
  }

  async getToken(query: string): Promise<String> {
    const page = await this._client
      .get<string>(this.baseURL, { params: { q: query } })
      .then((res) => res.data);

    const math = this.regexp.exec(page);
    if (math && math.groups) {
      return math.groups["vqd"];
    }

    throw "No match for vqd-token.";
  }

  async getImages(
    query: string
  ): Promise<AxiosResponse<DuckResponse<DuckImage>>> {
    const vqd = await this.getToken(query);
    return this._client.get<DuckResponse<DuckImage>>("i.js", {
      params: { q: query, vqd },
    });
  }

  next<T>(next: string, vqd: string): Promise<AxiosResponse<DuckResponse<T>>> {
    return this._client.get<DuckResponse<T>>(next, {
      params: { vqd },
    });
  }
}
