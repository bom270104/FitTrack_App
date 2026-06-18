# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> register -> login -> add water -> verify UI
- Location: e2e\tests\e2e.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Your BMI')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Your BMI')

```

```yaml
- text: Chào buổi sáng E2E Tester 󰂜 BMI của bạn - kg/m2 󰓾 Chưa có dữ liệu 󰅂 󰈸 Calo - Chưa có dữ liệu 󰸊 Nước - Chưa có dữ liệu 󰔳 Mục tiêu cân nặng Chưa có dữ liệu 󰅂 Tiến độ 0% TDEE & Mục tiêu calo TDEE - kcal/ngày Mục tiêu - kcal/ngày Hiện đang tiêu thụ - Chưa có dữ liệu 󱖦 Mở máy tính TDEE Tính calo cho tăng, giảm hoặc giữ cân 󰅂 󰮧 Trang chủ 󰗑 BMI 󰸊 Nước 󰄪 Thống kê 󰀓 Hồ sơ
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('register -> login -> add water -> verify UI', async ({ page, request }) => {
  4  |     // 1) Register a new test user via API
  5  |     const email = `e2e_${Date.now()}@example.com`;
  6  |     const password = 'Password123!';
  7  | 
  8  |     const registerRes = await request.post('http://localhost:5000/api/auth/register', {
  9  |         data: {
  10 |             fullName: 'E2E Tester',
  11 |             email,
  12 |             password,
  13 |             age: 30,
  14 |             gender: 'male',
  15 |             height: 175,
  16 |             weight: 75,
  17 |             activityLevel: 'moderate',
  18 |             goal: 'maintain',
  19 |         },
  20 |     });
  21 |     expect(registerRes.ok()).toBeTruthy();
  22 |     const registerBody = await registerRes.json();
  23 |     expect(registerBody.success).toBeTruthy();
  24 | 
  25 |     // 2) Login to get token
  26 |     const loginRes = await request.post('http://localhost:5000/api/auth/login', {
  27 |         data: { email, password },
  28 |     });
  29 |     expect(loginRes.ok()).toBeTruthy();
  30 |     const loginBody = await loginRes.json();
  31 |     const token = loginBody.data?.token;
  32 |     expect(token).toBeTruthy();
  33 | 
  34 |     // 3) Navigate to frontend and inject token into localStorage
  35 |     await page.goto('/');
  36 |     await page.evaluate((t) => localStorage.setItem('ft_token', t), token);
  37 |     await page.reload();
  38 | 
  39 |     // 4) Wait for dashboard to load, then open Water screen via dashboard card
> 40 |     await expect(page.getByText('Your BMI')).toBeVisible({ timeout: 15000 });
     |                                              ^ Error: expect(locator).toBeVisible() failed
  41 |     await page.getByRole('button', { name: /Water/i }).nth(0).click();
  42 |     await expect(page.getByText("Today's Log")).toBeVisible({ timeout: 15000 });
  43 | 
  44 |     // 5) Use Quick Add UI to add 250ml so client updates state
  45 |     await page.getByRole('button', { name: /250ml/i }).click();
  46 |     // assert the new entry appears in Today's Log
  47 |     await expect(page.locator('text=+250ml').first()).toBeVisible({ timeout: 10000 });
  48 | 
  49 |     // take screenshot artifact
  50 |     await page.screenshot({ path: 'e2e/artifact-water-log.png', fullPage: false });
  51 | });
  52 | 
```