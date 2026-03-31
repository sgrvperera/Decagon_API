import { responseConsolidator } from '../src/helpers/response-consolidator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Consolidate all captured responses from all sessions into one master reference file
 */

const captureBaseDir = path.resolve(process.cwd(), 'test-results', 'api-captures', '2026-03-30');

if (!fs.existsSync(captureBaseDir)) {
  console.log('No captures found');
  process.exit(1);
}

// Get all session directories
const sessions = fs.readdirSync(captureBaseDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name.startsWith('session-'))
  .map(entry => path.join(captureBaseDir, entry.name))
  .sort();

console.log(`Found ${sessions.length} sessions`);

// Consolidate each session
const allResponses: any[] = [];
const allDomains = new Set<string>();

for (const sessionPath of sessions) {
  try {
    const result = responseConsolidator.consolidateSession(sessionPath);
    allResponses.push(...result.responses);
    result.domains.forEach(d => allDomains.add(d));
    console.log(`  - ${path.basename(sessionPath)}: ${result.responses.length} responses`);
  } catch (error) {
    console.warn(`  - ${path.basename(sessionPath)}: Error - ${error}`);
  }
}

// Group by scenario ID to get unique scenarios
const scenarioMap = new Map<string, any>();
for (const response of allResponses) {
  const key = `${response.domain}::${response.scenarioId}`;
  if (!scenarioMap.has(key)) {
    scenarioMap.set(key, response);
  }
}

const uniqueResponses = Array.from(scenarioMap.values()).sort((a, b) => {
  if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
  return a.scenarioId.localeCompare(b.scenarioId);
});

// Save master reference file
const masterFile = {
  generatedAt: new Date().toISOString(),
  totalResponses: uniqueResponses.length,
  domains: Array.from(allDomains).sort(),
  responses: uniqueResponses
};

const outputPath = path.join(captureBaseDir, 'master-reference-responses.json');
fs.writeFileSync(outputPath, JSON.stringify(masterFile, null, 2), 'utf8');

console.log(`\n[Master Consolidation] Consolidated ${uniqueResponses.length} unique scenarios from ${allDomains.size} domains`);
console.log(`[Master Consolidation] Saved to: ${outputPath}`);

// Print summary by domain
console.log('\nScenarios by domain:');
const domainCounts = new Map<string, number>();
for (const response of uniqueResponses) {
  domainCounts.set(response.domain, (domainCounts.get(response.domain) || 0) + 1);
}
for (const [domain, count] of Array.from(domainCounts.entries()).sort()) {
  console.log(`  ${domain}: ${count} scenarios`);
}
