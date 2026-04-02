import * as fs from 'fs';
import * as path from 'path';

interface CapturedResponse {
  domain: string;
  scenarioId: string;
  scenarioName: string;
  mifeApi: string;
  request: any;
  response: {
    status: number;
    body: any;
  };
  duration: number;
}

interface ConsolidatedReference {
  captures: CapturedResponse[];
}

function generateJsonSchema(body: any): any {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const schema: any = {
    type: 'object',
    properties: {},
    required: []
  };

  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) {
      continue;
    }

    schema.required.push(key);

    if (typeof value === 'string') {
      schema.properties[key] = { type: 'string' };
    } else if (typeof value === 'number') {
      schema.properties[key] = { type: 'number' };
    } else if (typeof value === 'boolean') {
      schema.properties[key] = { type: 'boolean' };
    } else if (Array.isArray(value)) {
      schema.properties[key] = { type: 'array' };
      if (value.length > 0 && typeof value[0] === 'object') {
        schema.properties[key].items = generateJsonSchema(value[0]);
      }
    } else if (typeof value === 'object') {
      schema.properties[key] = generateJsonSchema(value);
    }
  }

  return schema;
}

function deriveAssertions(capture: CapturedResponse): any {
  const assertions: any = {
    status: capture.response.status,
    responseTime: Math.max(capture.duration + 1000, 3000),
    bodyNotEmpty: true
  };

  const body = capture.response.body;
  
  if (body && typeof body === 'object') {
    const requiredFields: string[] = [];
    const fieldValues: Record<string, any> = {};
    
    // Check for common fields
    if ('executionStatus' in body) {
      requiredFields.push('executionStatus');
      fieldValues['executionStatus'] = body.executionStatus;
    }
    
    if ('executionMessage' in body) {
      requiredFields.push('executionMessage');
      fieldValues['executionMessage'] = body.executionMessage;
    }
    
    if ('responseData' in body) {
      requiredFields.push('responseData');
    }
    
    if (requiredFields.length > 0) {
      assertions.requiredFields = requiredFields;
    }
    
    if (Object.keys(fieldValues).length > 0) {
      assertions.fieldValues = fieldValues;
    }

    // Generate JSON schema for comprehensive validation
    const jsonSchema = generateJsonSchema(body);
    if (jsonSchema && jsonSchema.properties && Object.keys(jsonSchema.properties).length > 0) {
      assertions.jsonSchema = jsonSchema;
    }
  }
  
  return assertions;
}

function findScenarioFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findScenarioFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function updateScenarioFile(filePath: string, capturesByScenarioId: Map<string, CapturedResponse>) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  if (!data.scenarios || !Array.isArray(data.scenarios)) {
    return false;
  }
  
  let updated = false;
  
  for (const scenario of data.scenarios) {
    const capture = capturesByScenarioId.get(scenario.id);
    
    if (capture) {
      const derivedAssertions = deriveAssertions(capture);
      scenario.assertions = derivedAssertions;
      updated = true;
      console.log(`  ✓ Updated assertions for scenario: ${scenario.id}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  }
  
  return false;
}

async function main() {
  console.log('='.repeat(80));
  console.log('PHASE 2: Derive Assertions from Captured Responses');
  console.log('='.repeat(80));
  console.log('');
  
  // Read consolidated reference
  const referencePath = path.join(process.cwd(), 'test-results', 'api-captures', 'consolidated-reference.json');
  
  if (!fs.existsSync(referencePath)) {
    console.error('❌ Error: consolidated-reference.json not found');
    console.error('   Please run tests with CAPTURE_API_RESPONSES=true first');
    process.exit(1);
  }
  
  console.log(`📖 Reading captured responses from: ${referencePath}`);
  const reference: ConsolidatedReference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
  console.log(`   Found ${reference.captures.length} captured responses`);
  console.log('');
  
  // Create map of scenarioId -> capture
  const capturesByScenarioId = new Map<string, CapturedResponse>();
  for (const capture of reference.captures) {
    capturesByScenarioId.set(capture.scenarioId, capture);
  }
  
  // Find all scenario JSON files
  const decagonApiDir = path.join(process.cwd(), 'data', 'Decagon_API');
  console.log(`🔍 Searching for scenario files in: ${decagonApiDir}`);
  const scenarioFiles = findScenarioFiles(decagonApiDir);
  console.log(`   Found ${scenarioFiles.length} scenario files`);
  console.log('');
  
  // Update each scenario file
  console.log('📝 Updating scenario files with derived assertions...');
  console.log('');
  
  let filesUpdated = 0;
  let scenariosUpdated = 0;
  
  for (const filePath of scenarioFiles) {
    const relativePath = path.relative(decagonApiDir, filePath);
    console.log(`Processing: ${relativePath}`);
    
    const wasUpdated = updateScenarioFile(filePath, capturesByScenarioId);
    
    if (wasUpdated) {
      filesUpdated++;
    } else {
      console.log(`  ⊘ No matching captures found`);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('✅ PHASE 2 COMPLETE');
  console.log('='.repeat(80));
  console.log(`Files updated: ${filesUpdated}/${scenarioFiles.length}`);
  console.log(`Scenarios updated: ${capturesByScenarioId.size}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review the updated scenario files');
  console.log('  2. Run tests to verify assertions work correctly');
  console.log('  3. Disable CAPTURE_API_RESPONSES flag for normal test runs');
  console.log('');
}

main().catch(console.error);
