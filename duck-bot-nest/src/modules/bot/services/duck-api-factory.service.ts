import { Injectable } from '@nestjs/common';
import { DuckApi } from 'duck-node';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@common/types/environment.config';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import { Chance } from 'chance';

@Injectable()
export class DuckApiFactory {
  private readonly _chance = new Chance();
  private readonly _proxies: string[] = [];
  private _cache: Map<string, DuckApi> = new Map<string, DuckApi>();

  constructor(private readonly _configService: ConfigService<EnvironmentConfig>) {
    const proxies = _configService.get<string>('PROXY', '').split(';');
    this._proxies.push(...proxies);
  }

  create(): DuckApi {
    const proxy = this.getRandomProxy();
    return this.cacheGetOrCreate(proxy);
  }

  private cacheGetOrCreate(proxy: string): DuckApi {
    let duckApi = this._cache.get(proxy);
    if (duckApi) {
      return duckApi;
    }

    const axiosConfig = proxy === '' ? {} : { httpsAgent: new HttpsProxyAgent(proxy) };
    duckApi = new DuckApi(axiosConfig);

    this._cache.set(proxy, duckApi);

    return duckApi;
  }

  private getRandomProxy(): string {
    if (this._proxies.length === 0) {
      return '';
    }

    const index = this._chance.natural({ max: this._proxies.length - 1 });
    return this._proxies[index];
  }
}
