import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import ChatGptAppNotice from '@/components/legal/ChatGptAppNotice';

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      description="How The Blockchain Library uses cookies and similar technologies on the Website."
      effectiveDate="August 4, 2026"
      lastUpdated="August 4, 2026"
    >
      <p>
        This Cookie Policy explains how The Blockchain Library uses cookies and similar technologies on the Website. It should be read with our <a href="/privacy">Privacy Policy</a>.
      </p>

      <ChatGptAppNotice />

      <h2>1. ChatGPT App</h2>
      <p>
        The Blockchain Library&rsquo;s ChatGPT App and MCP endpoint do not use Library cookies to identify a user, authenticate a Library account, personalize advertising, or track activity across websites. ChatGPT and OpenAI may use their own cookies and technologies when you use ChatGPT. Those technologies are controlled by OpenAI and are described in OpenAI&rsquo;s privacy and cookie notices.
      </p>
      <p>
        Opening a public theblockchainlibrary.com link returned by the App takes you to the Website, where this Cookie Policy applies.
      </p>

      <h2>2. What Cookies Are</h2>
      <p>
        Cookies are small files stored by a website on a browser or device. Similar technologies include local storage, pixels, tags, and software development kit identifiers. They can support security, sessions, preferences, performance measurement, and advertising.
      </p>

      <h2>3. Cookie Categories</h2>
      <p>The Website may use:</p>
      <h3>Strictly Necessary</h3>
      <p>
        Required for security, network delivery, authentication, session management, consent choices, and core site functions. These cannot always be disabled through our interface.
      </p>
      <h3>Functional or Preference</h3>
      <p>
        Remember optional settings such as display preferences, language, bookmarks, or account choices. Where required, these are activated only after consent.
      </p>
      <h3>Analytics or Performance</h3>
      <p>
        Help us understand aggregated Website traffic, page performance, errors, and feature use. Where required, these are activated only after consent. The ChatGPT App&rsquo;s tool inputs must not be used for cross-context behavioural profiling.
      </p>
      <h3>Advertising or Targeting</h3>
      <p>
        Used only if specifically disclosed and enabled. These must not be activated before consent where consent is required. We do not use ChatGPT App tool inputs for targeted advertising.
      </p>

      <h2>4. Current Cookie Inventory</h2>
      <p>
        We currently use only strictly necessary technologies. If non-essential cookies are deployed in future, a live inventory will be generated from the production Website configuration, showing for every cookie or similar technology its name, provider, category, purpose, first-party or third-party status, and duration. No placeholder providers or cookies will be published.
      </p>

      <h2>5. Consent and Controls</h2>
      <p>Where required by law:</p>
      <ul>
        <li>non-essential cookies remain off until the user makes a choice;</li>
        <li>Reject non-essential must be as easy to select as Accept all;</li>
        <li>users can choose categories separately;</li>
        <li>consent is not inferred from silence or continued browsing;</li>
        <li>the footer contains a persistent Cookie settings link; and</li>
        <li>withdrawing consent is as easy as granting it.</li>
      </ul>
      <p>
        You can also use browser controls to block or delete cookies. Blocking strictly necessary technologies may prevent some Website features from working.
      </p>

      <h2>6. Third Parties</h2>
      <p>
        Third-party services may set their own technologies when enabled. Their use is governed by their privacy notices. Every active third party will be listed in the cookie inventory with a link to its policy. Advertising, embedded media, or analytics providers will not be loaded before required consent.
      </p>

      <h2>7. Retention</h2>
      <p>
        Cookie duration is shown in the current cookie inventory. Consent records are retained only as long as necessary to demonstrate and honour a user&rsquo;s choice. Analytics retention matches the Privacy Policy and the configured provider setting.
      </p>

      <h2>8. Changes and Contact</h2>
      <p>
        We may update this Policy when technologies or legal requirements change. Questions or requests can be submitted through the <a href="/contact">/contact page</a> using the subject <strong>Privacy or data request</strong>.
      </p>
    </LegalPageLayout>
  );
}