import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with GSM scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/gsm-packages.json'),
  'GSM Packages - Dialog API Tests'
);
