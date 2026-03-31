# Dialog API Testing Framework - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [Technology Stack](#technology-stack)
8. [Directory Structure](#directory-structure)
9. [Component Details](#component-details)
10. [Extension Points](#extension-points)

---

## Overview

The Dialog API Testing Framework is an **enterprise-grade, scenario-driven API automation framework** built with Playwright Test and TypeScript. It provides a scalable, maintainable approach to testing Dialog Axiata's REST APIs across multiple service domains (GSM, HBB, MBB, DTV).

### Key Characteristics

- **Scenario-Driven**: Test scenarios defined in JSON, separated from test execution code
- **Data-Driven**: Test data managed centrally with intelligent resolution
- **Assertion-Driven**: Assertions defined declaratively in scenario files
- **Domain-Oriented**: Organized by business domains (packages, addons, channels)
- **Tag-Based**: Selective test execution using tags (@smoke, @regression, @negative)
- **Response Capture**: Optional API response capture for analysis and assertion generation

### Design Goals

1. **Separation of Concerns**: Test data, scenarios, and execution logic are independent
2. **Maintainability**: Changes to API contracts require minimal code updates
3. **Scalability**: Easy to add new domains, scenarios, and assertions
4. **Reusability**: Generic components work across all domains
5. **Observability**: Comprehensive logging and response capture capabilities

---

## Architecture Principles

### 1. Scenario-Driven Testing

Instead of writing individual test functions for each API call, scenarios are defined in JSON files:

```
Scenario JSON → Generic Runner → API Client → Assertion Executor
```

**Benefits:**
- Non-developers can create/modify test scenarios
- Consistent test structure across all domains
- Easy to maintain and version control
- Scenarios can be generated from API specifications

### 2. Data Abstraction

Test data is abstracted through a resolution layer:

```
Scenario Request → Number Resolver → Service Mapping → Test Number Registry → Actual Number
```

**Benefits:**
- Test numbers managed centrally
- Automatic selection based on context (domain, operation, connection type)
- Easy to update test data without touching scenarios
- Support for positive and negative test data

### 3. Declarative Assertions

Assertions are declared in scenario JSON, not coded:

```json
{
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "requiredFields": ["executionStatus"],
    "fieldValues": {"executionStatus": "00"}
  }
}
```

**Benefits:**
- Assertions live with scenarios
- Easy to update expected values
- Consistent assertion execution
- Support for multiple assertion types

### 4. Generic Test Runner

One generic runner handles all domains:

```typescript
createScenarioSuite(scenarioFilePath, suiteName)
```

**Benefits:**
- No duplicate test code
- Consistent behavior across domains
- Easy to add new domains (just add scenario JSON)
- Centralized improvements benefit all tests

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Test Execution Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Playwright   │  │ Test Specs   │  │ Scenario     │      │
│  │ Test Runner  │→ │ (*.spec.ts)  │→ │ Runner       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Scenario Processing Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Scenario     │  │ Number       │  │ Data         │      │
│  │ Loader       │  │ Resolver     │  │ Interpolator │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Communication Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API Client   │  │ Request      │  │ Response     │      │
│  │              │→ │ Builder      │→ │ Capture      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Validation Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Assertion    │  │ Response     │  │ Test         │      │
│  │ Executor     │  │ Validator    │  │ Reporter     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Scenario     │  │ Test Number  │  │ Service      │      │
│  │ JSON Files   │  │ Registry     │  │ Mapping      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
1. Test Spec loads Scenario JSON
2. Scenario Runner processes each scenario
3. Number Resolver gets test number (if needed)
4. Data Interpolator replaces placeholders
5. Request Builder constructs HTTP request
6. API Client executes request with retry logic
7. Response Capture saves request/response (optional)
8. Assertion Executor validates response
9. Test Reporter generates results
```

---

## Core Components

### 1. Scenario Runner (`src/helpers/scenario-runner.ts`)

**Purpose**: Generic test execution engine that processes scenario JSON files

**Responsibilities**:
- Load scenario JSON files
- Filter scenarios by tags
- Resolve test numbers
- Interpolate data placeholders
- Execute API requests
- Trigger assertion validation
- Handle test lifecycle

**Key Functions**:
```typescript
createScenarioSuite(scenarioFilePath: string, suiteName?: string)
```

**Input**: Scenario JSON file path
**Output**: Playwright test suite with all scenarios

### 2. API Client (`src/api/client/api-client.ts`)

**Purpose**: HTTP client wrapper with retry logic and response capture

**Responsibilities**:
- Create Playwright API request context
- Execute GET, POST, PUT, DELETE requests
- Implement retry logic for transient failures
- Capture requests/responses when enabled
- Support mock mode for offline testing
- Log all API interactions

**Key Features**:
- Automatic retry on failure (configurable)
- Response capture integration
- Mock mode support
- Timeout configuration
- HTTPS error handling

**Methods**:
```typescript
static async create(baseURL?: string): Promise<ApiClient>
async get(path: string, options: RequestOptions): Promise<APIResponse>
async post(path: string, options: RequestOptions): Promise<APIResponse>
async put(path: string, options: RequestOptions): Promise<APIResponse>
async delete(path: string, options: RequestOptions): Promise<APIResponse>
async dispose(): Promise<void>
```

### 3. Request Builder (`src/api/client/request-builder.ts`)

**Purpose**: Construct HTTP requests with headers and query parameters

**Responsibilities**:
- Build request headers (including traceId)
- Construct query strings
- Build complete URLs
- Merge custom headers with defaults

**Key Methods**:
```typescript
buildHeaders(options: RequestOptions): Record<string, string>
buildQueryString(params?: Record<string, any>): string
buildUrl(path: string, queryParams?: Record<string, any>): string
```

### 4. Number Resolver (`src/helpers/number-resolver.ts`)

**Purpose**: Intelligent test number resolution based on API context

**Responsibilities**:
- Resolve test numbers from registry
- Map API domains to service types
- Handle positive and negative scenarios
- Provide fallback numbers
- Support multiple resolution strategies

**Resolution Logic**:
```
API Domain + Operation + Connection Type + Service Type + Scenario Type
                          ↓
              Service Number Mapping
                          ↓
              Test Number Registry
                          ↓
                  Resolved Number
```

**Key Methods**:
```typescript
resolve(request: NumberResolutionRequest): NumberResolutionResult
resolveForEligibility(apiDomain, connectionType, serviceType)
resolveForActivation(apiDomain, connectionType, serviceType)
resolveForGetPackages(apiDomain, connectionType, serviceType)
resolveInvalidNumber(): NumberResolutionResult
resolveInactiveNumber(serviceType, connectionType): NumberResolutionResult
```

### 5. Assertion Executor (`src/helpers/assertion-executor.ts`)

**Purpose**: Execute declarative assertions from scenario JSON

**Responsibilities**:
- Parse assertion definitions
- Execute multiple assertion types
- Provide detailed error messages
- Support nested field validation
- Handle array validations

**Supported Assertion Types**:

| Type | Description | Example |
|------|-------------|---------|
| `status` | HTTP status code | `200` or `[200, 201]` |
| `responseTime` | Max response time (ms) | `3000` |
| `bodyNotEmpty` | Response body not empty | `true` |
| `requiredFields` | Fields must exist | `["executionStatus"]` |
| `fieldValues` | Field exact values | `{"executionStatus": "00"}` |
| `fieldMatches` | Field regex match | `{"id": "^[0-9]+$"}` |
| `bodyContains` | Body contains strings | `["success", "eligible"]` |
| `arrayFields` | Fields are arrays | `["responseData"]` |
| `arrayMinLength` | Array min length | `{"responseData": 1}` |
| `jsonSchema` | JSON schema validation | `{schema object}` |

**Key Method**:
```typescript
async execute(
  response: APIResponse, 
  assertions: ScenarioAssertions, 
  context?: { duration?: number }
): Promise<void>
```

### 6. Response Capture (`src/helpers/response-capture.ts`)

**Purpose**: Capture API requests and responses for analysis

**Responsibilities**:
- Save request/response pairs to disk
- Organize captures by session and date
- Generate suggested assertions
- Support consolidation of multiple sessions

**Capture Structure**:
```json
{
  "domain": "gsm-packages",
  "scenarioId": "gsm-get-packages-postpaid-smoke",
  "scenarioName": "Get GSM Packages - Postpaid (Smoke)",
  "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "request": {
    "method": "GET",
    "endpoint": "/dia-api-engine/api/gsm-package/v1/packages",
    "headers": {...},
    "queryParams": {...}
  },
  "response": {
    "status": 200,
    "headers": {...},
    "body": {...},
    "duration": 1234
  },
  "suggestedAssertions": {...}
}
```

---

## Data Flow

### Test Execution Flow

```
1. Playwright Test Runner starts
   ↓
2. Test Spec (*.spec.ts) calls createScenarioSuite()
   ↓
3. Scenario Runner loads scenario JSON file
   ↓
4. For each scenario:
   a. Check tag filter (TEST_TAG environment variable)
   b. Resolve test number (if numberResolution defined)
   c. Interpolate placeholders ({{number}}, {{traceId}}, etc.)
   d. Build request (headers, body, query params)
   e. Execute API call via API Client
   f. Capture response (if enabled)
   g. Execute assertions
   h. Log results
   ↓
5. Generate test report
```

### Number Resolution Flow

```
Scenario defines numberResolution:
{
  "apiDomain": "gsm-packages",
  "operation": "eligibility",
  "connectionType": "POSTPAID",
  "serviceType": "GSM",
  "scenarioType": "positive"
}
   ↓
Number Resolver looks up in service-number-mapping.json:
{
  "apiToServiceMapping": {
    "gsm-package": {
      "eligibility": {
        "postpaid": "postpaid.active[0]"
      }
    }
  }
}
   ↓
Resolver fetches from test-numbers.json:
{
  "postpaid": {
    "active": [
      {
        "number": "771234567",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE"
      }
    ]
  }
}
   ↓
Returns: "771234567"
```

### Assertion Execution Flow

```
Scenario defines assertions:
{
  "assertions": {
    "status": 200,
    "responseTime": 3000,
    "requiredFields": ["executionStatus", "executionMessage"],
    "fieldValues": {"executionStatus": "00"}
  }
}
   ↓
Assertion Executor processes each type:
1. assertStatus(response, 200)
2. assertResponseTime(duration, 3000)
3. assertRequiredFields(response, ["executionStatus", "executionMessage"])
4. assertFieldValues(response, {"executionStatus": "00"})
   ↓
Each assertion uses Playwright expect():
expect(actual).toBe(expected)
   ↓
Pass/Fail reported to Playwright Test Runner
```

---

## Design Patterns

### 1. Strategy Pattern (Number Resolution)

Different resolution strategies based on context:
- Positive scenario → Active numbers
- Negative scenario → Inactive/invalid numbers
- Different operations → Different number pools

### 2. Builder Pattern (Request Construction)

Request built incrementally:
```typescript
requestBuilder
  .buildHeaders(options)
  .buildQueryString(params)
  .buildUrl(path, queryParams)
```

### 3. Template Method Pattern (Scenario Execution)

Generic execution flow with customizable steps:
```typescript
loadScenario() → resolveNumber() → interpolateData() → 
executeRequest() → captureResponse() → executeAssertions()
```

### 4. Singleton Pattern (Shared Instances)

Single instances for:
- `numberResolver`
- `requestBuilder`
- `assertionExecutor`
- `responseCapture`

### 5. Factory Pattern (API Client Creation)

```typescript
ApiClient.create(baseURL) // Creates configured instance
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Playwright** | ^1.58.2 | API testing framework |
| **TypeScript** | ^5.0.0 | Type-safe development |
| **Node.js** | 18 LTS / 20 LTS | Runtime environment |
| **dotenv** | ^16.0.0 | Environment configuration |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ts-node** | TypeScript execution |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **ajv** | JSON schema validation |

### Testing Features

- **Parallel Execution**: Playwright's built-in parallelization
- **Retry Logic**: Automatic retry on transient failures
- **Mock Mode**: Offline testing without real APIs
- **Response Capture**: Request/response logging
- **HTML Reports**: Rich test reports with traces

---

## Directory Structure

```
Decagon.Api/
├── config/
│   ├── environments/              # Environment-specific configs
│   │   ├── dev.env
│   │   ├── staging.env
│   │   └── prod.env
│   └── test-config.ts             # Central configuration
│
├── data/
│   ├── scenarios/                 # Test scenario definitions
│   │   ├── gsm-packages.json      # GSM package scenarios
│   │   ├── hbb-packages.json      # HBB package scenarios
│   │   ├── hbb-addons.json        # HBB addon scenarios
│   │   ├── mbb-packages.json      # MBB package scenarios
│   │   ├── mbb-addons.json        # MBB addon scenarios
│   │   ├── dtv-packages.json      # DTV package scenarios
│   │   └── dtv-channels.json      # DTV channel scenarios
│   │
│   └── test-data/                 # Test data files
│       ├── service-number-mapping.json  # API → Number mapping
│       ├── test-numbers.json            # Test number registry
│       ├── accounts.json                # Legacy account data
│       └── packages.json                # Package codes
│
├── src/
│   ├── api/
│   │   └── client/
│   │       ├── api-client.ts      # HTTP client with retry
│   │       └── request-builder.ts # Request construction
│   │
│   ├── helpers/
│   │   ├── scenario-runner.ts     # Generic test runner
│   │   ├── assertion-executor.ts  # Assertion engine
│   │   ├── number-resolver.ts     # Test number resolution
│   │   ├── response-capture.ts    # Response capture
│   │   └── response-consolidator.ts # Capture consolidation
│   │
│   └── types/
│       └── test-data.types.ts     # TypeScript type definitions
│
├── tests/
│   └── e2e/                       # End-to-end test specs
│       ├── gsm-packages.spec.ts
│       ├── hbb-packages.spec.ts
│       ├── hbb-addons.spec.ts
│       ├── mbb-packages.spec.ts
│       ├── mbb-addons.spec.ts
│       ├── dtv-packages.spec.ts
│       └── dtv-channels.spec.ts
│
├── scripts/                       # Utility scripts
│   ├── consolidate-all-responses.ts    # Consolidate captures
│   └── update-scenario-assertions.ts   # Update assertions
│
├── test-results/                  # Test execution results
│   └── api-captures/              # Captured responses
│       └── YYYY-MM-DD/
│           ├── session-HH-MM-SS/
│           └── master-reference-responses.json
│
├── playwright-report/             # HTML test reports
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

---

## Component Details

### Scenario JSON Structure

```json
{
  "domain": "gsm-packages",
  "mifeApis": [
    "SS-DIA-Get-Gsm-Packages-Query - v1.0.0"
  ],
  "scenarios": [
    {
      "id": "unique-scenario-id",
      "name": "Human-readable scenario name",
      "mifeApi": "SS-DIA-Get-Gsm-Packages-Query - v1.0.0",
      "tags": ["@smoke", "@regression", "@postpaid"],
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/path",
      "headers": {
        "traceId": "{{traceId}}",
        "Custom-Header": "value"
      },
      "queryParams": {
        "param1": "value1"
      },
      "body": {
        "accountNumber": "{{number}}",
        "field": "value"
      },
      "numberResolution": {
        "apiDomain": "gsm-packages",
        "operation": "eligibility",
        "connectionType": "POSTPAID",
        "serviceType": "GSM",
        "scenarioType": "positive"
      },
      "expectedStatus": 200,
      "assertions": {
        "status": 200,
        "responseTime": 3000,
        "bodyNotEmpty": true,
        "requiredFields": ["field1", "field2"],
        "fieldValues": {"field1": "value1"},
        "arrayFields": ["arrayField"],
        "arrayMinLength": {"arrayField": 1}
      }
    }
  ]
}
```

### Test Number Registry Structure

```json
{
  "postpaid": {
    "active": [
      {
        "number": "771234567",
        "serviceType": "GSM",
        "connectionType": "POSTPAID",
        "status": "ACTIVE",
        "notes": "Primary postpaid test number"
      }
    ],
    "inactive": [...]
  },
  "prepaid": {
    "active": [...],
    "inactive": [...]
  },
  "dtv": {
    "postpaid": {
      "active": [...],
      "inactive": [...]
    }
  },
  "hbb": {...},
  "mbb": {...},
  "invalid": {
    "numbers": [
      {
        "number": "999999999",
        "status": "INVALID",
        "notes": "Invalid number for negative tests"
      }
    ]
  }
}
```

### Service Number Mapping Structure

```json
{
  "apiToServiceMapping": {
    "gsm-package": {
      "eligibility": {
        "postpaid": "postpaid.active[0]",
        "prepaid": "prepaid.active[0]"
      },
      "activation": {
        "postpaid": "postpaid.active[1]",
        "prepaid": "prepaid.active[1]"
      },
      "getPackages": {
        "postpaid": "postpaid.active[0]",
        "prepaid": "prepaid.active[0]"
      }
    },
    "dtv-package": {...},
    "hbb-package": {...},
    "mbb-package": {...}
  },
  "negativeTestMapping": {
    "invalidNumber": "invalid.numbers[0]",
    "inactivePostpaid": "postpaid.inactive[0]",
    "inactivePrepaid": "prepaid.inactive[0]",
    "inactiveDTV": "dtv.postpaid.inactive[0]",
    "inactiveHBB": "hbb.postpaid.inactive[0]",
    "inactiveMBB": "mbb.postpaid.inactive[0]"
  }
}
```

---

## Extension Points

### Adding New Domains

1. Create scenario JSON in `data/scenarios/new-domain.json`
2. Add test numbers to `data/test-data/service-number-mapping.json`
3. Create test spec in `tests/e2e/new-domain.spec.ts`:
```typescript
import { createScenarioSuite } from '../../src/helpers/scenario-runner';
import * as path from 'path';

createScenarioSuite(
  path.join(__dirname, '../../data/scenarios/new-domain.json'),
  'New Domain - Dialog API Tests'
);
```

### Adding New Assertion Types

1. Add assertion type to `ScenarioAssertions` interface
2. Implement assertion method in `AssertionExecutor`
3. Call method in `execute()` function
4. Use in scenario JSON files

Example:
```typescript
// In assertion-executor.ts
private async assertCustom(response: APIResponse, expected: any): Promise<void> {
  // Implementation
}

// In execute() method
if (assertions.custom) {
  await this.assertCustom(response, assertions.custom);
}
```

### Adding New Resolution Strategies

1. Add strategy to `NumberResolver` class
2. Update `service-number-mapping.json` if needed
3. Use in scenario `numberResolution` block

### Adding New Interpolation Placeholders

1. Update interpolation logic in `scenario-runner.ts`
2. Add data source if needed
3. Use in scenario JSON: `{{newPlaceholder}}`

---

## Performance Considerations

### Parallel Execution

Playwright runs tests in parallel by default:
```typescript
// playwright.config.ts
workers: process.env.CI ? 4 : 8
```

### Test Isolation

Each test gets its own API client instance:
```typescript
test.beforeAll(async () => {
  client = await ApiClient.create();
});

test.afterAll(async () => {
  await client.dispose();
});
```

### Retry Logic

Automatic retry on transient failures:
```typescript
// config/test-config.ts
retries: parseInt(process.env.RETRIES || '1')
```

### Response Capture Overhead

Response capture adds minimal overhead:
- File I/O is asynchronous
- Only enabled when `CAPTURE_API_RESPONSES=true`
- Captures organized by session to avoid conflicts

---

## Security Considerations

### Sensitive Data

- Test numbers are not production data
- No real customer information in test data
- Credentials managed via environment variables
- `.env` file excluded from version control

### API Access

- TraceId used for request tracking
- HTTPS errors ignored for test environments
- Timeout configured to prevent hanging requests

### Test Data Management

- Test numbers regularly reviewed and updated
- Inactive numbers used for negative tests
- Invalid numbers clearly marked

---

## Monitoring and Observability

### Logging

Console logging at multiple levels:
```
[ApiClient] MOCK mode enabled
[NumberResolver] Resolving number for: {...}
[Test] Resolved number: 771234567 (postpaid.active[0])
[Test] Executing: POST /api/endpoint
[API] POST /api/endpoint -> 200 OK
[scenario-id] Status: 200, Duration: 1234ms
```

### Response Capture

Detailed request/response capture:
- Request method, endpoint, headers, body
- Response status, headers, body, duration
- Suggested assertions based on response
- Organized by date and session

### Test Reports

Playwright HTML reports include:
- Test execution timeline
- Pass/fail status
- Error messages and stack traces
- Request/response traces
- Screenshots (if applicable)

---

## Best Practices

### Scenario Design

1. **One scenario, one behavior**: Each scenario tests one specific API behavior
2. **Descriptive names**: Use clear, descriptive scenario names
3. **Appropriate tags**: Tag scenarios for selective execution
4. **Minimal assertions**: Only assert what's necessary for the scenario
5. **Reusable test data**: Use number resolution instead of hardcoding

### Test Data Management

1. **Centralized numbers**: All test numbers in registry
2. **Clear mapping**: Service mapping clearly documents number usage
3. **Regular updates**: Review and update test numbers periodically
4. **Separate positive/negative**: Different numbers for different scenarios

### Code Organization

1. **Generic components**: Keep components domain-agnostic
2. **Single responsibility**: Each component has one clear purpose
3. **Type safety**: Use TypeScript types throughout
4. **Error handling**: Comprehensive error handling and logging

### Maintenance

1. **Version control**: All changes tracked in Git
2. **Documentation**: Keep documentation up to date
3. **Code reviews**: Review changes before merging
4. **Regular cleanup**: Remove obsolete scenarios and test data

---

## Troubleshooting

### Common Issues

**Issue**: Test number not found
- **Cause**: Missing mapping in service-number-mapping.json
- **Solution**: Add mapping for the API domain and operation

**Issue**: Assertion failures
- **Cause**: API response changed
- **Solution**: Capture new response and update assertions

**Issue**: Connection timeouts
- **Cause**: Network issues or slow API
- **Solution**: Increase timeout in config or check network

**Issue**: Response capture not working
- **Cause**: CAPTURE_API_RESPONSES not set
- **Solution**: Set environment variable to `true`

---

## Future Enhancements

### Planned Features

1. **Schema Validation**: Full JSON schema validation support
2. **Performance Testing**: Response time tracking and reporting
3. **Contract Testing**: API contract validation
4. **Data Generation**: Dynamic test data generation
5. **Parallel Domains**: Run multiple domains in parallel
6. **CI/CD Integration**: Enhanced GitHub Actions workflows
7. **Dashboard**: Real-time test execution dashboard
8. **Notification**: Slack/email notifications on failures

### Extensibility

The framework is designed for easy extension:
- Add new assertion types
- Add new resolution strategies
- Add new interpolation placeholders
- Add new capture formats
- Add new reporting formats

---

## Conclusion

The Dialog API Testing Framework provides a robust, scalable foundation for API testing. Its scenario-driven architecture, intelligent test data management, and comprehensive assertion capabilities make it easy to maintain and extend as the API landscape evolves.

For usage instructions, see [USER_GUIDE.md](USER_GUIDE.md).
For implementation details, see [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md).
