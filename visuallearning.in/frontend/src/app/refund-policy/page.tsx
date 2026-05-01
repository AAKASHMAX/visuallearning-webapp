"use client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last updated: March 12, 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
              <p>
                VISUALLEARNING AI PRIVATE LIMITED (&quot;VisualLearning&quot;) strives to provide quality educational content.
                This Refund Policy outlines the terms and conditions for refunds on our subscription plans.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Refund Eligibility</h2>
              <p>Refunds may be considered under the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request is made within <strong>7 days</strong> of the subscription purchase date</li>
                <li>Technical issues prevent access to the subscribed content</li>
                <li>Duplicate or accidental payment</li>
                <li>Content significantly differs from what was described</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Non-Refundable Cases</h2>
              <p>Refunds will NOT be issued in the following cases:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request made after 7 days from the date of purchase</li>
                <li>Significant usage of the platform content (more than 30% of videos watched)</li>
                <li>Change of mind or no longer needing the service</li>
                <li>Inability to access due to user&apos;s own internet or device issues</li>
                <li>Violation of our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How to Request a Refund</h2>
              <p>To request a refund:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Email us at <a href="mailto:visuallearning247@gmail.com" className="text-primary hover:underline">visuallearning247@gmail.com</a> with the subject &quot;Refund Request&quot;</li>
                <li>Include your registered email address and order/transaction ID</li>
                <li>Provide the reason for your refund request</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Refund Processing</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Refund requests are reviewed within <strong>3-5 business days</strong></li>
                <li>Approved refunds are processed within <strong>7-10 business days</strong></li>
                <li>Refunds are credited back to the original payment method</li>
                <li>You will receive an email confirmation once the refund is processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Partial Refunds</h2>
              <p>
                In certain cases, we may offer partial refunds based on the unused portion of your subscription period.
                This is evaluated on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Subscription Cancellation</h2>
              <p>
                You may cancel your subscription at any time from your dashboard. Upon cancellation, you will retain
                access until the end of your current billing period. No refund will be issued for the remaining days
                after cancellation unless covered under the 7-day refund window.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
              <p>
                For any questions regarding this refund policy, reach out to us at{" "}
                <a href="mailto:visuallearning247@gmail.com" className="text-primary hover:underline">visuallearning247@gmail.com</a>{" "}
                or call us at <a href="tel:+919718154204" className="text-primary hover:underline">+91 9718154204</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
