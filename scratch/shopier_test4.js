const JWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJiNDhkZDhjMTBmNzY0Yzg4MzMxNzhlNjgwYmQ5NjI0NCIsImp0aSI6IjdlMTkxMTFkMWZlMGVjM2ZhNzJlMzcwNmM0MmViNmZjYTM1NzFjMGEwMDcxN2E3YTVlODhlMzA1MjJkZTI5N2ZhMDZiYTdmNTA4ZGZiMTQxNmI3MWEyMjA5MDdjYzg0MjkyNWFmZTE3NDBiODk2YzlkMzg2NmQ5ZGNhYWY0NzcwYjkxM2U4NTI4M2VlMjVmY2Q4ZTA1ZmU4OWMxM2FlYjYiLCJpYXQiOjE3ODkwMTYzNjUsIm5iZiI6MTc4OTAxNjM2NSwiZXhwIjoxOTQ2ODAxMTI1LCJzdWIiOjExMDM2ODAsInNjb3BlcyI6WyJvcmRlcnM6cmVhZCIsIm9yZGVyczp3cml0ZSIsInByb2R1Y3RzOnJlYWQiLCJwcm9kdWN0czp3cml0ZSIsInNoaXBwaW5nczpyZWFkIiwic2hpcHBpbmdzOndyaXRlIiwiZGlzY291bnRzOnJlYWQiLCJkaXNjb3VudHM6d3JpdGUiLCJwYXlvdXRzOnJlYWQiLCJyZWZ1bmRzOnJlYWQiLCJyZWZ1bmRzOndyaXRlIiwic2hvcDpyZWFkIiwic2hvcDp3cml0ZSJdfQ.fr7EGAlsCxBn5ws78wvRfgIWX7042QiclV24rCUiOwZNmSkFgE4RfZllUFBDl4Gz8vmxu2vuZDOni1WWKZQ3_PrgoZUJcOFrUKbMjFXAEyxk9q-Air2k6UPcva2RT5tF2J5AGImjgNYXLhKzRsXQyzLdqxbVgwKFAYvOtFE5GumaQu6CVCoj3za49uTHmMD38aPX_w8Vo0-SvIcd6xw9JF7Lnwa0INnndWPPUxzSvHNdHGNw2L7Fekx-_YcNZTvgve8jO6RpYBsT_sgONCwgg6s0HyiF0JYxt1sZllPDGxJKEZ1ejgN_mNVjBU73EMwjl66ZhymveCFYCazkGMoLaA";

async function testGetOrders() {
  try {
    const res = await fetch('https://api.shopier.com/v1/orders?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT}`,
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testGetOrders();
