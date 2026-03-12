"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";

interface RazorpayButtonProps {
  plan: string;
  amount: number;
  label: string;
  classesAccess?: string[];
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({ plan, amount, label, classesAccess, onSuccess }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Failed to load payment gateway"); return; }

      const { data } = await api.post("/subscription/create-order", { plan, classesAccess });
      const order = data.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VisualLearning",
        description: `${label} Subscription`,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#1e3a5f" },
        handler: async (response: any) => {
          try {
            await api.post("/subscription/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              classesAccess,
            });
            toast.success("Subscription activated!");
            onSuccess?.();
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="accent" size="lg" onClick={handlePayment} disabled={loading} className="w-full">
      {loading ? "Processing..." : `Subscribe - Rs ${amount}`}
    </Button>
  );
}
