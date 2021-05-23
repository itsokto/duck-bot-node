import { Injectable } from '@nestjs/common';
import { DuckApi } from 'duck-node';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@common/types/environment.config';
import { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import Chance from 'chance';
import UserAgent from 'user-agents';

@Injectable()
export class DuckApiFactory {
  private readonly _chance = new Chance();
  private readonly _userAgents = new UserAgent(
    (data) => !data.userAgent.includes('Safari') && !data.userAgent.includes('Mac'),
  );
  private readonly _proxies: string[] = [];
  private _proxiesCache: Map<string, HttpsProxyAgent> = new Map<string, HttpsProxyAgent>();

  constructor(private readonly _configService: ConfigService<EnvironmentConfig>) {
    const proxies = _configService.get<string>('PROXY', '').split(';');
    this._proxies.push(...proxies);
  }

  create(): DuckApi {
    const proxy = this.getRandomProxy();
    return this.cacheGetOrCreate(proxy);
  }

  private cacheGetOrCreate(proxy: string): DuckApi {
    const httpsProxyAgent = this._proxiesCache.get(proxy);
    let axiosConfig: AxiosRequestConfig = { timeout: 5000 };

    if (httpsProxyAgent) {
      axiosConfig.httpsAgent = httpsProxyAgent;
    }

    if (!httpsProxyAgent && proxy) {
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxy);
      this._proxiesCache.set(proxy, httpsProxyAgent);
    }

    return new DuckApi(this.configFactory(axiosConfig));
  }

  private getRandomProxy(): string {
    if (this._proxies.length === 0) {
      return '';
    }

    const index = this._chance.natural({ max: this._proxies.length - 1 });
    return this._proxies[index];
  }

  private configFactory(config: AxiosRequestConfig): (defaultConfig: AxiosRequestConfig) => AxiosRequestConfig {
    return (defaultConfig: AxiosRequestConfig): AxiosRequestConfig => {
      const defaultHeaders = { 'user-agent': this._userAgents.random().toString() };
      const postHeaders = {
        ...defaultHeaders,
        authority: 'duckduckgo.com',
        accept: 'application/json, text/javascript, */*; q=0.01',
        'sec-fetch-dest': 'empty',
        'x-requested-with': 'XMLHttpRequest',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        referer: 'https://duckduckgo.com/',
        'accept-language': 'en-US,en;q=0.9',
      };
      const headers = defaultConfig.method === 'post' ? postHeaders : defaultHeaders;

      return {
        ...defaultConfig,
        ...config,
        headers: headers,
      };
    };
  }
}
