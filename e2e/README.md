E2E test with Playwright

Setup
1. Install dev dependencies:

```bash
cd frontend || cd .
npm install -D @playwright/test
npx playwright install
```

2. Run the test (ensure backend `npm start` and frontend `npm run dev` are running):

```bash
npx playwright test e2e/tests/e2e.spec.ts --project=chromium
```

Artifacts
- Screenshot saved to `e2e/artifact-water-log.png` on success.
