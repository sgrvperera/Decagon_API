import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Complaint/SS-DIA-Complaint-Lodge-Insert - v1.0.0.json'),
  'Complaint Handling - Dialog API Tests'
);
