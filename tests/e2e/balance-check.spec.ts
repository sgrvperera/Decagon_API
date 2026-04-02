import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// Use generic scenario runner with Balance Check scenarios
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Balance and Bill Check/Balance check/send balance bill infor endpoint/SS-DIA-Balance-Check-Query - v1.0.0.json'),
  'Balance Check - Dialog API Tests'
);
