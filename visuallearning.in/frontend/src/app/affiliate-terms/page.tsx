import Link from "next/link";

export const metadata = {
  title: "Affiliate Program Terms — Visual Learning",
  description: "Terms and conditions for the Visual Learning affiliate program.",
};

const UPDATED = "30 July 2026";

export default function AffiliateTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/affiliate" className="text-sm font-semibold text-primary hover:underline">← Back to Affiliate</Link>
      <h1 className="mt-4 text-3xl font-black text-heading">Affiliate Program Terms</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: {UPDATED}</p>

      <div className="prose prose-sm mt-8 max-w-none text-text-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-heading [&_p]:mt-2 [&_li]:mt-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        <p>
          These terms govern participation in the affiliate program (&quot;Program&quot;) operated by
          Visual Learning AI Pvt. Ltd. (&quot;we&quot;, &quot;us&quot;, &quot;Visual Learning&quot;) for
          the platform at visuallearning.in. By applying to or participating in the Program you
          (&quot;Affiliate&quot;, &quot;you&quot;) agree to these terms.
        </p>

        <h2>1. Eligibility &amp; enrolment</h2>
        <ul>
          <li>You must have a registered Visual Learning account and provide valid payout details.</li>
          <li>Enrolment is subject to our approval, which we may grant or decline at our discretion.</li>
          <li>You are responsible for the accuracy of the details you provide, including payout information.</li>
        </ul>

        <h2>2. Referral code &amp; links</h2>
        <ul>
          <li>On approval you receive a unique referral code and link. It is personal to you and must not be transferred.</li>
          <li>A referral is valid only when a new or existing user completes a <strong>paid</strong> subscription purchase using your code or link.</li>
          <li>Free sign-ups, free content access, and trials (if any) do not earn commission.</li>
        </ul>

        <h2>3. Commission</h2>
        <ul>
          <li>You earn a commission calculated as a percentage of the amount actually paid by the referred user for a subscription, as shown on your affiliate dashboard.</li>
          <li>The default rate is <strong>20%</strong>. We may set a different rate for your account and may change rates prospectively. Changes do not affect commissions already confirmed.</li>
          <li>Commission is calculated on the net amount paid (after any discount your code gives the buyer) and excludes payment-gateway fees and taxes.</li>
          <li>The buyer discount attached to your code is set by us and may change.</li>
        </ul>

        <h2>4. Payouts</h2>
        <ul>
          <li>Commissions accrue as &quot;pending&quot; and become payable once your pending balance crosses the minimum payout threshold shown on your dashboard.</li>
          <li>Payouts are made to the payout method you provide (UPI or bank transfer), normally on a monthly cycle.</li>
          <li>You are solely responsible for any taxes on your earnings. We may withhold tax at source (e.g. TDS under applicable Indian law) and issue payouts net of such withholding.</li>
        </ul>

        <h2>5. Prohibited conduct</h2>
        <p>The following will void commissions and may lead to removal from the Program:</p>
        <ul>
          <li><strong>Self-referral</strong> — using your own code for your own purchase (this is automatically blocked).</li>
          <li>Creating fake accounts, fake orders, or otherwise manipulating referrals.</li>
          <li>Spam — unsolicited bulk email/SMS/WhatsApp/messaging, or posting your code on coupon/deal aggregator sites without our consent.</li>
          <li>Paid search or ads that bid on our brand name or that impersonate Visual Learning.</li>
          <li>Making false, misleading, or unauthorised claims about Visual Learning, its content, pricing, or exam outcomes.</li>
          <li>Any unlawful, deceptive, or harmful promotion, including to minors in a manner that violates applicable law.</li>
        </ul>

        <h2>6. Refunds &amp; chargebacks</h2>
        <p>
          If a referred purchase is refunded, reversed, or charged back, the related commission is
          cancelled. If it was already paid to you, we may deduct it from future commissions.
        </p>

        <h2>7. Suspension &amp; termination</h2>
        <ul>
          <li>Either party may end participation at any time. We may suspend or terminate your account and withhold or reverse commissions if we reasonably suspect a breach of these terms or fraudulent activity.</li>
          <li>On termination, undisputed commissions already confirmed and above the payout threshold will be paid in the normal cycle.</li>
        </ul>

        <h2>8. Relationship</h2>
        <p>
          Participation does not create an employment, agency, partnership, or franchise relationship.
          You are an independent participant and have no authority to bind Visual Learning.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these terms or the Program (including commission rates, discounts, and
          thresholds) at any time. Continued participation after a change means you accept it.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about the Program? Reach us via the <Link href="/contact" className="text-primary hover:underline">Contact</Link> page.
        </p>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          This is a general template, not legal or tax advice. Please have it reviewed by your legal
          and tax advisors before relying on it — particularly regarding TDS/GST obligations in India.
        </p>
      </div>
    </div>
  );
}
