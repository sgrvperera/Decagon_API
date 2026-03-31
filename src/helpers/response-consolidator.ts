import * as fs from 'fs';
import * as path from 'path';

/**
 * Consolidated Response Reference
 * This file consolidates all captured API responses into a single reference file
 * for analyzing and deriving scenario-specific assertions.
 */

export interface ConsolidatedResponse {
  domain: string;
  scenarioId: string;
  scenarioName: string;
  mifeApi: string;
  request: {
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    body?: any;
    queryParams?: Record<string, string>;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    isJson: boolean;
  };
  duration?: number;
  timestamp: string;
  suggestedAssertions?: {
    status: number | number[];
    responseTime?: number;
    bodyNotEmpty?: boolean;
    requiredFields?: string[];
    fieldValues?: Record<string, any>;
    bodyContains?: string[];
    arrayFields?: string[];
    jsonSchema?: any;
  };
}

export interface ReferenceResponseFile {
  generatedAt: string;
  totalResponses: number;
  domains: string[];
  responses: ConsolidatedResponse[];
}

class ResponseConsolidator {
  /**
   * Consolidate all captured responses from a session into a single reference file
   */
  consolidateSession(sessionDir: string, outputPath?: string): ReferenceResponseFile {
    if (!fs.existsSync(sessionDir)) {
      throw new Error(`Session directory not found: ${sessionDir}`);
    }

    const responses: ConsolidatedResponse[] = [];
    const domains = new Set<string>();

    // Read all JSON files recursively
    this.readCapturesRecursively(sessionDir, responses, domains);

    // Sort by domain and scenario
    responses.sort((a, b) => {
      if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
      return a.scenarioId.localeCompare(b.scenarioId);
    });

    // Analyze and suggest assertions
    responses.forEach(response => {
      response.suggestedAssertions = this.analyzeResponse(response);
    });

    const referenceFile: ReferenceResponseFile = {
      generatedAt: new Date().toISOString(),
      totalResponses: responses.length,
      domains: Array.from(domains).sort(),
      responses
    };

    // Save to output file
    const outputFilePath = outputPath || path.join(sessionDir, 'reference-responses.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(referenceFile, null, 2), 'utf8');
    
    console.log(`[ResponseConsolidator] Consolidated ${responses.length} responses from ${domains.size} domains`);
    console.log(`[ResponseConsolidator] Reference file saved to: ${outputFilePath}`);

    return referenceFile;
  }

  /**
   * Read all capture files recursively
   */
  private readCapturesRecursively(dir: string, responses: ConsolidatedResponse[], domains: Set<string>) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.readCapturesRecursively(fullPath, responses, domains);
      } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== '_summary.json') {
        try {
          const captureData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          
          if (captureData.scenarioId && captureData.domain) {
            const consolidated: ConsolidatedResponse = {
              domain: captureData.domain,
              scenarioId: captureData.scenarioId,
              scenarioName: captureData.scenarioName,
              mifeApi: captureData.mifeApi,
              request: captureData.request,
              response: captureData.response,
              duration: captureData.duration,
              timestamp: captureData.timestamp
            };

            responses.push(consolidated);
            domains.add(captureData.domain);
          }
        } catch (error) {
          console.warn(`[ResponseConsolidator] Failed to parse ${fullPath}: ${error}`);
        }
      }
    }
  }

  /**
   * Analyze response and suggest assertions
   */
  private analyzeResponse(response: ConsolidatedResponse): any {
    const suggestions: any = {
      status: response.response.status
    };

    // Response time suggestion
    if (response.duration) {
      // Suggest 150% of actual duration as max, minimum 3000ms
      suggestions.responseTime = Math.max(Math.ceil(response.duration * 1.5), 3000);
    }

    // Body not empty
    if (response.response.body) {
      suggestions.bodyNotEmpty = true;
    }

    // Analyze JSON body
    if (response.response.isJson && typeof response.response.body === 'object') {
      const body = response.response.body;

      // Required fields (top-level keys)
      suggestions.requiredFields = Object.keys(body);

      // Field values for specific fields
      suggestions.fieldValues = {};
      
      // Dialog API specific patterns
      if (body.executionStatus !== undefined) {
        suggestions.fieldValues.executionStatus = body.executionStatus;
      }
      if (body.executionMessage !== undefined) {
        suggestions.fieldValues.executionMessage = body.executionMessage;
      }

      // Array fields
      suggestions.arrayFields = [];
      for (const [key, value] of Object.entries(body)) {
        if (Array.isArray(value)) {
          suggestions.arrayFields.push(key);
        }
      }

      // Body contains for negative scenarios
      if (response.scenarioId.includes('negative') || response.scenarioId.includes('invalid')) {
        suggestions.bodyContains = this.extractNegativePatterns(body);
      }
    }

    return suggestions;
  }

  /**
   * Extract patterns for negative test assertions
   */
  private extractNegativePatterns(body: any): string[] {
    const patterns: string[] = [];
    const bodyStr = JSON.stringify(body).toLowerCase();

    if (bodyStr.includes('error')) patterns.push('error');
    if (bodyStr.includes('fail')) patterns.push('fail');
    if (bodyStr.includes('invalid')) patterns.push('invalid');
    if (bodyStr.includes('not found')) patterns.push('not found');
    if (bodyStr.includes('eligible') && bodyStr.includes('false')) patterns.push('eligible', 'false');
    if (body.executionStatus && body.executionStatus !== '00') patterns.push('executionStatus');

    return patterns;
  }

  /**
   * Find latest session directory
   */
  findLatestSession(captureDir?: string): string | null {
    const baseDir = captureDir || path.resolve(process.cwd(), 'test-results', 'api-captures');
    
    if (!fs.existsSync(baseDir)) {
      return null;
    }

    const dates = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
      .reverse();

    if (dates.length === 0) return null;

    const latestDate = dates[0];
    const datePath = path.join(baseDir, latestDate);

    const sessions = fs.readdirSync(datePath, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('session-'))
      .map(entry => entry.name)
      .sort()
      .reverse();

    if (sessions.length === 0) return null;

    return path.join(datePath, sessions[0]);
  }
}

export const responseConsolidator = new ResponseConsolidator();

// CLI usage
if (require.main === module) {
  const consolidator = new ResponseConsolidator();
  
  // Check if session path was provided as argument
  const sessionPath = process.argv[2];
  
  if (sessionPath) {
    console.log(`Using provided session: ${sessionPath}`);
    consolidator.consolidateSession(sessionPath);
  } else {
    const latestSession = consolidator.findLatestSession();
    
    if (latestSession) {
      console.log(`Found latest session: ${latestSession}`);
      consolidator.consolidateSession(latestSession);
    } else {
      console.log('No captured sessions found. Run tests with CAPTURE_API_RESPONSES=true first.');
    }
  }
}
