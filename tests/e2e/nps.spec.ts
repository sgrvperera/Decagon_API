import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/NPS/SS-DIA-NPS-Eligibility-Query - v1.0.0.json'),
  'NPS Survey - Dialog API Tests'
);
