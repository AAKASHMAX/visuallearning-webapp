import { redirect } from "next/navigation";

// Subscribing now happens entirely on /pricing (pick plan + classes + pay
// inline). This old checkout route just forwards there so there is a single,
// consistent flow and no stale duplicate.
export default function SubscriptionRedirect() {
  redirect("/pricing");
}
