import * as fs from 'fs';
import * as path from 'path';

/**
 * Update scenario JSON files with assertions derived from captured API responses
 * This script reads the master reference file and updates each domain's scenario file
 */

const masterRefPath = path.resolve(process.cwd(), 'test-results', 'api-captures', '2026-03-30', 'master-reference-responses.json');
const scenariosDir = path.resolve(process.cwd(), 'data', 'scenarios');

if (!fs.existsSync(masterRefPath)) {
  console.log('Master reference file not found. Run consolidate-all-responses.ts first.');
  process.exit(1);
}

const masterRef = JSON.parse(fs.readFileSync(masterRefPath, 'utf8'));
console.log(`Loaded ${masterRef.totalResponses} scenarios from master reference`);

// Group responses by domain
const responsesByDomain = new Map<string, any[]>();
for (const response of masterRef.responses) {
  if (!responsesByDomain.has(response.domain)) {
    responsesByDomain.set(response.domain, []);
  }
  responsesByDomain.get(response.domain)!.push(response);
}

// Process each domain
for (const [domain, responses] of responsesByDomain.entries()) {
  const scenarioFile = path.join(scenariosDir, `${domain}.json`);
  
  if (!fs.existsSync(scenarioFile)) {
    console.log(`\n[${domain}] Scenario file not found: ${scenarioFile}`);
    continue;
  }

  console.log(`\n[${domain}] Processing ${responses.length} captured responses`);
  
  const scenarioData = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'));
  let updatedCount = 0;
  let skippedCount = 0;

  // Update each scenario with assertions from captured response
  for (const scenario of scenarioData.scenarios) {
    const capturedResponse = responses.find(r => r.scenarioId === scenario.id);
    
    if (!capturedResponse) {
      console.log(`  - ${scenario.id}: No captured response found (skipped)`);
      skippedCount++;
      continue;
    }

    // Use suggested assertions from consolidator
    const suggested = capturedResponse.suggestedAssertions;
    
    // Build assertions object
    const assertions: any = {
      status: suggested.status,
      responseTime: suggested.responseTime,
      bodyNotEmpty: suggested.bodyNotEmpty
    };

    // Add required fields if present
    if (suggested.requiredFields && suggested.requiredFields.length > 0) {
      assertions.requiredFields = suggested.requiredFields;
    }

    // Add field values if present
    if (suggested.fieldValues && Object.keys(suggested.fieldValues).length > 0) {
      assertions.fieldValues = suggested.fieldValues;
    }

    // Add array fields if present
    if (suggested.arrayFields && suggested.arrayFields.length > 0) {
      assertions.arrayFields = suggested.arrayFields;
    }

    // Add array min length if present
    if (suggested.arrayMinLength && Object.keys(suggested.arrayMinLength).length > 0) {
      assertions.arrayMinLength = suggested.arrayMinLength;
    }

    // Add body contains for negative scenarios
    if (suggested.bodyContains && suggested.bodyContains.length > 0) {
      assertions.bodyContains = suggested.bodyContains;
    }

    // Update scenario
    scenario.assertions = assertions;
    updatedCount++;
    console.log(`  ✓ ${scenario.id}: Updated with ${Object.keys(assertions).length} assertion types`);
  }

  // Save updated scenario file
  fs.writeFileSync(scenarioFile, JSON.stringify(scenarioData, null, 2), 'utf8');
  console.log(`[${domain}] Saved: ${updatedCount} updated, ${skippedCount} skipped`);
}

console.log('\n✅ Scenario files updated successfully!');
console.log('\nNext steps:');
console.log('1. Review the updated scenario files in data/scenarios/');
console.log('2. Run tests to verify assertions work correctly');
console.log('3. The master-reference-responses.json file is now a reference artifact');
