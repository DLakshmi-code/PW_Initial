import { expect,page } from '@playwright/test';
import {extendedTest as test} from '../utils/fixture.js';




test('Success Login ', async ({ HomePage }) => { 
await expect (HomePage).toHaveTitle('ProtoCommerce')
});

test('count of products', async({HomePage})=>{
await HomePage.waitForLoadState('networkidle');
await HomePage.waitForSelector('app-card');
  const cards= await (HomePage).locator('app-card').count();
  expect(cards).toBe(4)

})