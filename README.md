# Playwright API Testing Framework

This **Playwright API Testing Framework** automates API testing by reading API definitions from an Excel file, generating JSON definitions, and running dynamic tests using Playwright Test.  In our project, we built a **data-driven API testing solution** where each row in an Excel sheet (with cURL commands) becomes a Playwright test. This README documents **everything** about the project – from setup and architecture to commands, code files, and rationale – so that any engineer can understand and maintain the framework.

---

## Table of Contents

- [Overview](#overview)  
- [Goals](#goals)  
- [Prerequisites](#prerequisites)  
- [Setup & Installation](#setup--installation)  
- [Project Structure](#project-structure)  
- [Configuration (.env)](#configuration-env)  
- [Generating API Definitions](#generating-api-definitions)  
- [Running API Tests](#running-api-tests)  
- [Playwright Test Design](#playwright-test-design)  
- [CI/CD Workflow](#cicd-workflow)  
- [Troubleshooting](#troubleshooting)  
- [Future Improvements](#future-improvements)  

---

## Overview

We created a robust API testing framework using **Node.js**, **TypeScript**, and **Playwright Test**. The key idea is **data-driven testing**: all API endpoints, methods, headers, and request bodies are defined in an Excel file. A custom parser reads the Excel file and generates a JSON file (`api-definitions.json`) with all API definitions. Then, a Playwright test suite iterates over these definitions and performs HTTP requests. This setup offers:

- **Maintenance simplicity**: Add or modify APIs by editing the Excel, without changing test code.  
- **Scalability**: New APIs can be added just by adding rows.  
- **Professional design**: Separation of concerns (parsing, test generation, API client, config).  
- **Reusability**: Common logic (request sending, logging, retries) is centralized.  

We aim to emulate an **enterprise-grade automation framework**. For example, we use environment variables (`BASE_URL`, `TRACE_ID`) for configuration, unique test names to avoid collisions, and a mock mode (`MOCK_API=true`) to run tests without real servers. Playwright’s `APIRequestContext` is ideal for such API testing – as the documentation notes, “This API is used for Web API testing. You can use it to trigger API endpoints”【10†L103-L111】. 

Below, we explain every part of the project in detail, including folder layout, each key file, and the exact commands used throughout development and CI.

---

## Goals

Before diving into code, it’s important to state our main goals:

1. **Automate API Tests from Excel**: Our APIs (created as cURL commands in Excel) should be executable as Playwright tests without hard-coding each test.  
2. **Maintainability**: By generating JSON and tests dynamically, we avoid repetitive code. This also helps non-developers (QA, analysts) update tests via the Excel.  
3. **Robustness**: Handle platform issues (PowerShell vs. CMD, spaces in filenames), API errors (retry/mock), and CI/CD integration.  
4. **Professional Quality**: Use industry best practices (TypeScript, ESLint, Prettier, Playwright Test), and ensure clear project structure.  

We achieved these by writing utility scripts (`excelParser.ts`, `curlParser.ts`), a centralized API client (`apiClient.ts`), a self-generating test suite, and a CI workflow.

---

## Prerequisites

- **Node.js** – We recommend an LTS version (Node 18 or 20 LTS). This project was developed with **Node 18 LTS** for stability. Using a non-LTS (like Node 25) is possible but not recommended for production.  
- **npm (Node Package Manager)** – Comes with Node.js.  
- **Git** – For version control and GitHub integration.  
- **VS Code or any code editor** – Helpful for editing files.  
- **Playwright CLI** – We install it via npm in the project.  

On Windows, make sure you can run scripts. By default, PowerShell may prevent scripts. We solved this by running PowerShell (as Administrator) and executing:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This allows local scripts to run while requiring downloaded scripts to be signed【17†L100-L108】. (The `RemoteSigned` policy is the default on Windows: it “allows running scripts” from local disk and only requires signatures for downloaded scripts【17†L100-L108】.) After setting this, restart your terminal to avoid the “running scripts is disabled” error.

---

## Setup & Installation

1. **Clone the repository** (or unzip if you got a zip):
   ```bash
   git clone https://github.com/sgrvperera/Decagon_API.git
   cd Decagon_API
   ```

2. **Install dependencies** with npm:
   ```bash
   npm ci
   ```
   This uses the `package-lock.json` to install exact versions. The main dependencies include:
   - `playwright` – for Playwright Test framework and browser interactions.  
   - `typescript`, `ts-node` – to write code in TypeScript and run it without manual compilation.  
   - `xlsx` – to read Excel `.xlsx` files in Node.  
   - `dotenv` – to manage `.env` configuration.  
   - `ajv` – JSON schema validator (installed for future use or if needed).  
   - `eslint`, `prettier` – for code linting and formatting.  
   - `@playwright/test` – Playwright test runner and assertions.  

3. **Install Playwright browsers** (even for API tests, it’s recommended):
   ```bash
   npx playwright install
   ```
   This downloads browser binaries for completeness.

4. **Environment file**: Copy the example `.env` to create your own:
   ```bash
   copy .env.example .env     # (Windows CMD or PowerShell)
   ```
   Then open `.env` and fill in appropriate values (e.g., `BASE_URL`, `TRACE_ID`). We’ll explain configuration below.

5. **Verify Node and npm**:
   ```bash
   node -v   # Should be v18.x.x (LTS)
   npm -v    # npm version, should be compatible (>=6.x)
   ```

6. **Remove spaces in filenames (optional, for safety)**: If your Excel filename has spaces (e.g., `Book 4.xlsx`), we recommend renaming it:
   ```bash
   rename "data\raw\Book 4.xlsx" "Book4.xlsx"
   ```
   Then update any commands or config to use `Book4.xlsx`. This avoids issues in npm scripts that don’t handle spaces easily.

With the environment set up, we can proceed to generate API definitions.

---

## Project Structure

The repository is organized into clear folders and files to separate concerns:

```
Decagon_API/
├── data/
│   ├── raw/
│   │   └── Book 4.xlsx
│   └── generated/
│       └── api-definitions.json
├── src/
│   ├── api/
│   │   └── apiClient.ts
│   └── utils/
│       ├── excelParser.ts
│       └── curlParser.ts
├── tests/
│   └── api/
│       └── packages.spec.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

- **`data/raw/`**: Stores the raw Excel input (`Book 4.xlsx`) with API definitions (common name, service name, cURL, etc.).
- **`data/generated/`**: Contains artifacts generated by our scripts, especially `api-definitions.json` (the parsed API definitions).
- **`src/utils/`**: Utility scripts:
  - `excelParser.ts`: Reads the Excel file and converts it to JSON (with the help of `curlParser.ts`).  
  - `curlParser.ts`: Parses raw cURL strings (from Excel) into structured data (method, URL, headers, body).  
- **`src/api/`**:
  - `apiClient.ts`: A custom HTTP client using Playwright’s `APIRequestContext`. It supports GET/POST/PUT/DELETE methods and a “mock” mode.  
- **`tests/api/`**:
  - `packages.spec.ts`: The Playwright test suite. It reads `api-definitions.json` and creates tests for each API definition.
- **`.github/workflows/ci.yml`**: GitHub Actions workflow for running tests on push/PR.
- **`.env.example`**: Example environment variables file (copy to `.env` to configure).
- **`.eslintrc.js`, `.prettierrc`**: Code linting/formatting configs.
- **`playwright.config.ts`**: Playwright Test configuration (if any; this may set timeouts or reporter settings).
- **`package.json` & `tsconfig.json`**: Project dependencies, scripts, and TypeScript configuration.

Each part is explained in detail below.

---

## Configuration (`.env`)

The framework uses environment variables (via `dotenv`) for flexible configuration. Key variables (in `.env.example`) include:

- `BASE_URL` – The base URL of the API under test (e.g., `https://api.example.com`). If not set, the framework infers it from the first API URL in the definitions.  
- `TRACE_ID` – A custom header value (e.g., a correlation ID) to include in all requests. Often used for tracing requests in logs.  

To configure, copy `.env.example` to `.env` and set values. Example `.env`:
```ini
# Base URL of your API (used as prefix for all paths)
BASE_URL=https://api.example.com

# Optional default Trace ID header
TRACE_ID=MYTRACEID123
```

The code uses `dotenv.config()` (in `packages.spec.ts`) to load these. If you run tests locally, ensure `.env` is present; in CI, you should add secrets via GitHub Actions (e.g., `BASE_URL`, `TRACE_ID`) to avoid storing them in the repo.

---

## Generating API Definitions

Before running tests, we must convert the Excel sheet into `api-definitions.json`. This is done with:

```bash
npm run generate:data
```

This script (in `package.json`) invokes our parser:
```json
"generate:data": "ts-node \"src/utils/excelParser.ts\" \"data/raw/Book 4.xlsx\" \"data/generated/api-definitions.json\""
```
The quoting ensures Windows paths with spaces work.

### What `excelParser.ts` does

- Reads the Excel file (using the [`xlsx`](https://www.npmjs.com/package/xlsx) library). For example, it might call `xlsx.readFile(filePath)` to load the workbook.
- Extracts rows from the first sheet. Each row is expected to have columns like `apiCommonName`, `mifeName`, and `rawCurl` (depending on your Excel structure).
- For each row, it creates an object:
  ```ts
  {
    apiCommonName: string,
    mifeName: string,
    rawCurl: string,
    parsed: { method, url, headers, data } | null
  }
  ```
  - **`apiCommonName`**: a friendly name (e.g., “Get mobile packages”).
  - **`mifeName`**: some API identifier (in our Excel, service or feature name).
  - **`rawCurl`**: the original cURL command string (from Excel cell).
  - **`parsed`**: the result of parsing the raw cURL. This is either an object or `null`.
- To parse `rawCurl`, it calls `curlParser.parseCurlString(rawCurl)` (our custom function).
  - `curlParser` handles different curl command formats (e.g., with `-X`, `--data`, headers). If it fails to parse, we set `parsed = null`.

After collecting all definitions, `excelParser.ts` writes the JSON array to `data/generated/api-definitions.json` (pretty-printed). This JSON file is then consumed by the tests.

### Example snippet (pseudocode)

```ts
import * as xlsx from 'xlsx';
import { parseCurlString } from './curlParser';

// Read Excel and convert to JSON definitions
function readExcelToJson(filePath: string) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = xlsx.utils.sheet_to_json(sheet);
  return rows.map(row => ({
    apiCommonName: row["API Name"],       // adjust to your Excel headers
    mifeName:       row["Mife Name"],
    rawCurl:        row["Chatbot curl"],
    parsed:         parseCurlString(row["Chatbot curl"])
  }));
}

// Main entry
function main() {
  const defs = readExcelToJson(process.argv[2]);
  // Write JSON to output file (argv[3])
  fs.writeFileSync(process.argv[3], JSON.stringify(defs, null, 2));
}
```

*In practice, you can open `src/utils/excelParser.ts` to see the exact implementation.*

---

## The `curlParser` Utility

APIs in our Excel are written as cURL commands (e.g., `curl -X POST ...`). The `curlParser.ts` script converts a raw cURL string into structured data:

- **Method** (`GET`, `POST`, etc.)  
- **URL** (full request URL)  
- **Headers** (an object of header key/value pairs)  
- **Data** (request body, if any)

It likely uses regular expressions or string splitting. For example, it may detect `-X GET` or `--request POST`, handle quoted URLs, parse `-H "Key: Value"` lines, and gather the JSON body from `--data` or `--data-raw`.

If the cURL string cannot be parsed (e.g., if it has unexpected formatting), `parseCurlString` returns `null`. That’s why some definitions had `parsed: null`, causing those tests to be skipped (more on that below).

*Note: In a future improvement, the parser can be extended to cover more cURL variants. For now, make sure the Excel cURL column uses a consistent format (with `-H 'Key: Value'` and `--data '{ ... }'` etc).*

---

## `apiClient.ts` – Central API Caller

Located at `src/api/apiClient.ts`, this is our HTTP client built on Playwright’s `APIRequestContext`. It abstracts away request details and adds features:

- **Singleton Context**: We create one `APIRequestContext` for all tests in a run, sharing cookies and headers.  
- **Default Headers**: On creation, we add default headers (like `traceId`) from environment.  
- **Mock Mode**: If the environment variable `MOCK_API=true`, the client will not make real HTTP calls. Instead, it returns a dummy successful response (`{ status: 200, mock: true }`). This lets us run tests offline (especially useful when the real API host is inaccessible).  
- **Request Methods**: `get()`, `post()`, `put()`, `delete()`, each aligning with Playwright’s context methods. They handle JSON payloads and set `Content-Type` headers for POST/PUT.  
- **Logging**: After each real request, we log a summary: e.g., `[API] GET /some/path -> 200`. This helps trace what happened during the test run.  
- **Dispose**: After all tests, we call `client.dispose()` to close the context.

Some example code snippets:

```ts
export class ApiClient {
  private ctx?: APIRequestContext;
  private mock: boolean;

  // Create a new client. If MOCK_API=true, we skip real context.
  static async create(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    const useMock = process.env.MOCK_API === 'true';
    if (useMock) {
      console.log('[ApiClient] MOCK mode enabled: no real requests');
      return new ApiClient(undefined, true);
    }
    const ctx = await request.newContext({
      baseURL,
      extraHTTPHeaders: defaultHeaders,
      ignoreHTTPSErrors: true
    });
    return new ApiClient(ctx, false);
  }

  // GET request
  async get(path: string, opts: RequestOptions = {}) {
    if (this.mock) {
      // Return a fake successful response
      return this.makeMockResponse(path);
    }
    const res = await this.ctx!.get(path, { headers: opts.headers, params: opts.params, timeout: opts.timeoutMs });
    await this.logResponse('GET', path, res);
    return res;
  }

  // POST request
  async post(path: string, opts: RequestOptions = {}) {
    if (this.mock) {
      return this.makeMockResponse(path);
    }
    const res = await this.ctx!.post(path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      data: opts.data,
      timeout: opts.timeoutMs
    });
    await this.logResponse('POST', path, res);
    return res;
  }

  // ... (put, delete are similar)

  private async logResponse(method: string, path: string, res: APIResponse) {
    console.log(`[API] ${method} ${path} -> ${res.status()}`);
  }

  async dispose() {
    if (this.ctx) await this.ctx.dispose();
  }
}
```

This client is then used in the tests (below) to send requests. It centralizes all HTTP interactions.

---

## Playwright Test Design (`packages.spec.ts`)

The main test file `tests/api/packages.spec.ts` dynamically generates tests for each API definition:

1. **Load Definitions**: It reads the generated JSON:
   ```ts
   const raw: ApiDefinition[] = JSON.parse(
     fs.readFileSync(definitionsPath, 'utf8')
   );
   ```
   Each `ApiDefinition` has `apiCommonName`, `mifeName`, `rawCurl`, and `parsed`.

2. **Test Suite Setup**:
   ```ts
   test.describe('API definitions from Excel', () => {
     let client: ApiClient;

     test.beforeAll(async () => {
       const firstUrl = raw.find(r => r.parsed)?.parsed!.url;
       const baseOrigin = process.env.BASE_URL || new URL(firstUrl).origin;
       const defaultHeaders: Record<string, string> = {};
       if (process.env.TRACE_ID) defaultHeaders['traceId'] = process.env.TRACE_ID;
       client = await ApiClient.create(baseOrigin, defaultHeaders);
     });
     // ... tests ...
     test.afterAll(async () => {
       if (client) await client.dispose();
     });
   });
   ```
   - We determine `baseOrigin` either from `BASE_URL` or the origin of the first parsed URL.
   - We add `traceId` header if provided.
   - We create the `ApiClient` once.

3. **Test Cases Loop**:
   ```ts
   raw.forEach((def, index) => {
     if (!def.parsed) {
       test(`[${index}] SKIP - cannot parse: ${def.apiCommonName}`, async () => {
         test.skip(); // Mark as skipped in report
       });
       return;
     }
     const pathOnly = new URL(def.parsed.url).pathname + new URL(def.parsed.url).search;
     test(`[${index}] ${def.apiCommonName} [${def.mifeName}]`, async () => {
       let res: APIResponse;
       const headers = def.parsed!.headers || {};
       if (def.parsed!.method === 'GET') {
         res = await client.get(pathOnly, { headers });
       } else if (def.parsed!.method === 'POST') {
         res = await client.post(pathOnly, { headers, data: def.parsed!.data });
       } else if (def.parsed!.method === 'PUT') {
         res = await client.put(pathOnly, { headers, data: def.parsed!.data });
       } else if (def.parsed!.method === 'DELETE') {
         res = await client.delete(pathOnly, { headers, data: def.parsed!.data });
       } else {
         throw new Error(`Unsupported method ${def.parsed!.method}`);
       }
       expect([200, 201, 202, 204]).toContain(res.status());
       const body = await res.json().catch(() => null);
       expect(body).not.toBeNull();
     });
   });
   ```
   Key points:
   - We use `forEach` with an `index` to ensure **unique test titles**. Playwright cannot have two tests with the same name, so by prefixing with `[index]` we guarantee uniqueness. This fixed the earlier “duplicate test title” errors.
   - If `def.parsed` is `null` (parser failed), we create a skipped test with `test.skip()`. These show up in the report as “skipped” with the reason. This happened for some Excel rows the parser didn’t handle.
   - For a parsed definition, we perform the HTTP request via our `ApiClient`. We switch on `method` and call the appropriate client function.  
   - We assert that the status code is one of 200/201/202/204 (common success codes), and that the response JSON body is not null. You can adjust or extend these assertions as needed.

4. **Test Teardown**:
   After all tests, we call `client.dispose()` to clean up the HTTP context.

Each test’s name includes the index, common name, and service name (mifeName), e.g.:
```
[5] Get HBB packages [SS-DIA-HBB-Pack-Change-Get-Packages-Query - v1.0.0]
```
This makes reports readable and traceable back to the Excel data.

---

## Running the Tests

Once `api-definitions.json` is generated, run the API tests with:

```bash
npm run test:api
```

This executes the script in `package.json`:
```json
"test:api": "npx playwright test tests/api --project=api"
```
It runs Playwright tests located in `tests/api/`. Use `npm test` or `npx playwright test` if you prefer generic invocation. 

- The test run will print logs like `[API] GET /path -> 200` for each request (from our `logResponse`).
- After completion, you will have a report summary in the console:
  ```
  6 passed (some seconds)
  ```
  (If some tests were skipped, it will say e.g. `11 skipped`.) 

### Playwright HTML Report

To view a detailed report (with test names, statuses, logs, and screenshots if any), run:

```bash
npx playwright show-report
```

This opens a local HTTP server and displays the Playwright HTML report in your browser. It is a standard Playwright report with sections for each test suite and test.

---

## CI/CD Workflow

We set up a GitHub Actions workflow (`.github/workflows/ci.yml`) to run tests on every push or pull request:

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Generate data from Excel (if present)
        run: |
          if [ -f "data/raw/Book 4.xlsx" ]; then
            echo "Excel found – generating JSON";
            npm run generate:data
          else
            echo "No Excel file in repo; using committed api-definitions.json";
          fi
      - name: Run API tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TRACE_ID: ${{ secrets.TRACE_ID }}
        run: npm run test:api
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
```

Key points:

- **Node v18** is specified via `setup-node`. This ensures the runner uses our desired Node LTS.
- After checkout, we do `npm ci` to install. 
- **Generate data**: The step checks if the Excel file exists. In our case, we committed the generated `api-definitions.json` and not the raw Excel (since it may contain sensitive data). If Excel is present, it regenerates; otherwise it skips (using the committed JSON). 
- **Test execution**: We pass `BASE_URL` and `TRACE_ID` via secrets. Add these on GitHub (Repository Settings → Secrets).  
- **Artifacts**: We upload the `playwright-report` folder so we can download and inspect it after the run.

**CI Fixes we did**:  
Initially, the workflow failed because `data/raw/Book 4.xlsx` was not in the repo (we didn’t commit it). We had two solutions:
- **A) Commit the generated JSON** (`data/generated/api-definitions.json`) so CI has it.  
- **B) Make the script conditional** (as above) so it doesn’t break if the Excel is absent.  

Either way works; in our final setup, we committed `api-definitions.json` and used the conditional check in CI. Also, if any new API definitions are added to Excel locally, remember to run `npm run generate:data` and commit the updated JSON before pushing.

To check CI status and logs:
- Go to **Actions** tab on GitHub and select the latest workflow run.
- You can also use GitHub CLI (`gh`) to view runs and logs:
  ```bash
  gh run list --repo sgrvperera/Decagon_API
  gh run view <run-id> --repo sgrvperera/Decagon_API --log
  ```

---

## Troubleshooting

Some common issues and how to fix them:

- **PowerShell script blocked**: If `npm` commands failed with “execution scripts disabled”, run PowerShell as admin and do `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`【17†L100-L108】. This allows running local scripts (like npm build steps) without signing.

- **Node version too new**: If you see incompatibilities (e.g., error in Playwright or ts-node), switch to Node 18 or 20 LTS. You can use Node Version Manager ([nvm](https://github.com/nvm-sh/nvm)) to install and use a specific version:  
  ```bash
  nvm install 18
  nvm use 18
  node -v  # should show v18.x
  ```
  We recommend **Node 18 (LTS)** or Node 20 (LTS) for stable long-term support.

- **Excel path/space issues**: If Excel file has spaces, quoting is required in commands. In `package.json` we use quotes (`"data/raw/Book 4.xlsx"`). On Windows CMD, use:
  ```cmd
  npx ts-node "src/utils/excelParser.ts" "data/raw/Book 4.xlsx" "data/generated/api-definitions.json"
  ```
  Or rename the file to remove spaces. We adjusted our scripts to use quotes around paths.

- **Duplicate test names**: If Playwright complains “duplicate test title”, ensure each test has a unique name. We fixed this by including the array index in the test title:  
  ```ts
  test(`[${index}] ${def.apiCommonName}`, ... );
  ```
  This is why our final tests file prefixes names with `[0]`, `[1]`, etc.

- **Cannot resolve host (getaddrinfo ENOTFOUND)**: If tests fail on DNS errors (like `chatbot.dialog.lk` not found), it means the API host is unreachable. Solutions:
  - **Set `BASE_URL`** to a correct endpoint or staging host using `.env` or CI secret.  
  - **Use Mock mode**: For development or CI without network, run tests with `MOCK_API=true` to return dummy responses:
    ```bash
    set MOCK_API=true && npm run test:api   # (Windows CMD)
    MOCK_API=true npm run test:api          # (Unix)
    ```
    This triggers our mock responses (200 OK with fake JSON), so tests pass and the framework logic is validated.
  - **Hosts file**: If you know the correct IP for the hostname, you could add an entry to `C:\Windows\System32\drivers\etc\hosts` (requires admin). But usually not needed in CI.

- **Parser skipped many tests**: If `npm run test:api` shows many “SKIP - cannot parse” entries, inspect `data/generated/api-definitions.json` for those with `"parsed": null`. These correspond to Excel rows where `curlParser` failed. You can:
  1. Open `data/generated/api-definitions.json` (or use a command) to see which `rawCurl` failed.  
     ```bash
     node -e "const j=JSON.parse(require('fs').readFileSync('data/generated/api-definitions.json','utf8')); console.log(j.filter(x=>!x.parsed).map(x=>x.apiCommonName))"
     ```
  2. Edit the Excel to use simpler cURL syntax (e.g., ensure `-X` and `-H` are spaced properly, use double quotes consistently).
  3. Or extend `curlParser.ts` to handle the specific format (regex improvements).

- **Environment variables missing in CI**: If tests depend on `BASE_URL` or `TRACE_ID`, make sure to set them in GitHub Settings → Secrets. The workflow expects `BASE_URL` in secrets.

If other errors occur (e.g. linting, TypeScript types), read the console logs carefully. Many solutions are already illustrated in this README.

---

## All Commands Reference

Below is a chronological list of commands used in the project, with explanations:

1. **Clone repo** (once):
   ```bash
   git clone https://github.com/sgrvperera/Decagon_API.git
   ```
2. **Enter project and install**:
   ```bash
   cd Decagon_API
   npm ci
   ```
3. **Install Playwright browsers** (required step):
   ```bash
   npx playwright install
   ```
4. **Copy .env file**:
   ```bash
   copy .env.example .env   # (Windows) 
   # or on Linux/Mac: cp .env.example .env
   ```
5. **Set PowerShell policy** (once, if needed):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
6. **Generate JSON from Excel**:
   ```bash
   npm run generate:data
   ```
   (Make sure the Excel file path matches, use quotes if it has spaces.)
7. **Run API tests locally**:
   ```bash
   npm run test:api
   ```
8. **View report** (after tests):
   ```bash
   npx playwright show-report
   ```
9. **Commit changes** (if any) and push to GitHub. The CI will run the workflow.
10. **Optional: Run tests in Mock mode** (no network):
    ```bash
    set MOCK_API=true && npm run test:api   # Windows CMD
    MOCK_API=true npm run test:api          # Linux/Mac
    ```
11. **Check CI reports**:
    ```bash
    gh run list --repo sgrvperera/Decagon_API
    gh run view <run-id> --repo sgrvperera/Decagon_API --log
    ```
12. **Deploy / merge**: Once all checks pass, merge your PR. The framework now runs its tests on every push.

Each command is documented in this README. Make sure to run them in the project root (where `package.json` lives).

---

## Future Improvements

This framework is already functional and professional-grade, but here are suggested enhancements to make it even more robust:

- **Enhanced cURL Parser**: Improve `curlParser.ts` to handle more cURL options (`--location`, multiple headers on one line, etc.). This would reduce skipped tests.  
- **Automatic Retries**: For flaky APIs or network issues, integrate retry logic (e.g., retry once on 500 errors). Playwright supports retries too.  
- **Schema Validation**: Use `ajv` (already installed) to validate JSON responses against expected schemas. You could store JSON schemas in the project and assert compliance.  
- **Allure Reports**: Add Allure or other reporters for richer test reports (graphs, attachments).  
- **Parameterization**: If some tests need multiple data sets, extend Excel to allow multiple rows with same endpoint (using different parameters).  
- **Environment Profiles**: Support multiple `.env` files or config (e.g., .env.dev, .env.prod) to easily switch between environments.  
- **Logging/Monitoring**: Enhance logging by writing API request/response logs to files. Currently we console.log; you could pipe these into a log file for CI artifacts.  
- **UI Testing Integration**: Since we use Playwright, we could mix UI and API tests in the same project if needed, sharing the client and config.

These improvements can be added incrementally as the team needs more features. The current structure (with `ApiClient` and JSON definitions) makes it easy to extend functionality in one place.

---

## Conclusion

This README has detailed every aspect of the **Playwright API Testing Framework** we built. We described the **project structure**, explained each file and its purpose, and documented all commands used from setup to CI. By following this guide, you should have a clear understanding of **how the framework works**, **why each component exists**, and **how to operate and extend it**. 

With this data-driven approach, adding or modifying API tests is as simple as updating the Excel sheet. Playwright does the rest, running each API as a test and giving you rich reports. This replicates how a senior automation engineer would architect a real-world API test suite.

---

**Resources:** Playwright’s official docs explain the powerful `APIRequestContext` we use for API testing【10†L103-L111】. PowerShell’s docs describe the `RemoteSigned` policy we set for script execution【17†L100-L108】. 

```
// Saved this README as a markdown file (README.md) for reference.
```