#!/usr/bin/env node
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

console.log("Testing Stripe Configuration:");
console.log(
  "API Key:",
  process.env.STRIPE_SECRET_KEY
    ? `${process.env.STRIPE_SECRET_KEY.substring(0, 25)}...`
    : "NOT SET"
);

async function testStripe() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 15000, // $150.00 in cents
      currency: "nzd",
      metadata: { bookingId: "5" },
      automatic_payment_methods: { enabled: true },
    });

    console.log("\n✅ SUCCESS! Payment Intent Created:");
    console.log("Payment Intent ID:", paymentIntent.id);
    console.log(
      "Amount:",
      paymentIntent.amount / 100,
      paymentIntent.currency.toUpperCase()
    );
    console.log("Status:", paymentIntent.status);
    console.log(
      "Client Secret:",
      paymentIntent.client_secret ? "Generated ✓" : "Not generated"
    );
  } catch (error) {
    console.log("\n❌ ERROR:", error.message);
    console.log("Type:", error.type);
  }
}

testStripe();
