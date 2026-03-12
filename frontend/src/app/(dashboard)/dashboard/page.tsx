"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { BookOpen, CreditCard, PlayCircle } from "lucide-react";
import type { Subscription } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    api.get("/subscription/my-subscription").then(({ data }) => setSubscription(data.data)).catch(() => {});
  }, []);

  const isActive = subscription?.status === "ACTIVE" && new Date(subscription.expiryDate) > new Date();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subscription</p>
              {isActive ? (
                <Badge variant="success">{subscription!.plan} - Active</Badge>
              ) : (
                <Badge variant="warning">No active plan</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="font-semibold">4 Classes, 16 Subjects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Content</p>
              <p className="font-semibold">Videos, Notes & MCQs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isActive && (
        <Card className="border-accent border-2 mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Unlock all content</h3>
              <p className="text-gray-500">Subscribe to access all video lectures, notes, and practice questions.</p>
            </div>
            <Link href="/subscription"><Button variant="accent">View Plans</Button></Link>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold mb-4">Start Learning</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Class 9", "Class 10", "Class 11", "Class 12"].map((name) => (
          <Link key={name} href="/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-400">4 Subjects</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
