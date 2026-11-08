import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const storedUsers = [
  { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com', phone: '123456' },
];

test('root and unknown URLs render the users page with the active navigation link', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/usuarios$/);
  await expect(page.getByRole('heading', { name: 'CRUD de usuários' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usuários' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.goto('/rota-inexistente');
  await expect(page).toHaveURL(/\/usuarios$/);
  await expect(page.getByRole('heading', { name: 'CRUD de usuários' })).toBeVisible();
});

test('the navigation link is reachable with the real Tab key', async ({ page }) => {
  await page.goto('/usuarios');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Usuários' })).toBeFocused();
});

test('the users layout adapts at narrow and wide viewport sizes', async ({ browser }) => {
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.addInitScript(
    (users) => localStorage.setItem('angular-app.users', JSON.stringify(users)),
    storedUsers,
  );
  await mobile.goto('/usuarios');
  const mobileNavLink = mobile.getByRole('link', { name: 'Usuários' });
  await expect(mobileNavLink).toBeVisible();
  await expect(mobile.locator('article').filter({ hasText: 'Ada Lovelace' })).toBeVisible();
  await expect(mobile.locator('table').locator('xpath=..')).toBeHidden();
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    375,
  );
  expect(
    await mobile
      .locator('app-root > div > header > div')
      .evaluate((element) => getComputedStyle(element).flexDirection),
  ).toBe('column');
  await mobile.close();

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.addInitScript(
    (users) => localStorage.setItem('angular-app.users', JSON.stringify(users)),
    storedUsers,
  );
  await desktop.goto('/usuarios');
  await expect(desktop.locator('table')).toBeVisible();
  await expect(desktop.locator('article').filter({ hasText: 'Ada Lovelace' })).toBeHidden();
  expect(await desktop.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    1280,
  );
  await desktop.close();
});

test('the navigation shell has no axe violations', async ({ page }) => {
  await page.goto('/usuarios');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});
