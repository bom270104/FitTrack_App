import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    use: {
        headless: true,
        baseURL: process.env.E2E_FRONTEND_BASE_URL ?? 'http://localhost:8081',
        viewport: { width: 390, height: 844 },
        actionTimeout: 10_000,
        ignoreHTTPSErrors: true,
    },
    reporter: [['list'], ['html', { open: 'never' }]],
});
