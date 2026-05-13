import type { Subscription } from "@/types";

type SubscriptionShape = Pick<Subscription, "status" | "expiryDate">;

function isSubscription(value: unknown): value is SubscriptionShape {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "expiryDate" in value
  );
}

export function getSubscriptionList(payload: unknown): SubscriptionShape[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.filter(isSubscription);
  }

  if (isSubscription(payload)) {
    return [payload];
  }

  if (typeof payload === "object" && "data" in payload) {
    return getSubscriptionList((payload as { data?: unknown }).data);
  }

  return [];
}

export function hasActiveSubscription(payload: unknown, now = new Date()): boolean {
  return getSubscriptionList(payload).some((subscription) => {
    if (subscription.status !== "ACTIVE" || !subscription.expiryDate) return false;
    return new Date(subscription.expiryDate) > now;
  });
}
