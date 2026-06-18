import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:5000";
const EXISTING_EMAIL = process.env.E2E_LOGIN_EMAIL ?? "youngboysitinh362@gmail.com";
const EXISTING_PASSWORD = process.env.E2E_LOGIN_PASSWORD ?? "12345678";

async function waitForLoginScreen(page) {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible({ timeout: 15_000 });
}

async function loginThroughUi(page, email: string, password: string) {
    const inputs = page.locator("input");

    await expect(inputs.nth(0)).toBeVisible({ timeout: 10_000 });
    await inputs.nth(0).fill(email);
    await inputs.nth(1).fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("auth", () => {
    test("login with provided account through UI", async ({ page }) => {
        await waitForLoginScreen(page);

        const loginResponse = page.waitForResponse(
            (response) =>
                response.url() === `${API_BASE_URL}/api/auth/login` &&
                response.request().method() === "POST",
        );

        await loginThroughUi(page, EXISTING_EMAIL, EXISTING_PASSWORD);

        const response = await loginResponse;
        expect(response.ok()).toBeTruthy();

        const body = await response.json();
        expect(body.success).toBeTruthy();
        expect(body.data?.token).toBeTruthy();
        await expect(page.getByText(/TDEE/i)).toBeVisible({ timeout: 15_000 });
    });

    test("register a new account through API, then login through UI", async ({ page, request }) => {
        const email = `e2e_auth_${Date.now()}@example.com`;
        const password = "12345678";

        const registerResponse = await request.post(`${API_BASE_URL}/api/auth/register`, {
            data: {
                fullName: "E2E Auth Tester",
                email,
                password,
                age: 24,
                gender: "male",
                height: 175,
                weight: 70,
                activityLevel: "moderate",
                goal: "maintain",
                dailyWaterGoal: 2000,
            },
        });

        expect(registerResponse.ok()).toBeTruthy();
        const registerBody = await registerResponse.json();
        expect(registerBody.success).toBeTruthy();
        expect(registerBody.data?.token).toBeTruthy();
        expect(registerBody.data?.user?.email).toBe(email);

        await waitForLoginScreen(page);

        const loginResponse = page.waitForResponse(
            (response) =>
                response.url() === `${API_BASE_URL}/api/auth/login` &&
                response.request().method() === "POST",
        );

        await loginThroughUi(page, email, password);

        const response = await loginResponse;
        expect(response.ok()).toBeTruthy();
        const loginBody = await response.json();
        expect(loginBody.success).toBeTruthy();
        expect(loginBody.data?.user?.email).toBe(email);
        await expect(page.getByText(/TDEE/i)).toBeVisible({ timeout: 15_000 });
    });
});
