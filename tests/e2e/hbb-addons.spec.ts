import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with HBB Add-ons scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/hbb-addons.json'),
  'HBB Add-ons - Dialog API Tests'
);
