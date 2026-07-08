import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      description="How The Blockchain Library uses cookies and similar technologies, and how you can manage them."
      lastUpdated="July 8, 2026"
    >
      <p>
        This Cookie Policy explains how The Blockchain Library (&ldquo;we&rdquo;, &ldquo;us&rdquo;) uses cookies and similar
        technologies on our website. This policy should be read alongside our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by the websites you visit. They are widely used to make websites
        function efficiently and to provide reporting and personalization. Cookies do not harm your device and do not, by
        themselves, identify you personally.
      </p>

      <h2>2. Types of Cookies We Use</h2>
      <h3>Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the website to function. They enable core features such as security, session
        management, and access to authenticated areas. The Service cannot work properly without them.
      </p>
      <h3>Performance and Analytics Cookies</h3>
      <p>
        These cookies help us understand how visitors interact with the site &mdash; which pages are popular, where traffic
        comes from, and where errors occur. This information is aggregated and used to improve the Service.
      </p>
      <h3>Functionality Cookies</h3>
      <p>
        These cookies remember your preferences and settings, such as language, reading history, and bookmarks, to provide a
        more personalized experience.
      </p>
      <h3>Targeting and Advertising Cookies</h3>
      <p>
        Where applicable, these cookies may be used to deliver relevant content or advertising. They may be set by us or by
        third-party advertising partners.
      </p>

      <h2>3. Third-Party Cookies</h2>
      <p>
        We may use third-party services (such as analytics or email providers) that set their own cookies. These third parties
        have their own privacy and cookie policies governing how they use the data collected. We encourage you to review them.
      </p>

      <h2>4. Managing Cookies</h2>
      <p>You have several options for managing cookies:</p>
      <ul>
        <li><strong>Browser settings:</strong> Most browsers let you accept, block, or delete cookies through their settings. See your browser&rsquo;s help documentation.</li>
        <li><strong>Opt-out tools:</strong> Industry opt-out tools may be available for certain advertising cookies.</li>
        <li><strong>Account preferences:</strong> Where we offer preference controls, you can adjust them in your account.</li>
      </ul>
      <p>
        Please note that disabling strictly necessary cookies may prevent the Service from functioning correctly, and some
        features may become unavailable.
      </p>

      <h2>5. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy as our use of cookies changes or for legal reasons. The &ldquo;Last updated&rdquo; date
        above reflects the latest revision. We encourage you to review this page periodically.
      </p>

      <h2>6. Contact</h2>
      <p>
        For questions about our use of cookies, please <a href="/contact">contact us</a>.
      </p>
    </LegalPageLayout>
  );
}