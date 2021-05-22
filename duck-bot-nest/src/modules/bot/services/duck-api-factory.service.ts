import { Injectable } from '@nestjs/common';
import { DuckApi } from 'duck-node';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@common/types/environment.config';
import { AxiosRequestConfig } from 'axios';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import Chance from 'chance';
import UserAgent from 'user-agents';

@Injectable()
export class DuckApiFactory {
  private readonly _chance = new Chance();
  private readonly _userAgents = new UserAgent({ deviceCategory: 'mobile' });
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
    let axiosConfig: AxiosRequestConfig = {};

    if (httpsProxyAgent) {
      axiosConfig = { ...axiosConfig, httpsAgent: httpsProxyAgent };
    }
    if (!httpsProxyAgent && proxy) {
      axiosConfig = { ...axiosConfig, httpsAgent: new HttpsProxyAgent(proxy) };
    }

    const api = new DuckApi((defaultConfig) => {
      return { ...defaultConfig, ...axiosConfig, headers: { 'User-Agent': this._userAgents.random().toString() } };
    });

    this._proxiesCache.set(proxy, httpsProxyAgent);

    return api;
  }

  private getRandomProxy(): string {
    if (this._proxies.length === 0) {
      return '';
    }

    const index = this._chance.natural({ max: this._proxies.length - 1 });
    return this._proxies[index];
  }
}
