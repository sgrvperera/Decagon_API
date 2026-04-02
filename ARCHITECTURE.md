# Dialog API Testing Framework - Architecture

**Technical architecture and design patterns**

---

## Overview

The Dialog API Testing Framework is built on a **scenario-driven architecture** that separates test data from test execution logic, enabling maintainable, scalable, and reusable API test automation.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Test Execution Layer                     │
│  Playwright Test Runner → Test Specs → Scenario Runner      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Scenario Processing Layer                   │
│  Scenario Loader → Number Resolver → Data Interpolator      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Communication Layer                    │
│  API Client → Request Builder → Response Capture            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Validation Layer                        │
│  Assertion Executor → JSON Schema Validator → Reporter      │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Test Execution Layer

#### Playwright Test Runner
- Industry-standard test runner
- Parallel execution support
- Built-in retry mechanism
- HTML reporting with traces

#### Test Specs (`tests/e2e/*.spec.ts`)
- Minimal boilerplate code
- Simply call `createScenarioSuite()` with JSON path
- No test logic - all in scenarios

```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/Decagon_API/NPS/SS-DIA-NPS-Eligibility-Query - v1.0.0.json'),
  'NPS Survey - Dialog API Tests'
);
```

#### Scenario Runner (`src/helpers/scenario-runner.ts`)
- Generic test execution engine
- Loads scenarios from JSON
- Resolves test numbers
- Interpolates placeholders
- Executes API calls
- Runs assertions

**Key Functions:**
- `createScenarioSuite()` - Creates Playwright test suite from JSON
- `findScenarioFiles()` - Recursively finds scenario files
- `loadScenarioFile()` - Loads and parses scenario JSON
- `interpolate()` - Replaces placeholders with actual values

---

### 2. Scenario Processing Layer

#### Scenario Loader
- Reads JSON scenario files
- Validates scenario structure
- Supports hierarchical organization
- Handles metadata

**Scenario Structure:**
```json
{
  "metadata": {
    "mainWorkflow": "NPS",
    "subWorkflow": "NPS",
    "apiCommonName": "NPS Survey",
    "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0"
  },
  "mifeApi": "SS-DIA-NPS-Eligibility-Query - v1.0.0",
  "scenarios": [...]
}
```

#### Number Resolver (`src/helpers/number-resolver.ts`)
- Resolves test numbers based on API context
- Maps API operations to test numbers
- Supports fallback mechanism
- Handles multiple service types

**Resolution Flow:**
```
numberResolution config → service-number-mapping.json → test-numbers.json → Resolved number
```

**Key Functions:**
- `resolve()` - Resolves test number for scenario
- `getNumberPath()` - Gets path from mapping
- `getNumberFromPath()` - Extracts number from test data

#### Data Interpolator
- Replaces placeholders in scenarios
- Supports `{{number}}`, `{{traceId}}`, `{{packages.*}}`
- Generates dynamic trace IDs
- Handles nested object interpolation

---

### 3. API Communication Layer

#### API Client (`src/api/client/api-client.ts`)
- HTTP client wrapper around Playwright's APIRequestContext
- Supports GET, POST, PUT, DELETE methods
- Automatic retry on failure
- Response capture integration
- Mock mode support

**Key Features:**
- Configurable timeout
- Automatic retry with exponential backoff
- Request/response logging
- Error handling

**Methods:**
- `create()` - Factory method to create client
- `get()`, `post()`, `put()`, `delete()` - HTTP methods
- `executeWithRetry()` - Retry logic
- `dispose()` - Cleanup

#### Request Builder (`src/api/client/request-builder.ts`)
- Builds HTTP requests
- Manages headers
- Constructs query strings
- Handles request options

**Key Functions:**
- `buildHeaders()` - Merges default and custom headers
- `buildQueryString()` - Constructs URL query parameters
- `buildUrl()` - Combines path and query string

#### Response Capture (`src/helpers/response-capture.ts`)
- Optional response capture for debugging
- Controlled by `CAPTURE_API_RESPONSES` flag
- Saves requests and responses
- Creates consolidated reference file

**Captured Data:**
- Request: method, endpoint, headers, body, queryParams
- Response: status, headers, body, duration
- Metadata: domain, scenarioId, scenarioName, mifeApi, timestamp

**Key Functions:**
- `capture()` - Captures API call
- `saveCapture()` - Saves to file
- `updateConsolidatedReference()` - Updates reference file

---

### 4. Validation Layer

#### Assertion Executor (`src/helpers/assertion-executor.ts`)
- Executes all assertion types
- Uses AJV for JSON Schema validation
- Provides detailed error messages
- Supports nested field access

