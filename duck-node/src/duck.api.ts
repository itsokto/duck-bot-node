import axios, { AxiosInstance, AxiosResponse } from "axios";
import { DuckImage, DuckResponse, DuckStrict } from "./models";

export class DuckApi {
  private readonly baseURL = "https://duckduckgo.com/";
  private readonly regexp = new RegExp("vqd='?(?<vqd>[\\d-]+)'?", "mi");
  private _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      baseURL: this.baseURL,
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://duckduckgo.com/",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
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
