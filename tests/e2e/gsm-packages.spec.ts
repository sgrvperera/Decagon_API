import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with GSM scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/mob package change/Get mobile packages/SS-DIA-Get-Gsm-Packages-Query - v1.0.0.json'),
  'GSM Packages - Dialog API Tests'
);
