import Image from 'next/image'
import Link from 'next/link'

export default function InspectorTermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/domicert-mark.svg" alt="Domicert" width={32} height={32} />
            <span className="font-medium text-gray-900">Domicert</span>
          </Link>
          <Link href="/signup" className="text-sm text-[#1D9E75] hover:underline">
            Back to signup
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">Inspector Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By creating a Domicert inspector account, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not create an account or use the Domicert platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">2. Account Eligibility</h2>
            <p>To use Domicert as an inspector you must be a qualified home inspector operating legally in your province or state. You must provide accurate information about your qualifications, license number, and business details. Domicert reserves the right to verify your credentials and suspend or terminate accounts found to contain false information.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">3. Accurate Information</h2>
            <p>You are solely responsible for the accuracy of all inspection reports submitted through Domicert. Reports must reflect actual conditions observed at the time of inspection. Submitting false, misleading, or fabricated inspection reports is grounds for immediate account termination and may result in legal action.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">4. Report Ownership & Storage</h2>
            <p>Inspection reports submitted through Domicert are stored securely and may be retained for up to 15 years. You retain ownership of the content of your reports. By submitting reports through Domicert, you grant Domicert a license to store, display, and distribute those reports to authorized parties including the homeowner named in the report.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">5. Marketplace Participation</h2>
            <p>Historical inspection reports may be made available for purchase through the Domicert marketplace. Revenue from marketplace sales will be shared with the original inspector according to the current fee schedule. Domicert reserves the right to modify marketplace terms with 30 days notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">6. Fees & Billing</h2>
            <p>Domicert offers a free trial period for new inspectors. After the trial period, per-report fees apply based on your selected tier. Fees are subject to change with 30 days notice. You are responsible for all fees incurred on your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">7. Privacy & Data</h2>
            <p>Domicert collects and stores inspection data, client information, and report content as necessary to provide the service. Client personal information (PII) is protected and will not be shared with third parties without consent except as required by law. Historical reports shared through the marketplace will have client PII removed.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>Domicert is a software platform and is not responsible for the content, accuracy, or completeness of inspection reports. Domicert is not liable for any damages arising from the use of inspection reports by homeowners, realtors, or other third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">9. Termination</h2>
            <p>Domicert reserves the right to suspend or terminate any account at any time for violation of these terms, fraudulent activity, or any other reason at our discretion. Upon termination, your reports will remain stored according to our retention policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of Ontario, Canada. Any disputes arising from these terms will be resolved in the courts of Ontario.</p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Questions about these terms? Contact us at support@domicert.ca or via the chat widget on our website.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/signup"
            className="px-6 py-2.5 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
          >
            Back to signup →
          </Link>
        </div>
      </div>
    </main>
  )
}