**Supported Assertions:**
1. **status** - HTTP status code validation
2. **responseTime** - Response time validation
3. **bodyNotEmpty** - Body presence check
4. **requiredFields** - Field existence validation
5. **fieldValues** - Exact value matching
6. **fieldMatches** - Regex pattern matching
7. **bodyContains** - Substring search
8. **arrayFields** - Array type validation
9. **arrayMinLength** - Array length validation
10. **jsonSchema** - JSON Schema validation (AJV)

**Key Functions:**
- `execute()` - Main assertion execution
- `assertStatus()` - Status code validation
- `assertResponseTime()` - Time validation
- `assertRequiredFields()` - Field presence
- `assertFieldValues()` - Value matching
- `assertJsonSchema()` - Schema validation with AJV
- `getNestedValue()` - Nested field access

#### JSON Schema Validator
- Uses AJV (Another JSON Schema Validator)
- Industry-standard JSON Schema Draft 7
- Comprehensive validation
- Detailed error reporting

**Schema Example:**
```json
{
  "type": "object",
  "properties": {
    "executionStatus": { "type": "string" },
    "responseData": {
      "type": "object",
      "properties": {
        "eligible": { "type": "boolean" }
      },
      "required": ["eligible"]
    }
  },
  "required": ["executionStatus", "responseData"]
}
```

---

## Design Patterns

### 1. Scenario-Driven Testing
- Test scenarios defined in JSON
- Separation of test data and test logic
- Easy to maintain and extend
- Non-technical users can create scenarios

### 2. Data-Driven Testing
- Test data externalized
- Multiple scenarios from single template
- Easy to add new test cases
- Supports data variations

### 3. Page Object Model (Adapted for APIs)
- API client as abstraction layer
- Request builder for request construction
- Assertion executor for validation
- Clean separation of concerns

### 4. Factory Pattern
- `ApiClient.create()` - Creates API client instances
- `createScenarioSuite()` - Creates test suites
- Centralized object creation

### 5. Strategy Pattern
- Different assertion strategies
- Pluggable validation logic
- Easy to add new assertion types

### 6. Singleton Pattern
- `responseCapture` - Single instance
- `assertionExecutor` - Single instance
- `numberResolver` - Single instance

---

## Data Flow

### Test Execution Flow

```
1. Playwright Test Runner starts
   ↓
2. Test spec calls createScenarioSuite()
   ↓
3. Scenario Runner loads JSON file
   ↓
4. For each scenario:
   a. Resolve test number (if needed)
   b. Interpolate placeholders
   c. Build HTTP request
   d. Execute API call (with retry)
   e. Capture response (if enabled)
   f. Execute assertions
   g. Report results
   ↓
5. Generate HTML report
```

### Number Resolution Flow

```
1. Scenario defines numberResolution config
   ↓
2. Number Resolver reads config
   ↓
3. Looks up mapping in service-number-mapping.json
   ↓
4. Extracts path (e.g., "postpaid.active[0]")
   ↓
5. Reads test-numbers.json
   ↓
6. Navigates to path
   ↓
7. Returns resolved number
   ↓
8. Number replaces {{number}} in scenario
```

### Response Capture Flow

```
1. CAPTURE_API_RESPONSES=true in config
   ↓
2. Test executes API call
   ↓
3. Response Capture intercepts
   ↓
4. Captures request and response
   ↓
5. Saves to session directory
   ↓
6. Updates consolidated-reference.json
   ↓
7. Test continues normally
```

### Assertion Generation Flow

```
1. Run tests with CAPTURE_API_RESPONSES=true
   ↓
2. Responses saved to consolidated-reference.json
   ↓
3. Run derive-assertions.ts script
   ↓
4. Script reads captured responses
   ↓
5. For each response:
   a. Analyze structure
   b. Generate assertions
   c. Generate JSON Schema
   d. Find matching scenario
   e. Update scenario JSON
   ↓
6. Scenarios now have assertions
```

---

## Configuration Management

### Environment Configuration

**File:** `config/environments/dev.env`

```ini
BASE_URL=https://chatbot.dialog.lk
TRACE_ID=DEV_TRACE_0001
API_TIMEOUT=15000
RETRIES=1
CAPTURE_API_RESPONSES=false
```

**Loaded by:** `config/test-config.ts`

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, `environments/${env}.env`) });

