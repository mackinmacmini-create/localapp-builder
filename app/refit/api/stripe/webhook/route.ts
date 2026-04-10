import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return Response.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  const user = await db.user.findUnique({
    where: { email: session.customer_email ?? undefined },
  });
  if (!user) return;

  await db.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubId: session.subscription as string,
    },
  });

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const tier = (subscription.items.data[0]?.price?.metadata?.tier as string) || "premium";
  // current_period_end moved to item-level in Stripe API 2024+; fall back via any cast
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd: number = (subscription as any).current_period_end ?? subscription.items.data[0]?.current_period_end ?? 0;

  await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tier,
      status: "active",
      startDate: new Date(subscription.created * 1000),
      renewalDate: new Date(periodEnd * 1000),
    },
    update: {
      tier,
      status: "active",
      renewalDate: new Date(periodEnd * 1000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionTier: tier },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user = await db.user.findUnique({
    where: { stripeSubId: subscription.id },
  });
  if (!user) return;

  const tier = (subscription.items?.data[0]?.price?.metadata?.tier as string) || user.subscriptionTier;

  await db.subscription.update({
    where: { userId: user.id },
    data: {
      tier,
      status: subscription.status === "active" ? "active" : "paused",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renewalDate: new Date(((subscription as any).current_period_end ?? subscription.items.data[0]?.current_period_end ?? 0) * 1000),
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionTier: tier },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await db.user.findUnique({
    where: { stripeSubId: subscription.id },
  });
  if (!user) return;

  await db.subscription.update({
    where: { userId: user.id },
    data: { status: "cancelled", endDate: new Date() },
  });

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionTier: "free" },
  });
}
