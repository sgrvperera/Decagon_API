import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// DTV Package Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/DTV package change/activate package/SS-DIA-DTV-Pack-Act-Activation-Insert - V1.0.0.json'),
  'DTV Package Activation - Dialog API Tests'
);

// DTV Package Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/DTV package change/check eligibility to activate package/SS-DIA-DTV-Pack-Act-Eligibility-Query - V1.0.0.json'),
  'DTV Package Eligibility - Dialog API Tests'
);

// DTV Get Packages
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/Package change/DTV package change/Get dtv packages/SS-DIA-Get-Dtv-Packages-Query - v1.0.0.json'),
  'DTV Get Packages - Dialog API Tests'
);
