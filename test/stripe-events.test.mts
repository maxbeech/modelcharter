import { checkoutSessionIsFunded, planForSubscription } from "../lib/stripe-events.ts";
import { eq, done } from "./_assert.mts";

eq(checkoutSessionIsFunded({ status: "complete", payment_status: "paid" }), true, "paid Checkout is funded");
eq(checkoutSessionIsFunded({ status: "complete", payment_status: "no_payment_required" }), true, "zero-total Checkout is funded");
eq(checkoutSessionIsFunded({ status: "complete", payment_status: "unpaid" }), false, "unpaid Checkout cannot grant access");
eq(checkoutSessionIsFunded({ status: "open", payment_status: "paid" }), false, "open Checkout cannot grant access");
eq(planForSubscription("active", "team"), "team", "active Team subscription remains Team");
eq(planForSubscription("trialing", "business"), "business", "trialing Business subscription remains Business");
eq(planForSubscription("past_due", "business"), "business", "past due subscription retains paid plan");
eq(planForSubscription("canceled", "business"), "free", "cancelled subscription is Free");
eq(planForSubscription("unpaid", "team"), "free", "unpaid subscription is Free");

done("stripe events");
