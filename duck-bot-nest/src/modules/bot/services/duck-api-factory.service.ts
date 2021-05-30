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
    return new DuckApi(this.configFactory());
  }

  private configFactory(): (defaultConfig: AxiosRequestConfig) => AxiosRequestConfig {
    return (defaultConfig: AxiosRequestConfig): AxiosRequestConfig => {
      this.setProxy(defaultConfig);
      this.setHeaders(defaultConfig);

      return defaultConfig;
    };
  }

  private setProxy(axiosRequest: AxiosRequestConfig): void {
    axiosRequest.timeout = 10000;
    const proxy = this.getRandomProxy();

    if (!proxy) {
      return;
    }

    let cachedHttpsProxyAgent = this._proxiesCache.get(proxy);

    if (cachedHttpsProxyAgent) {
      axiosRequest.httpsAgent = cachedHttpsProxyAgent;
      return;
    }

    cachedHttpsProxyAgent = new HttpsProxyAgent(proxy);
    axiosRequest.httpsAgent = cachedHttpsProxyAgent;
    this._proxiesCache.set(proxy, cachedHttpsProxyAgent);
  }

  private getRandomProxy(): string {
    if (this._proxies.length === 0) {
      return '';
    }

    const index = this._chance.natural({ max: this._proxies.length - 1 });

    return this._proxies[index];
  }

  private setHeaders(axiosRequest: AxiosRequestConfig): void {
    const defaultHeaders = { 'user-agent': this._userAgents.random().toString() };

    axiosRequest.headers = { ...axiosRequest.headers, ...defaultHeaders };
  }
}
