# Playwright API Automation Framework

This repository contains a professional, reusable, and maintainable Playwright API automation framework built with TypeScript.

## Structure

- `src/` - framework source code (ApiClient, parsers, validators)
- `tests/` - Playwright tests (data-driven)
- `data/raw/` - original Excel files (Book 4.xlsx)
- `data/generated/` - JSON generated from Excel (api-definitions.json)
- `.github/workflows/ci.yml` - GitHub Actions CI for running tests on push/PR

## Quick start

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` and update:
   ```bash
   cp .env.example .env
   ```

3. Generate JSON definitions from the Excel (this repository contains `data/raw/Book 5.xlsx` already):
   ```bash
   npx ts-node "src/utils/excelParser.ts" "data/raw/Book 5.xlsx" "data/generated/api-definitions.json"
   ```

4. Run API tests:
   ```bash
   npm run test:api
   ```

## CI

The GitHub Actions workflow will:
- install dependencies
- run the generator to convert Excel to JSON
- run Playwright API tests
Set `BASE_URL` and `TRACE_ID` in repository secrets for CI runs.

## How it works

- Excel rows with a `Chatbot curl` column are parsed by `src/utils/curlParser.ts` into method, url, headers, and data.
- `src/utils/excelParser.ts` converts the Excel into `data/generated/api-definitions.json`.
- Tests in `tests/api` iterate over the generated definitions and issue requests through `src/api/apiClient.ts`.
- Add JSON Schemas in `src/validators` and validate responses with Ajv to enforce contracts.

## Extending / Adding new APIs

1. Add a new row to the Excel with a `Chatbot curl` string (follow existing format).
2. Re-run `npm run generate:data`.
3. The tests will pick up new definitions automatically.

## Notes & Next steps

- The curl parser handles common curl shapes. For unusual curl syntaxes adjust `src/utils/curlParser.ts`.
- Consider adding schema validation, retry/backoff logic, logging/attachments for failed tests, and tagging (e.g., @smoke) in the Excel for selective runs.
