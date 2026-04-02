import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

// DTV Channel Activation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV channel activation - deactivation/DTV channel activation/activate channel/SS-DIA-Activate-Channel - v1.0.0.json'),
  'DTV Channel Activation - Dialog API Tests'
);

// DTV Channel Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV channel activation - deactivation/DTV channel activation/check eligibility to activate channel/SS-DIA-DTV-Channel-Act-Eligibility-Query - v1.0.0.json'),
  'DTV Channel Activation Eligibility - Dialog API Tests'
);

// DTV Get Channel List
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV channel activation - deactivation/DTV channel activation/get DTV channel list/SS-DIA-DTV-Get-Channel-List-Query - v1.0.0.json'),
  'DTV Get Channel List - Dialog API Tests'
);

// DTV Channel Deactivation Eligibility
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV channel activation - deactivation/DTV channel De-activation/check eligibility to disconnect channel/SS-DIA-DTV-Channel-Deact-Eligibility-Query - v1.0.0.json'),
  'DTV Channel Deactivation Eligibility - Dialog API Tests'
);

// DTV Channel Deactivation
createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/DTV channel activation - deactivation/DTV channel De-activation/disconnect channel/SS-DIA-DTV-Channel-Deactivation-Insert - v1.0.0.json'),
  'DTV Channel Deactivation - Dialog API Tests'
);
