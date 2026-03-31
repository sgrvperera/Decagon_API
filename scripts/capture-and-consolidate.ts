#!/usr/bin/env ts-node
/**
 * Capture and Consolidate Workflow Script
 * 
 * This script helps automate the response capture workflow:
 * 1. Runs tests with CAPTURE_API_RESPONSES=true
 * 2. Consolidates captured responses into reference file
 * 3. Provides guidance on updating scenario assertions
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { responseConsolidator } from '../src/helpers/response-consolidator';
import * as path from 'path';

const execAsync = promisify(exec);

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'capture':
      await captureResponses(args[1]);
      break;
    case 'consolidate':
      await consolidateResponses();
      break;
    case 'full':
      await fullWorkflow(args[1]);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

async function captureResponses(tag?: string) {
  console.log('\n=== PHASE 1: Capturing API Responses ===\n');
  
  const testCommand = tag 
    ? `set CAPTURE_API_RESPONSES=true && set TEST_TAG=${tag} && npx playwright test tests/e2e`
    : `set CAPTURE_API_RESPONSES=true && npx playwright test tests/e2e`;
  
  console.log(`Running: ${testCommand}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(testCommand, { 
      shell: 'cmd.exe',
      maxBuffer: 10 * 1024 * 1024 
    });
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('\n✓ Response capture complete\n');
  } catch (error: any) {
    console.error('Error during test execution:', error.message);
    console.log('\nNote: Some test failures are expected. Continuing to consolidation...\n');
  }
}

async function consolidateResponses() {
  console.log('\n=== PHASE 2: Consolidating Responses ===\n');
  
  const latestSession = responseConsolidator.findLatestSession();
  
  if (!latestSession) {
    console.error('❌ No captured sessions found.');
    console.log('Run: npm run capture:responses first\n');
    return;
  }
  
  console.log(`Found session: ${latestSession}\n`);
  
  const referenceFile = responseConsolidator.consolidateSession(latestSession);
  
  console.log('\n✓ Consolidation complete');
  console.log(`\nReference file: ${path.join(latestSession, 'reference-responses.json')}`);
  console.log(`Total responses: ${referenceFile.totalResponses}`);
  console.log(`Domains: ${referenceFile.domains.join(', ')}\n`);
  
  console.log('=== NEXT STEPS ===\n');
  console.log('1. Review the reference-responses.json file');
  console.log('2. Check suggestedAssertions for each scenario');
  console.log('3. Update scenario JSON files in data/scenarios/');
  console.log('4. Run tests normally (without CAPTURE flag) to verify\n');
}

async function fullWorkflow(tag?: string) {
  await captureResponses(tag);
  await consolidateResponses();
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Response Capture & Consolidation Workflow                     ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  npx ts-node scripts/capture-and-consolidate.ts <command> [options]

COMMANDS:
  capture [tag]     Run tests with response capture enabled
                    Optional: specify tag (e.g., @smoke, @gsm)
  
  consolidate       Consolidate latest captured responses into
                    reference file with suggested assertions
  
  full [tag]        Run both capture and consolidate in sequence
  
  help              Show this help message

EXAMPLES:
  # Capture all test responses
  npx ts-node scripts/capture-and-consolidate.ts capture

  # Capture only smoke tests
  npx ts-node scripts/capture-and-consolidate.ts capture @smoke

  # Consolidate latest captures
  npx ts-node scripts/capture-and-consolidate.ts consolidate

  # Full workflow (capture + consolidate)
  npx ts-node scripts/capture-and-consolidate.ts full

WORKFLOW:
  1. Run 'capture' to execute tests and save responses
  2. Run 'consolidate' to generate reference file
  3. Review reference-responses.json for suggested assertions
  4. Update scenario JSON files with proper assertions
  5. Run tests normally to verify assertions work

OUTPUT LOCATION:
  test-results/api-captures/YYYY-MM-DD/session-*/reference-responses.json

`);
}

main().catch(console.error);
