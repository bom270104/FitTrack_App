import { test, expect } from '@playwright/test';

test('register -> login -> add water -> verify UI', async ({ page, request }) => {
    // 1) Register a new test user via API
    const email = `e2e_${Date.now()}@example.com`;
    const password = 'Password123!';

    const registerRes = await request.post('http://localhost:5000/api/auth/register', {
        data: {
            fullName: 'E2E Tester',
            email,
            password,
            age: 30,
            gender: 'male',
            height: 175,
            weight: 75,
            activityLevel: 'moderate',
            goal: 'maintain',
        },
    });
    expect(registerRes.ok()).toBeTruthy();
    const registerBody = await registerRes.json();
    expect(registerBody.success).toBeTruthy();

    // 2) Login to get token
    const loginRes = await request.post('http://localhost:5000/api/auth/login', {
        data: { email, password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    const token = loginBody.data?.token;
    expect(token).toBeTruthy();

    // 3) Navigate to frontend and inject token into localStorage
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('ft_token', t), token);
    await page.reload();

    // 4) Go to Water screen using bottom nav
    await page.getByRole('button', { name: /Water/i }).click();
    await expect(page.getByText("Today's Log")).toBeVisible();

    // 5) Add quick amount via API (to avoid flakiness) and then reload UI
    const addRes = await request.post('http://localhost:5000/api/water', {
        headers: { Authorization: `Bearer ${token}` },
        data: { amount: 250 },
    });
    expect(addRes.ok()).toBeTruthy();

    // reload and assert the new entry appears in Today's Log
    await page.reload();
    await page.getByRole('heading', { name: /Today's Log/i }).scrollIntoViewIfNeeded();
    // look for an entry with '+250ml' or timestamp
    await expect(page.locator('text=+250ml').first()).toBeVisible({ timeout: 5000 });

    // take screenshot artifact
    await page.screenshot({ path: 'e2e/artifact-water-log.png', fullPage: false });
});
