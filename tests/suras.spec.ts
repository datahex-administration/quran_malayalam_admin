import { test, expect } from '@playwright/test';

test.describe('Sura CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#loginCode', 'creator123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.locator('nav').getByText('Suras').click();
    await expect(page).toHaveURL(/\/admin\/suras/);
  });

  test('should display suras list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Suras' })).toBeVisible();
    await expect(page.getByText('Add Sura')).toBeVisible();
  });

  test('should navigate to add sura page', async ({ page }) => {
    await page.getByText('Add Sura').click();
    await expect(page).toHaveURL(/\/admin\/suras\/new/);
    await expect(page.getByRole('heading', { name: 'Add Sura' })).toBeVisible();
  });

  test('should have form fields on add sura page', async ({ page }) => {
    await page.getByText('Add Sura').click();
    
    await expect(page.locator('input[placeholder*="1"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Al-Fatiha"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="الفاتحة"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should create a new sura', async ({ page }) => {
    await page.getByText('Add Sura').click();
    
    const timestamp = Date.now();
    await page.locator('input[placeholder*="1"]').first().fill('999');
    await page.locator('input[placeholder*="Al-Fatiha"]').fill(`Test Sura ${timestamp}`);
    await page.locator('input[placeholder*="الفاتحة"]').fill('اختبار');
    await page.locator('textarea').fill('Test description');
    await page.locator('input[placeholder*="7"]').fill('5');
    await page.locator('select').selectOption('Meccan');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Should redirect back to list
    await expect(page).toHaveURL(/\/admin\/suras$/, { timeout: 10000 });
  });
});
