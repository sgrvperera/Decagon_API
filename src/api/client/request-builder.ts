import { config } from '../../../config/test-config';
import { AuthHandler } from '../auth/auth-handler';

export interface RequestOptions {
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  timeout?: number;
  auth?: AuthHandler;
}

export class RequestBuilder {
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'traceId': config.traceId
  };

  buildHeaders(options: RequestOptions = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    if (options.auth) {
      Object.assign(headers, options.auth.getAuthHeaders());
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  buildQueryString(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    
    return `?${searchParams.toString()}`;
  }

  buildUrl(path: string, queryParams?: Record<string, any>): string {
    const queryString = this.buildQueryString(queryParams);
    return `${path}${queryString}`;
  }
}

export const requestBuilder = new RequestBuilder();
