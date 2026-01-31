import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title and header
    await expect(page.getByRole('heading', { name: 'Quran Malayalam' })).toBeVisible();
    await expect(page.getByText('Content Management System')).toBeVisible();
  });

  test('should have login code input field', async ({ page }) => {
    await page.goto('/login');
    
    const input = page.locator('input#loginCode');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Enter your login code');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    
    const input = page.locator('input#loginCode');
    const toggleButton = page.locator('button[type="button"]');
    
    // Initially password type
    await expect(input).toHaveAttribute('type', 'password');
    
    // Click eye icon to show password
    await toggleButton.click();
    await expect(input).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('should show error for invalid login code', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input#loginCode', 'invalidcode123');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.getByText('Invalid login code')).toBeVisible({ timeout: 15000 });
  });

  test('should redirect to admin on valid creator login', async ({ page }) => {
    await page.goto('/login');
    
    // Use the creator code from .env.example
    await page.fill('input#loginCode', 'creator123');
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });

  test('should redirect to admin on valid verifier login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input#loginCode', 'verifier123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  });
});