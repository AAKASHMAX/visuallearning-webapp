"use client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last updated: March 12, 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                VISUALLEARNING AI PRIVATE LIMITED (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the VisualLearning platform.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <p>When you register or use our services, we may collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address</li>
                <li>Phone number</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Class and subject preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Usage Information</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Video watch history and progress</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our educational services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Track your learning progress</li>
                <li>Send important updates about your account</li>
                <li>Improve our platform and content</li>
                <li>Respond to your queries and support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal data.
                Payment processing is handled securely by Razorpay and we do not store your card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
              <p>We do not sell your personal data. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors (Razorpay) for transaction processing</li>
                <li>Cloud service providers for hosting and storage</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
              <p>
                We use cookies and similar technologies to maintain your session, remember your preferences, and improve your experience.
                You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of promotional communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
              <p>
                Our services are designed for students of Class 9-12. If a user is under 18, we recommend parental
                consent before using the platform. We do not knowingly collect data from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes
                by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:visuallearning247@gmail.com" className="text-primary hover:underline">visuallearning247@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
