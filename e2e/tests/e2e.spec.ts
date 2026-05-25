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

    // 4) Wait for dashboard to load, then open Water screen via dashboard card
    await expect(page.getByText('Your BMI')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Water/i }).nth(0).click();
    await expect(page.getByText("Today's Log")).toBeVisible({ timeout: 15000 });

    // 5) Use Quick Add UI to add 250ml so client updates state
    await page.getByRole('button', { name: /250ml/i }).click();
    // assert the new entry appears in Today's Log
    await expect(page.locator('text=+250ml').first()).toBeVisible({ timeout: 10000 });

    // take screenshot artifact
    await page.screenshot({ path: 'e2e/artifact-water-log.png', fullPage: false });
});
