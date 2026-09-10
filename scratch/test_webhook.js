

async function test() {
  console.log("Sending mock webhook...");
  try {
    const res = await fetch("http://localhost:3000/api/payment/shopier-callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "order.created",
        id: "759219546", 
        total_order_value: 1.00
      })
    });
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch (e) {
    console.error(e);
  }
}
test();
