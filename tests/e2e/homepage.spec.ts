import { expect, test } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title and meta information', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Home • Milo - An open source system of action for Alt Clouds/);

    // Check meta description
    // const metaDescription = page.locator('meta[name="description"]');
    // await expect(metaDescription).toHaveAttribute('content', /Stay hungry, stay foolish/);
  });

  // test('should display header navigation', async ({ page }) => {
  // Check if header exists
  //   const header = page.locator('header-component')
  //   await expect(header).toBeVisible()
  // })

  test('should display main content', async ({ page }) => {
    // Check if main content area exists
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    // Check if footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