export const config = {
  baseURL: process.env.BASE_URL || 'https://chatbot.dialog.lk',
  traceId: process.env.TRACE_ID || 'AUTO_TEST_TRACE',
  timeout: parseInt(process.env.API_TIMEOUT || '15000'),
  retries: parseInt(process.env.RETRIES || '1'),
  mockMode: process.env.MOCK_API === 'true',
  env: env
};
```

### Test Data Configuration

**Test Numbers:** `data/test-data/test-numbers.json`
- Organized by connection type (postpaid/prepaid)
- Categorized by status (active/inactive)
- Includes metadata (serviceType, notes)

**Number Mapping:** `data/test-data/service-number-mapping.json`
- Maps API operations to test number paths
- Supports multiple service types
- Enables flexible number resolution

**Package Data:** `data/test-data/packages.json`
- Package codes for different services
- Used in package change scenarios
- Supports placeholder interpolation

---

## Extensibility

### Adding New Assertion Types

1. Add to `ScenarioAssertions` interface:
```typescript
export interface ScenarioAssertions {
  // ... existing
  customAssertion?: any;
}
```

2. Implement in `AssertionExecutor`:
```typescript
if (assertions.customAssertion) {
  await this.assertCustom(response, assertions.customAssertion);
}

private async assertCustom(response: APIResponse, config: any): Promise<void> {
  // Implementation
}
```

### Adding New Placeholder Types

Update `interpolate()` function in `scenario-runner.ts`:

```typescript
.replace(/\{\{newPlaceholder\}\}/g, () => {
  return generateNewValue();
})
```

### Adding New Test Domains

1. Create scenario JSON in `data/Decagon_API/NewDomain/`
2. Create test spec in `tests/e2e/new-domain.spec.ts`
3. Add number mapping (if needed)
4. Run tests

---

## Performance Considerations

### Parallel Execution
- Playwright supports parallel test execution
- Configure workers in `playwright.config.ts`
- Each worker gets own API client instance

### Retry Mechanism
- Automatic retry on transient failures
- Configurable retry count
- Exponential backoff

### Response Caching
- Not implemented (stateless API testing)
- Each test is independent
- No shared state between tests

### Resource Management
- API clients properly disposed after tests
- File handles closed after capture
- Memory-efficient JSON parsing

---

## Security Considerations

### Credentials Management
- No hardcoded credentials
- Environment variables for sensitive data
- `.env` file in `.gitignore`

### Test Data Isolation
- Test numbers separate from production
- Dedicated test environment
- No impact on production data

### API Security
- HTTPS only
- Trace IDs for request tracking
- No sensitive data in logs

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E API Tests (This Framework)
      /____\
     /      \    Integration Tests
    /________\
   /          \  Unit Tests
  /__________\
```

This framework focuses on **E2E API Testing**:
- Tests complete API workflows
- Validates end-to-end scenarios
- Ensures API contract compliance

### Test Types

1. **Smoke Tests** (`@smoke`)
   - Critical path validation
   - Quick feedback
   - Run on every commit

2. **Regression Tests** (`@regression`)
   - Comprehensive coverage
   - All scenarios
   - Run before release

3. **Negative Tests** (`@negative`)
   - Error handling
   - Invalid inputs
   - Edge cases

---

## Monitoring & Reporting

### Test Reports
- HTML reports with Playwright
- Detailed test results
- Screenshots and traces
- Network logs

### CI/CD Integration
- GitHub Actions workflow
- Automatic test execution
- Report artifacts
- Failure notifications

### Metrics
- Test execution time
- Pass/fail rates
- Response times
- Coverage metrics

---

## Future Enhancements

### Planned Features
- [ ] Performance testing integration
- [ ] Contract testing support
- [ ] Real-time dashboard
- [ ] Advanced reporting
- [ ] Test data generation
- [ ] API mocking server
- [ ] Load testing capabilities

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Test Runner | Playwright Test | 1.58.2 |
| Language | TypeScript | 5.0.0 |
| Runtime | Node.js | 18/20 LTS |
| Schema Validator | AJV | 8.18.0 |
| CI/CD | GitHub Actions | Latest |

---

## Conclusion

The Dialog API Testing Framework provides a robust, maintainable, and scalable solution for API test automation. Its scenario-driven architecture, comprehensive assertion capabilities, and automated assertion generation make it an efficient tool for ensuring API quality.

**Key Strengths:**
- ✅ Separation of concerns
- ✅ Easy to maintain
- ✅ Highly extensible
- ✅ Type-safe
- ✅ CI/CD ready
- ✅ Comprehensive validation

---

**Version**: 2.0.0 | **Last Updated**: 2026-04-02
