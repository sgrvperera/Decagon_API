import { APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface CapturedRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

export interface CapturedResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  bodyText: string;
  isJson: boolean;
}

export interface CapturedApiCall {
  timestamp: string;
  testName: string;
  scenarioId?: string;
  scenarioName?: string;
  domain?: string;
  mifeApi?: string;
  request: CapturedRequest;
  response: CapturedResponse;
  duration?: number;
}

class ResponseCapture {
  private enabled: boolean;
  private captureDir: string;
  private sessionDir: string;

  constructor() {
    const captureEnv = (process.env.CAPTURE_API_RESPONSES || '').trim();
    this.enabled = captureEnv === 'true';
    this.captureDir = path.resolve(process.cwd(), 'test-results', 'api-captures');
    this.sessionDir = '';
    
    if (this.enabled) {
      this.initializeSession();
    }
  }

  private initializeSession() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const sessionTime = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('Z')[0];
    this.sessionDir = path.join(this.captureDir, `${timestamp}`, `session-${sessionTime}`);
    
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    
    console.log(`[ResponseCapture] Enabled - Saving to: ${this.sessionDir}`);
  }

  async capture(
    testName: string,
    method: string,
    endpoint: string,
    response: APIResponse,
    options: {
      headers?: Record<string, string>;
      body?: any;
      queryParams?: Record<string, string>;
      scenarioId?: string;
      scenarioName?: string;
      domain?: string;
      mifeApi?: string;
      startTime?: number;
    } = {}
  ): Promise<CapturedApiCall | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const endTime = Date.now();
      const duration = options.startTime ? endTime - options.startTime : undefined;

      // Capture response
      const responseHeaders: Record<string, string> = {};
      response.headers() && Object.entries(response.headers()).forEach(([key, value]) => {
        responseHeaders[key] = value;
      });

      let responseBody: any;
      let responseBodyText: string;
      let isJson = false;

      try {
        responseBodyText = await response.text();
        try {
          responseBody = JSON.parse(responseBodyText);
          isJson = true;
        } catch {
          responseBody = responseBodyText;
        }
      } catch (error) {
        responseBodyText = '[Unable to read response body]';
        responseBody = null;
      }

      const captured: CapturedApiCall = {
        timestamp: new Date().toISOString(),
        testName,
        scenarioId: options.scenarioId,
        scenarioName: options.scenarioName,
        domain: options.domain,
        mifeApi: options.mifeApi,
        request: {
          method,
          endpoint,
          headers: options.headers || {},
          body: options.body,
          queryParams: options.queryParams
        },
        response: {
          status: response.status(),
          statusText: response.statusText(),
          headers: responseHeaders,
          body: responseBody,
          bodyText: responseBodyText,
          isJson
        },
        duration
      };

      // Save to file
      await this.saveCapture(captured);

      return captured;
    } catch (error) {
      console.error(`[ResponseCapture] Error capturing response: ${error}`);
      return null;
    }
  }

  private async saveCapture(captured: CapturedApiCall) {
    try {
      // Create domain-specific subdirectory
      const domainDir = captured.domain 
        ? path.join(this.sessionDir, captured.domain)
        : this.sessionDir;

      if (!fs.existsSync(domainDir)) {
        fs.mkdirSync(domainDir, { recursive: true });
      }

      // Generate filename
      const sanitizedTestName = this.sanitizeFilename(captured.testName);
      const timestamp = new Date().getTime();
      const filename = `${sanitizedTestName}-${timestamp}.json`;
      const filepath = path.join(domainDir, filename);

      // Write to file
      fs.writeFileSync(filepath, JSON.stringify(captured, null, 2), 'utf8');

      // Also create a summary file
      this.updateSummary(captured);

    } catch (error) {
      console.error(`[ResponseCapture] Error saving capture: ${error}`);
    }
  }

  private updateSummary(captured: CapturedApiCall) {
    try {
      const summaryPath = path.join(this.sessionDir, '_summary.json');
      
      let summary: any[] = [];
      if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      }

      summary.push({
        timestamp: captured.timestamp,
        testName: captured.testName,
        scenarioId: captured.scenarioId,
        domain: captured.domain,
        method: captured.request.method,
        endpoint: captured.request.endpoint,
        status: captured.response.status,
        duration: captured.duration
      });

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    } catch (error) {
      console.error(`[ResponseCapture] Error updating summary: ${error}`);
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 100);
  }

  /**
   * Get attachment data for Playwright report
   */
  getAttachment(captured: CapturedApiCall | null): { name: string; body: string; contentType: string } | null {
    if (!captured) return null;

    return {
      name: 'API Response',
      body: JSON.stringify(captured, null, 2),
      contentType: 'application/json'
    };
  }

  /**
   * Check if capture is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current session directory
   */
  getSessionDir(): string {
    return this.sessionDir;
  }
}

// Singleton instance
export const responseCapture = new ResponseCapture();
