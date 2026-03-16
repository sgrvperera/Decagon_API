// src/api/apiClient.ts
import { APIRequestContext, request } from '@playwright/test';

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: any;
  timeoutMs?: number;
};

export class ApiClient {
  private ctx: APIRequestContext;

  private constructor(ctx: APIRequestContext) {
    this.ctx = ctx;
  }

  static async create(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    const ctx = await request.newContext({
      baseURL,
      extraHTTPHeaders: defaultHeaders,
      ignoreHTTPSErrors: true
    });
    return new ApiClient(ctx);
  }

  async get(path: string, opts: RequestOptions = {}) {
    const res = await this.ctx.get(path, {
      headers: opts.headers,
      params: opts.params,
      timeout: opts.timeoutMs
    });
    await this.logResponse('GET', path, res);
    return res;
  }

  async post(path: string, opts: RequestOptions = {}) {
    const res = await this.ctx.post(path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      data: opts.data,
      timeout: opts.timeoutMs
    });
    await this.logResponse('POST', path, res);
    return res;
  }

  async put(path: string, opts: RequestOptions = {}) {
    const res = await this.ctx.put(path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      data: opts.data,
      timeout: opts.timeoutMs
    });
    await this.logResponse('PUT', path, res);
    return res;
  }

  async delete(path: string, opts: RequestOptions = {}) {
    const res = await this.ctx.delete(path, {
      headers: opts.headers,
      data: opts.data,
      timeout: opts.timeoutMs
    });
    await this.logResponse('DELETE', path, res);
    return res;
  }

  async dispose() {
    await this.ctx.dispose();
  }

  private async logResponse(method: string, path: string, res: any) {
    const status = res.status();
    console.log(`[API] ${method} ${path} -> ${status}`);
  }
}
