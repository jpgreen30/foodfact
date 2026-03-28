export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p><strong>Last updated:</strong> April 2025</p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>FoodFactScanner collects information you provide directly, such as when you create an account, scan baby food products, or contact us. This may include:</p>
            <ul>
              <li>Personal information (name, email, baby&apos;s birthdate)</li>
              <li>Product scan history and safety scores</li>
              <li>Device information and usage data</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information to:</p>
            <ul>
              <li>Provide and improve the FoodFactScanner service</li>
              <li>Send recall alerts and safety notifications</li>
              <li>Personalize your experience</li>
              <li>Communicate with you about updates and offers</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share with trusted service providers who assist in operating our service (e.g., Supabase for database, Brevo for email). All partners are contractually obligated to protect your data.</p>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption (256-bit SSL), secure servers, and access controls. However, no method is 100% secure.</p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>You may access, correct, or delete your personal data. To do so, contact us at privacy@foodfactscanner.com. You may also opt out of marketing communications at any time.</p>
          </section>

          <section>
            <h2>6. Children&apos;s Privacy</h2>
            <p>Our service is intended for adults (parents/guardians). We do not knowingly collect data from children under 13. If we learn we have, we will delete it promptly.</p>
          </section>

          <section>
            <h2>7. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify users of material changes via email or in-app notice. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2>8. Contact Us</h2>
            <p>For privacy concerns, email: <a href="mailto:privacy@foodfactscanner.com">privacy@foodfactscanner.com</a></p>
            <p>Mailing address: FoodFactScanner, Inc., 123 Safe Kids Lane, San Francisco, CA 94105</p>
          </section>
        </div>
      </div>
    </div>
  )
}