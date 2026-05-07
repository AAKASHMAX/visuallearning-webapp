"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last updated: May 7, 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using VisualLearning, you agree to these Terms of Service.
                If you do not agree, please do not use our website, courses, videos,
                notes, tests, subscriptions, or related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Account and Eligibility</h2>
              <p>
                You are responsible for keeping your account details accurate and your login
                credentials secure. Parents or guardians should supervise use by students
                who require consent under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Educational Content</h2>
              <p>
                Our content is provided for learning and exam preparation. We work to keep
                lessons, notes, animations, and practice material accurate, but we do not
                guarantee any specific academic result or exam score.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Subscriptions and Payments</h2>
              <p>
                Paid plans provide access to the features shown at the time of purchase.
                Payments are processed by third-party payment providers such as Razorpay.
                Pricing, plan features, and availability may change from time to time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Refunds and Cancellation</h2>
              <p>
                Refund requests are handled according to our Refund Policy. Please review
                the Refund Policy before purchasing a subscription or course access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Share, resell, copy, or redistribute paid content without permission</li>
                <li>Attempt to bypass subscriptions, security, or access controls</li>
                <li>Upload or submit unlawful, harmful, or misleading information</li>
                <li>Use the service in a way that disrupts other students or the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
              <p>
                VisualLearning owns or licenses the videos, animations, notes, designs,
                logos, software, and other platform content. You receive a limited,
                non-transferable right to use the service for personal learning only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
              <p>
                The platform may use third-party providers for payments, hosting,
                analytics, communication, or video delivery. Your use of those services
                may also be subject to their own terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Service Availability</h2>
              <p>
                We aim to keep VisualLearning reliable, but the service may occasionally
                be unavailable due to maintenance, updates, network issues, or events
                outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service when our services, policies, or legal
                requirements change. Continued use of VisualLearning after updates means
                you accept the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
              <p>
                If you have any questions about these terms, contact us at{" "}
                <a href="mailto:support@visuallearning.in" className="text-primary hover:underline">
                  support@visuallearning.in
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
