import React from 'react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '@/components/LegalPageLayout';
import ChatGptAppNotice from '@/components/legal/ChatGptAppNotice';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How The Blockchain Library handles information when you use theblockchainlibrary.com or The Blockchain Library ChatGPT App."
      effectiveDate="August 4, 2026"
      lastUpdated="August 4, 2026"
    >
      <p>
        The Blockchain Library, published and operated by Jason Ansell in Ontario, Canada (&ldquo;The Blockchain Library,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), respects your privacy. This Privacy Policy explains how we handle information when you use theblockchainlibrary.com (the &ldquo;Website&rdquo;) or The Blockchain Library app available through ChatGPT (the &ldquo;ChatGPT App&rdquo;).
      </p>
      <p>
        The ChatGPT App is an independent third-party service. It is not created, operated, sponsored, certified, or endorsed by OpenAI. OpenAI separately processes information within ChatGPT under the terms and privacy notices that apply to your OpenAI account or workspace.
      </p>

      <ChatGptAppNotice />

      <h2>1. Scope</h2>
      <p>This Policy applies to information processed by The Blockchain Library through:</p>
      <ul>
        <li>the Website, including accounts, contact forms, newsletter subscriptions, bookmarks, reading history, and similar Website features when enabled; and</li>
        <li>the ChatGPT App&rsquo;s read-only tools and MCP server.</li>
      </ul>
      <p>
        This Policy does not govern OpenAI&rsquo;s independent processing of your ChatGPT conversations, account information, or workspace data. Review the{' '}
        <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener noreferrer">OpenAI Privacy Policy</a> and the terms applicable to your OpenAI account or workspace.
      </p>

      <h2>2. Information the ChatGPT App Receives</h2>
      <p>When you or ChatGPT invokes one of our tools, OpenAI may send our server only the inputs needed to complete that specific request. Depending on the tool, these inputs may include:</p>
      <ul>
        <li>search terms or a natural-language topic;</li>
        <li>a public The Blockchain Library resource URL or resource identifier;</li>
        <li>a Library category, topic, or result limit;</li>
        <li>a requested learning level or number of learning steps;</li>
        <li>a blockchain network, programming language, or development task;</li>
        <li>a citation style, summary audience, or requested summary length; and</li>
        <li>two to four concepts requested for comparison.</li>
      </ul>
      <p>The App returns public educational content, links, summaries of available resources, directory results, or a clear &ldquo;Coming soon&rdquo; message to ChatGPT.</p>

      <h2>3. Information the ChatGPT App Does Not Request</h2>
      <p>The ChatGPT App is currently anonymous and read-only. It does not require a separate Library account or OAuth connection. Its tool schemas do not request:</p>
      <ul>
        <li>your name, email address, phone number, postal address, or precise location;</li>
        <li>payment card or banking information;</li>
        <li>government identification numbers;</li>
        <li>health or medical information;</li>
        <li>passwords, API keys, authentication tokens, MFA or one-time codes;</li>
        <li>cryptocurrency wallet private keys, seed phrases, signing keys, or custody credentials;</li>
        <li>contacts, files, photos, or device contents;</li>
        <li>your complete ChatGPT conversation history; or</li>
        <li>permission to make purchases, send transactions, transfer cryptocurrency, modify records, or take other write actions.</li>
      </ul>
      <p>
        Do not place sensitive personal information, credentials, private keys, seed phrases, or confidential material in a request intended for the App. If sensitive information is included voluntarily, it may be transmitted to OpenAI as part of your conversation and may be included in an App Request selected by ChatGPT.
      </p>

      <h2>4. Chat History and Data Boundaries</h2>
      <p>
        The App operates only on the explicit tool arguments that ChatGPT sends for the current request. We do not pull, reconstruct, infer, or request your full chat history. We do not use App Requests to build advertising profiles or to develop models that compete with OpenAI.
      </p>
      <p>
        OpenAI controls which parts of your interaction are sent to a tool. OpenAI&rsquo;s processing of App Requests, App Responses, and conversation content is governed by its agreement with you or your workspace.
      </p>

      <h2>5. Website Information We May Collect</h2>
      <p>The Website may process the following information when you choose to use the relevant feature:</p>
      <ul>
        <li><strong>Account information:</strong> name, email address, and account settings when account registration is enabled;</li>
        <li><strong>Contact and support information:</strong> your name, email address, subject, and message when you contact us;</li>
        <li><strong>Newsletter information:</strong> your email address and subscription preferences when you opt in;</li>
        <li><strong>Saved preferences:</strong> bookmarks, reading history, learning preferences, or similar settings associated with your account;</li>
        <li><strong>Submission information:</strong> content and contact information you voluntarily submit for consideration; and</li>
        <li><strong>Technical information:</strong> IP address, browser type, device type, referral URL, timestamps, pages requested, security events, and similar server or application logs.</li>
      </ul>
      <p>We collect only information reasonably necessary to provide the feature you request, operate the Website, maintain security, comply with law, or respond to you.</p>

      <h2>6. How We Use Information</h2>
      <p>We may use information to:</p>
      <ul>
        <li>process a ChatGPT App request and return the requested public Library content;</li>
        <li>operate, maintain, secure, and troubleshoot the Website and ChatGPT App;</li>
        <li>provide accounts, bookmarks, preferences, contact, newsletter, or submission features you request;</li>
        <li>respond to questions, support requests, privacy requests, and feedback;</li>
        <li>prevent abuse, malicious requests, fraud, and security incidents;</li>
        <li>measure Website performance using aggregated or de-identified information when analytics is enabled; and</li>
        <li>comply with applicable law and enforce our Terms.</li>
      </ul>
      <p>We do not sell personal information. We do not use ChatGPT App tool inputs for cross-context behavioural advertising.</p>

      <h2>7. AI-Powered Service Tools</h2>
      <p>
        The following App tools are currently labelled &ldquo;Coming soon&rdquo; and are disabled: semantic search, resource summaries, concept comparisons, citation generation, personalized recommendations, and AI-assisted learning paths.
      </p>
      <p>
        While disabled, these tools do not send requests to an OpenAI API on our behalf and do not incur OpenAI API usage through our server. They return a feature-availability message and may return public Library search results needed to show relevant source material.
      </p>
      <p>
        Before enabling a future AI-powered feature, we will review its data flow, update this Policy if necessary, apply data minimization, and disclose any new service provider or material processing purpose before the feature is activated.
      </p>

      <h2>8. Recipients and Service Providers</h2>
      <p>We may disclose limited information to:</p>
      <ul>
        <li><strong>OpenAI:</strong> ChatGPT sends App Requests to our MCP server and receives App Responses. OpenAI independently processes that information under its agreements and privacy notices with its users and workspace customers.</li>
        <li><strong>Hosting and infrastructure providers:</strong> providers that host the Website, MCP endpoint, content, security controls, and delivery infrastructure, including Base44, OpenAI ChatGPT Sites, and Cloudflare where applicable to the deployed service.</li>
        <li><strong>Email or communication providers:</strong> only when you submit a contact request or subscribe to communications.</li>
        <li><strong>Analytics providers:</strong> only if analytics is enabled on the Website and, where required, after consent.</li>
        <li><strong>Authorities or professional advisers:</strong> when reasonably necessary to comply with law, protect rights or safety, investigate abuse, or establish or defend legal claims.</li>
        <li><strong>A successor organization:</strong> in connection with a merger, acquisition, financing, reorganization, or transfer of assets, subject to appropriate notice and safeguards.</li>
      </ul>
      <p>Service providers may process information only for their contracted purpose and under their own applicable terms and privacy obligations. We do not disclose App Requests to data brokers.</p>

      <h2>9. Retention</h2>
      <p>We apply the following retention periods:</p>
      <ul>
        <li><strong>ChatGPT App tool inputs and outputs on our MCP server:</strong> processed transiently to answer the request and not intentionally written to an application database or retained as raw prompt history after the response is returned.</li>
        <li><strong>Security and infrastructure logs under our control:</strong> retained for no more than 30 days unless a longer period is necessary to investigate abuse, a security incident, or comply with law.</li>
        <li><strong>Contact and support messages:</strong> retained for up to 24 months after the matter is closed, unless a longer period is required for legal or operational reasons.</li>
        <li><strong>Newsletter information:</strong> retained until you unsubscribe, followed by deletion or suppression within 30 days, except for a minimal suppression record needed to honour the opt-out.</li>
        <li><strong>Account and saved-preference information:</strong> retained while the account remains active and deleted or de-identified within 30 days after a verified deletion request, unless retention is required by law or to resolve a dispute.</li>
        <li><strong>Content submissions and associated permissions:</strong> retained for as long as needed to review, publish, document permissions, or address legal claims.</li>
      </ul>
      <p>Hosting providers and OpenAI may retain information under their own policies and agreements. Their retention is not controlled by this Policy.</p>

      <h2>10. Cookies and Similar Technologies</h2>
      <p>
        The ChatGPT App&rsquo;s MCP endpoint does not use Library cookies for authentication or advertising. The Website may use strictly necessary cookies and, if enabled, preference or analytics technologies as described in our <Link to="/cookies">Cookie Policy</Link>. Non-essential cookies should not be activated before consent where consent is legally required.
      </p>

      <h2>11. Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational measures designed to protect information, including HTTPS, restricted administrative access, input validation, least-privilege tool design, read-only App functions, and data-minimization practices. No system is completely secure, and we cannot guarantee absolute security.
      </p>
      <p>
        If we discover a breach affecting personal information or App Requests, we will investigate, contain, document, and provide notifications where required by law or applicable platform terms.
      </p>

      <h2>12. International Processing</h2>
      <p>
        OpenAI and our infrastructure providers may process information in Canada, the United States, or other countries. Where required, we rely on lawful transfer mechanisms and contractual safeguards. Privacy laws in those countries may differ from those where you live.
      </p>

      <h2>13. Your Choices and Rights</h2>
      <p>Depending on your location, you may have the right to request access, correction, deletion, portability, restriction, objection, or withdrawal of consent. You may also:</p>
      <ul>
        <li>unsubscribe from marketing communications;</li>
        <li>manage Website cookie choices;</li>
        <li>delete or update your Website account information when account controls are available;</li>
        <li>disable or remove the ChatGPT App through ChatGPT settings; and</li>
        <li>use your OpenAI privacy and data controls for information processed by OpenAI.</li>
      </ul>
      <p>
        Submit a request through our <Link to="/contact">/contact page</Link> using the subject <strong>Privacy or data request</strong>. We may need to verify your identity before completing a request. Because the ChatGPT App is anonymous and does not maintain a prompt-history database, we may not be able to identify or retrieve a transient App Request. For ChatGPT conversation data, submit the request directly to OpenAI.
      </p>

      <h2>14. Children</h2>
      <p>
        The Website and ChatGPT App are not directed to children under 13 or under the minimum age required by applicable law. Do not submit personal information about a child through the App. We do not knowingly collect personal information from children through App tools.
      </p>

      <h2>15. Changes to This Policy</h2>
      <p>
        We may update this Policy when our practices, tools, providers, or legal obligations change. We will post the revised version with a new &ldquo;Last updated&rdquo; date and provide additional notice when required.
      </p>

      <h2>16. Contact</h2>
      <p>
        The Blockchain Library<br />
        Published and operated by Jason Ansell<br />
        Ontario, Canada
      </p>
      <p>
        For privacy questions or rights requests, use the <Link to="/contact">/contact page</Link> and select <strong>Privacy or data request</strong>.
      </p>
    </LegalPageLayout>
  );
}