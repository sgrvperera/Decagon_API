import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with MBB scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/mbb-packages.json'),
  'MBB Packages - Dialog API Tests'
);
