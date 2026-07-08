import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How The Blockchain Library collects, uses, and safeguards your personal information when you use our platform."
      lastUpdated="July 8, 2026"
    >
      <p>
        At The Blockchain Library (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we are committed to protecting your privacy.
        This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using our website
        and services (the &ldquo;Service&rdquo;), you agree to the practices described here.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> Your name and email address when you register for an account.</li>
        <li><strong>Newsletter subscriptions:</strong> Your email address when you opt into our newsletter.</li>
        <li><strong>Correspondence:</strong> Any information you share when you contact us or submit feedback.</li>
        <li><strong>Profile preferences:</strong> Bookmarks, reading history, and learning path progress tied to your account.</li>
      </ul>
      <h3>Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, articles read, time spent, and features used.</li>
        <li><strong>Device and technical data:</strong> IP address, browser type, operating system, and referral URLs.</li>
        <li><strong>Cookies and similar technologies:</strong> See our <a href="/cookies">Cookie Policy</a> for details.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and improve the Service and your experience.</li>
        <li>To personalize content, recommendations, and learning paths.</li>
        <li>To send newsletters, updates, and important service announcements.</li>
        <li>To analyze trends, measure engagement, and understand how the Service is used.</li>
        <li>To detect, prevent, and address technical issues, fraud, or security concerns.</li>
        <li>To comply with legal obligations and enforce our Terms &amp; Conditions.</li>
      </ul>

      <h2>3. How We Share Information</h2>
      <p>We do not sell your personal information. We may share information in the following limited circumstances:</p>
      <ul>
        <li><strong>Service providers:</strong> Trusted third parties that help us operate the Service (hosting, analytics, email delivery), under appropriate confidentiality obligations.</li>
        <li><strong>Legal compliance:</strong> When required by law, court order, or to protect our rights, safety, or property.</li>
        <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to you.</li>
        <li><strong>With your consent:</strong> When you explicitly authorize a specific disclosure.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>
        We implement reasonable technical and organizational measures to protect your information against unauthorized access,
        alteration, or disclosure. However, no method of transmission or storage is completely secure, and we cannot guarantee
        absolute security.
      </p>

      <h2>5. Your Privacy Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you.</li>
        <li>Request correction of inaccurate information.</li>
        <li>Request deletion of your personal data (subject to legal retention requirements).</li>
        <li>Opt out of marketing communications at any time.</li>
        <li>Withdraw consent for cookie-based tracking.</li>
        <li>Request a portable copy of your data.</li>
      </ul>
      <p>To exercise any of these rights, please <a href="/contact">contact us</a>.</p>

      <h2>6. International Data Transfers</h2>
      <p>
        Your information may be processed in countries other than your own. Where required, we take steps to ensure such
        transfers comply with applicable data protection laws.
      </p>

      <h2>7. Children&rsquo;s Privacy</h2>
      <p>
        The Service is not directed to children under 13, and we do not knowingly collect personal information from them.
        If you believe we have collected such information, please contact us so we can delete it.
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with
        legal obligations, resolve disputes, and enforce our agreements.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will revise the &ldquo;Last updated&rdquo; date above and notify
        users of significant changes. Continued use of the Service after changes constitutes acceptance of the revised policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or our data practices, please <a href="/contact">reach out to us</a>.
      </p>
    </LegalPageLayout>
  );
}