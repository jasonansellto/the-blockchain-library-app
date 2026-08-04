import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import ChatGptAppNotice from '@/components/legal/ChatGptAppNotice';

export default function Terms() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      description="The terms and conditions that govern your use of theblockchainlibrary.com and The Blockchain Library ChatGPT App."
      effectiveDate="August 4, 2026"
      lastUpdated="August 4, 2026"
    >
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of theblockchainlibrary.com (the &ldquo;Website&rdquo;) and The Blockchain Library app available through ChatGPT (the &ldquo;ChatGPT App&rdquo;), together the &ldquo;Services.&rdquo; The Services are published and operated by Jason Ansell in Ontario, Canada.
      </p>
      <p>
        By using the Services, you agree to these Terms, our <a href="/privacy">Privacy Policy</a>, <a href="/cookies">Cookie Policy</a>, and <a href="/disclaimer">Disclaimer</a>. If you do not agree, do not use the Services.
      </p>

      <ChatGptAppNotice />

      <h2>1. Independent Third-Party ChatGPT App</h2>
      <p>
        The ChatGPT App is an independent third-party app that makes public educational Library resources available through ChatGPT. It is not created, operated, sponsored, certified, or endorsed by OpenAI, and no partnership with OpenAI is implied.
      </p>
      <p>
        Your use of ChatGPT remains subject to your agreement with OpenAI. OpenAI&rsquo;s handling of your conversation and its transmission of App Requests and App Responses is governed by the terms and privacy notices applicable to your OpenAI account or workspace, including the{' '}
        <a href="https://openai.com/policies/service-terms/" target="_blank" rel="noopener noreferrer">OpenAI Service Terms</a>.
      </p>

      <h2>2. Service Description</h2>
      <p>
        The Services provide educational material concerning blockchain, cryptocurrency, Web3, decentralized finance, artificial intelligence, software development, books, research, and related subjects.
      </p>
      <p>
        The ChatGPT App currently exposes anonymous, read-only tools that can search, retrieve, organize, and return public Library resources. It does not authenticate to private user accounts, execute code, modify repositories, make purchases, initiate financial transactions, transfer digital assets, sign blockchain messages, or take custody of funds or credentials.
      </p>
      <p>Several optional service tools are marked &ldquo;Coming soon&rdquo; and return a feature-availability notice while disabled.</p>

      <h2>3. Eligibility and Accounts</h2>
      <p>
        You must be at least 13 years old and meet the minimum age required by the laws that apply to you. Website accounts, where offered, are separate from your OpenAI account. You are responsible for protecting Website account credentials and for activity under your account.
      </p>
      <p>The ChatGPT App does not require a separate Library account or OAuth connection.</p>

      <h2>4. Acceptable Use</h2>
      <p>You must not:</p>
      <ul>
        <li>use the Services unlawfully or in violation of another person&rsquo;s rights;</li>
        <li>attempt unauthorized access, security testing, disruption, scraping at abusive scale, or circumvention of rate limits or access controls;</li>
        <li>submit malware, malicious instructions, or content intended to manipulate tool behaviour;</li>
        <li>use the App to obtain or transmit passwords, API keys, authentication tokens, private keys, seed phrases, payment card data, government identifiers, protected health information, or other restricted or highly sensitive data;</li>
        <li>misrepresent the Services as financial, legal, tax, medical, cybersecurity, or other professional advice;</li>
        <li>use Library content in violation of intellectual-property rights or applicable licence terms;</li>
        <li>impersonate another person or misrepresent your affiliation with The Blockchain Library, Jason Ansell, or OpenAI; or</li>
        <li>use the Services to facilitate a prohibited financial transaction, cryptocurrency transfer, or harmful activity.</li>
      </ul>

      <h2>5. User Inputs and App Requests</h2>
      <p>
        You are responsible for information you provide to the Website or ChatGPT. Do not include confidential, restricted, or sensitive personal data in prompts intended for the App.
      </p>
      <p>
        When ChatGPT calls an App tool, OpenAI may send a narrowly scoped App Request to our server. We process that request only to provide the requested function, maintain security, comply with law, or follow your explicit instruction. App Requests and App Responses may also be processed by OpenAI under its agreement with you or your workspace.
      </p>

      <h2>6. Educational Content &mdash; No Financial or Professional Advice</h2>
      <p>
        All content is for general educational and informational purposes. Nothing in the Services is financial, investment, trading, legal, tax, medical, accounting, cybersecurity, or other professional advice. Nothing is an offer, solicitation, endorsement, recommendation, guarantee, or instruction to buy, sell, hold, stake, bridge, transfer, or use a digital asset or financial product.
      </p>
      <p>
        Blockchain and cryptocurrency activities may involve substantial risk, including complete loss, technical failure, fraud, regulatory change, market volatility, and irreversible transactions. Conduct independent research and consult a qualified professional before acting.
      </p>

      <h2>7. AI and Automated Output</h2>
      <p>
        ChatGPT or future AI-assisted features may generate incomplete, inaccurate, outdated, or misleading output. Verify important claims against primary sources. The current &ldquo;Coming soon&rdquo; service tools are disabled and do not make an OpenAI API request through our MCP server.
      </p>
      <p>
        We do not guarantee that ChatGPT will select the correct tool, interpret a request correctly, display all returned content, or preserve the exact wording of a Library source.
      </p>

      <h2>8. Public Links, Developer Resources, and RPC Information</h2>
      <p>
        Links, code snippets, software references, SDK information, and RPC directory entries are provided for education and discovery. Verify availability, authenticity, licensing, compatibility, and security before use. Never place private keys, seed phrases, or credentials in source code or RPC requests.
      </p>
      <p>External services are governed by their own terms and privacy policies. We do not control or guarantee them.</p>

      <h2>9. Intellectual Property</h2>
      <p>
        Unless otherwise stated, the Website design, branding, original text, organization, and software are owned by or licensed to The Blockchain Library. You may use content for personal, educational, and other lawful purposes consistent with applicable licence terms and fair dealing or fair use. You may not reproduce or redistribute protected content in bulk without permission.
      </p>
      <p>Third-party materials remain the property of their respective owners.</p>

      <h2>10. User Submissions and Feedback</h2>
      <p>
        If you submit content or feedback, you retain ownership of your original content. You grant us a non-exclusive, worldwide, royalty-free licence to host, reproduce, format, display, and use it only as reasonably needed to evaluate the submission, provide the requested feature, improve the Services, or publish it when you have requested publication.
      </p>
      <p>You represent that you have the rights needed to submit the content and that it does not violate law or another person&rsquo;s rights. Do not submit confidential or sensitive personal information.</p>

      <h2>11. Availability and Changes</h2>
      <p>
        The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may add, change, suspend, restrict, or discontinue any feature, tool, content category, or integration. &ldquo;Coming soon&rdquo; is a statement of current product status, not a promise that a feature will launch by a particular date.
      </p>

      <h2>12. Disclaimers and Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we disclaim warranties of accuracy, completeness, availability, merchantability, fitness for a particular purpose, non-infringement, and uninterrupted or error-free operation.
      </p>
      <p>
        To the maximum extent permitted by law, The Blockchain Library, Jason Ansell, contributors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or financial losses arising from use of or reliance on the Services, including loss of funds, assets, data, profits, opportunities, or access. Nothing in these Terms excludes liability that cannot lawfully be excluded.
      </p>

      <h2>13. Indemnity</h2>
      <p>
        To the extent permitted by law, you agree to indemnify and hold harmless The Blockchain Library and its operator from third-party claims arising from your unlawful use of the Services, your violation of these Terms, or content you submit without necessary rights.
      </p>

      <h2>14. Termination</h2>
      <p>
        We may suspend or restrict access when reasonably necessary to protect the Services, users, third parties, or legal compliance. Provisions that by their nature should survive termination will survive.
      </p>

      <h2>15. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Ontario and the federal laws of Canada applicable there, without regard to conflict-of-law rules. Courts located in Ontario will have jurisdiction, except where applicable consumer law requires otherwise.
      </p>

      <h2>16. Changes</h2>
      <p>
        We may update these Terms. The updated version becomes effective when posted unless a later date is stated. Additional notice will be provided where required.
      </p>

      <h2>17. Contact</h2>
      <p>
        Questions about these Terms may be submitted through the <a href="/contact">/contact page</a>.
      </p>
    </LegalPageLayout>
  );
}