import {test} from '@playwright/test'


export const extendedTest = test.extend({
    HomePage: async({page}, use)=>{
        await page.goto('https://rahulshettyacademy.com/loginpagePractise/#/');
        await page.locator('#username').fill('rahulshettyacademy');
        await page.locator('#password').fill('Learning@830$3mK2');
        await page.locator('#signInBtn').click();
        await use(page)
    }
})
