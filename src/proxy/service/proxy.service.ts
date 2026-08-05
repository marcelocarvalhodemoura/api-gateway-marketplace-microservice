import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { serviceConfig } from '../../config/gateway.config';

type ProxyUserInfo = {
  id?: string;
  email?: string;
  role?: string;
};

type ProxyRequestConfig = {
  method: string;
  url: string;
  data?: unknown;
  headers: Record<string, string>;
  timeout: number;
};

type ProxyResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers: Record<string, unknown>;
};

type AxiosRef = {
  request: (config: ProxyRequestConfig) => Promise<ProxyResponse>;
};

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name); // logger para o serviço de proxy

  constructor(private readonly httpService: HttpService) {} // injeção do serviço de http

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    httpVerb: string,
    path: string,
    data?: unknown,
    headers?: Record<string, string>,
    userInfo?: ProxyUserInfo,
  ): Promise<ProxyResponse> {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${httpVerb} request to ${serviceName} : ${url}`);

    try {
      const enhancedHeaders: Record<string, string> = {
        ...headers,
        ...(userInfo?.id ? { 'x-user-id': userInfo.id } : {}),
        ...(userInfo?.email ? { 'x-user-email': userInfo.email } : {}),
        ...(userInfo?.role ? { 'x-user-role': userInfo.role } : {}),
      };

      const { axiosRef } = this.httpService as unknown as {
        axiosRef: AxiosRef;
      };
      const response = await axiosRef.request({
        method: httpVerb.toLowerCase(),
        url,
        data,
        headers: enhancedHeaders,
        timeout: service.timeout,
      });

      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error proxying ${httpVerb} request to ${serviceName}: ${message}`,
      );
      throw error;
    }
  }

  async getServiceHealth(serviceName: keyof typeof serviceConfig) {
    const service = serviceConfig[serviceName];
    const url = `${service.url}/health`;

    try {
      const { axiosRef } = this.httpService as unknown as {
        axiosRef: AxiosRef;
      };
      const response = await axiosRef.request({
        method: 'get',
        url,
        headers: {},
        timeout: service.timeout,
      });

      return {
        status: 'up',
        statusCode: response.status,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Health check failed for ${serviceName}: ${message}`);

      return {
        status: 'down',
        error: message,
      };
    }
  }
}
