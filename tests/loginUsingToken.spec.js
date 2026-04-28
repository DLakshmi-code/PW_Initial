// @ts-check

import { test, expect,request } from '@playwright/test';
import fs from 'fs';
/** @type {string} */

let token;
/** @type {string} */

let prodId;

test.beforeAll('Launching site',async({ request,browser})=>{
  const resp = await request.post('https://rahulshettyacademy.com/api/ecom/auth/login',
   { data:{userEmail: "divya.kanwar@gmail.com", userPassword: "Cover123"}}
  )

  expect(resp.status()).toBe(200);
 const respBody=  await resp.json();
 token = respBody.token;
console.log("Token"+token)


})


test('shopping site',async({page})=>{
await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')


await expect (page).toHaveTitle(/Let's Shop/)
});


test('Particular product exists',async({page})=>{
  await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
  await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')
  const requestPromise =  page.waitForRequest('**/api/ecom/user/add-to-cart');
  await page.locator('#products .container .row div').filter({hasText:'ZARA'}).locator('button',{hasText:'Add to cart'}).click();

  const request = await requestPromise;
  const payload =request.postDataJSON();

   fs.writeFileSync('testDataFile.json',JSON.stringify(payload));

   prodId =payload._id;
  console.log("**"+JSON.stringify(payload._id))
  })

test('No product exists',async({page})=>{
await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
 await page.route('https://rahulshettyacademy.com/api/ecom/product/get-all-products',async route=>{

      await route.fulfill({
        status:200,
       json: { data:[],
        message:"no products"}
      })
    })
  
await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')
await expect (page.getByText('Showing')).toContainText('Showing 0 results');
  })

test('Add to cart using API ',async({page,request})=>{
     await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
 const datatoAdd= JSON.parse(fs.readFileSync('testDataFile.json','utf-8'));
 console.log("\n\n(((==>"+JSON.stringify(datatoAdd))
 console.log(""+typeof(JSON.stringify(datatoAdd)))
         await  request.post('https://rahulshettyacademy.com/api/ecom/user/add-to-cart',
           { headers: {
             'Authorization': token,
              'Content-Type': 'application/json'
            },
            data:datatoAdd

          })

   await page.goto('https://rahulshettyacademy.com/client/#/dashboard/cart')

   await expect (page.getByText('ZARA COAT 3')).toBeVisible();
  })

test(' Modifying the response message on add to cart', async({page})=>{

await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
  await page.route('**/user/add-to-cart',async route =>{
   const response= await route.fetch();
      const modifiedMesg = {message: "finally Product Added To Cart"}

  await    route.fulfill({
        response,
        json:modifiedMesg })

    })
      await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')
  const responsePromise = page.waitForResponse('**/api/ecom/user/add-to-cart');

  await page.locator('#products .container .row div').filter({hasText:'ZARA'}).locator('button',{hasText:'Add to cart'}).click();
  await responsePromise
  await expect (page.locator('.toast-message')).toHaveText("finally Product Added To Cart")
 await page.pause();
  })


test(' Modifying the response- failing the api', async({page})=>{

await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
  await page.route('**/user/add-to-cart',async route =>{
      const modifiedMesg = {message: "SORRY"}

  await    route.fulfill({
        status:400,
        json:modifiedMesg })

    })
      await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/');
      
  const responsePromise = page.waitForResponse('**/api/ecom/user/add-to-cart');

  await page.locator('#products .container .row div').filter({hasText:'ZARA'}).locator('button',{hasText:'Add to cart'}).click();
  await responsePromise
  await expect (page.locator('.toast-message')).toHaveText("SORRY")
  })


  //Changing the request
test('Modifying the product image on add to cart', async( {page})=>{

await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')

  await page.route('https://rahulshettyacademy.com/api/ecom/user/add-to-cart',async (route,request) =>{

     const APirequest =   request.postDataJSON();

      APirequest.product.productImage= 'https://rahulshettyacademy.com/api/ecom/uploads/productImage_1767959232316.jpeg';
    
     await route.continue({postData:JSON.stringify(APirequest)})

       })
  await page.locator('#products .container .row div').filter({hasText:'ADIDAS'}).locator('button',{hasText:'Add to cart'}).click();
 await page.pause();



  })

test('Modifying the product name on add to cart', async( {page})=>{

  
await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/')

  await page.route('https://rahulshettyacademy.com/api/ecom/user/add-to-cart',async (route,request) =>{

     const APirequest =  await request.postDataJSON();

      APirequest.product.productName= 'Zara Coat';
    
     await route.continue({postData:JSON.stringify(APirequest)})

       })
  await page.locator('#products .container .row div').filter({hasText:'ADIDAS'}).locator('button',{hasText:'Add to cart'}).click();
  await page.locator('.btn.btn-custom',{hasText:'Cart'}).click();
  await page.getByText('Zara Coat').waitFor();
  await expect(page.getByText('Zara Coat')).toBeVisible();



  })

test.only('Aborting the calls with jpeg ',async({page})=>{
await page.addInitScript(value=>{
    window.localStorage.setItem("token",value)

},token)
    await page.route('**/*.{jpg,jpeg,png}',async(route)=>{
    await  route.abort();
    });
    await page.goto('https://rahulshettyacademy.com/client/#/dashboard/dash/');

    const imagesList= page.getByRole("img");
    const counti = imagesList.count();

    for(let i=0;i<await counti;i++)
    {
      await expect(imagesList.nth(i)).toHaveJSProperty('naturalWidth', 0);
    }
    
    await expect(page.locator("#sidebar .form-group.ng-star-inserted input[type='checkbox']").nth(1)).toHaveJSProperty('checked',false);
  })