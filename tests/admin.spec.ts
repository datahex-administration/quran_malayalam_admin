import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input#loginCode', 'creator123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test('should display dashboard with all menu items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Check sidebar menu items
    await expect(page.locator('nav').getByText('Suras')).toBeVisible();
    await expect(page.locator('nav').getByText('Translations')).toBeVisible();
    await expect(page.locator('nav').getByText('Interpretations')).toBeVisible();
    await expect(page.locator('nav').getByText('About Us')).toBeVisible();
    await expect(page.locator('nav').getByText('Author')).toBeVisible();
    await expect(page.locator('nav').getByText('Contact Us')).toBeVisible();
    await expect(page.locator('nav').getByText('Help')).toBeVisible();
    await expect(page.locator('nav').getByText('Audit Log')).toBeVisible();
  });

  test('should navigate to Suras page', async ({ page }) => {
    await page.locator('nav').getByText('Suras').click();
    await expect(page).toHaveURL(/\/admin\/suras/);
    await expect(page.getByRole('heading', { name: 'Suras' })).toBeVisible();
  });

  test('should navigate to Translations page', async ({ page }) => {
    await page.locator('nav').getByText('Translations').click();
    await expect(page).toHaveURL(/\/admin\/translations/);
    await expect(page.getByRole('heading', { name: 'Translations' })).toBeVisible();
  });

  test('should navigate to Interpretations page', async ({ page }) => {
    await page.locator('nav').getByText('Interpretations').click();
    await expect(page).toHaveURL(/\/admin\/interpretations/);
    await expect(page.getByRole('heading', { name: 'Interpretations' })).toBeVisible();
  });

  test('should navigate to About Us page', async ({ page }) => {
    await page.locator('nav').getByText('About Us').click();
    await expect(page).toHaveURL(/\/admin\/about/);
    await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
  });

  test('should navigate to Author page', async ({ page }) => {
    await page.locator('nav').getByText('Author').click();
    await expect(page).toHaveURL(/\/admin\/author/);
    await expect(page.getByRole('heading', { name: 'Author' })).toBeVisible();
  });

  test('should navigate to Contact Us page', async ({ page }) => {
    await page.locator('nav').getByText('Contact Us').click();
    await expect(page).toHaveURL(/\/admin\/contact/);
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
  });

  test('should navigate to Help page', async ({ page }) => {
    await page.locator('nav').getByText('Help').click();
    await expect(page).toHaveURL(/\/admin\/help/);
    await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible();
  });

  test('should navigate to Audit Log page', async ({ page }) => {
    await page.locator('nav').getByText('Audit Log').click();
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
