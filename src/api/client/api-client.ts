import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { config } from '../../../config/test-config';
import { RequestOptions, requestBuilder } from './request-builder';
import { responseCapture } from '../../helpers/response-capture';

export class ApiClient {
  private ctx?: APIRequestContext;
  private mockMode: boolean;

  private constructor(ctx?: APIRequestContext, mockMode: boolean = false) {
    this.ctx = ctx;
    this.mockMode = mockMode;
  }

  static async create(baseURL?: string): Promise<ApiClient> {
    if (config.mockMode) {
      console.log('[ApiClient] MOCK mode enabled');
      return new ApiClient(undefined, true);
    }

    const ctx = await request.newContext({
      baseURL: baseURL || config.baseURL,
      ignoreHTTPSErrors: true,
      timeout: config.timeout
    });

    return new ApiClient(ctx, false);
  }

  async get(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    if (this.mockMode) return this.mockResponse(path, 200);

    const url = requestBuilder.buildUrl(path, options.queryParams);
    const headers = requestBuilder.buildHeaders(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(async () => 
      this.ctx!.get(url, { headers, timeout: options.timeout || config.timeout })
    );

    this.logResponse('GET', url, response);
    
    // Capture response if enabled
    if (responseCapture.isEnabled() && options.captureContext) {
      await responseCapture.capture(
        options.captureContext.testName,
        'GET',
        url,
        response,
        {
          headers,
          queryParams: options.queryParams,
          ...options.captureContext,
          startTime
        }
      );
    }
    
    return response;
  }

  async post(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    if (this.mockMode) return this.mockResponse(path, 201);

    const url = requestBuilder.buildUrl(path, options.queryParams);
    const headers = requestBuilder.buildHeaders(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(async () =>
      this.ctx!.post(url, { 
        headers, 
        data: options.body, 
        timeout: options.timeout || config.timeout 
      })
    );

    this.logResponse('POST', url, response);
    
    // Capture response if enabled
    if (responseCapture.isEnabled() && options.captureContext) {
      await responseCapture.capture(
        options.captureContext.testName,
        'POST',
        url,
        response,
        {
          headers,
          body: options.body,
          queryParams: options.queryParams,
          ...options.captureContext,
          startTime
        }
      );
    }
    
    return response;
  }

  async put(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    if (this.mockMode) return this.mockResponse(path, 200);

    const url = requestBuilder.buildUrl(path, options.queryParams);
    const headers = requestBuilder.buildHeaders(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(async () =>
      this.ctx!.put(url, { 
        headers, 
        data: options.body, 
        timeout: options.timeout || config.timeout 
      })
    );

    this.logResponse('PUT', url, response);
    
    // Capture response if enabled
    if (responseCapture.isEnabled() && options.captureContext) {
      await responseCapture.capture(
        options.captureContext.testName,
        'PUT',
        url,
        response,
        {
          headers,
          body: options.body,
          queryParams: options.queryParams,
          ...options.captureContext,
          startTime
        }
      );
    }
    
    return response;
  }

  async delete(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    if (this.mockMode) return this.mockResponse(path, 204);

    const url = requestBuilder.buildUrl(path, options.queryParams);
    const headers = requestBuilder.buildHeaders(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(async () =>
      this.ctx!.delete(url, { headers, timeout: options.timeout || config.timeout })
    );

    this.logResponse('DELETE', url, response);
    
    // Capture response if enabled
    if (responseCapture.isEnabled() && options.captureContext) {
      await responseCapture.capture(
        options.captureContext.testName,
        'DELETE',
        url,
        response,
        {
          headers,
          queryParams: options.queryParams,
          ...options.captureContext,
          startTime
        }
      );
    }
    
    return response;
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retries: number = config.retries): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          console.log(`[ApiClient] Retry ${attempt + 1}/${retries} after error: ${lastError.message}`);
          await this.delay(1000 * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logResponse(method: string, path: string, response: APIResponse) {
    const status = response.status();
    const statusText = response.statusText();
    console.log(`[API] ${method} ${path} -> ${status} ${statusText}`);
  }

  private mockResponse(path: string, status: number): APIResponse {
    return {
      status: () => status,
      statusText: () => 'OK',
      ok: () => status >= 200 && status < 300,
      headers: () => ({ 'content-type': 'application/json' }),
      json: async () => ({ mock: true, path, status }),
      text: async () => JSON.stringify({ mock: true, path, status }),
      body: async () => Buffer.from(JSON.stringify({ mock: true })),
      url: () => path
    } as any;
  }

  async dispose() {
    if (this.ctx) await this.ctx.dispose();
  }
}
