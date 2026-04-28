import { test, expect } from '@playwright/test';

test.beforeEach('Launching site',async({ page})=>{
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/#/');

})
test('has title', async ({ page }) => {

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Login/);
});

test('has title-repeat', async ({ page }) => {

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Login/);

});
