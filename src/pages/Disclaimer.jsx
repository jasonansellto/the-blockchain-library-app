import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';
import ChatGptAppNotice from '@/components/legal/ChatGptAppNotice';

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      description="Important disclaimers regarding the content on The Blockchain Library Website and ChatGPT App."
      effectiveDate="August 4, 2026"
      lastUpdated="August 4, 2026"
    >
      <p>
        The Blockchain Library provides general educational and informational content. This Disclaimer applies to the Website and The Blockchain Library app available through ChatGPT.
      </p>

      <ChatGptAppNotice />

      <h2>1. Independent ChatGPT App</h2>
      <p>
        The ChatGPT App is independently published and operated by The Blockchain Library and Jason Ansell. It is not created, operated, sponsored, certified, or endorsed by OpenAI. ChatGPT is an OpenAI service, and your use of ChatGPT is governed by your agreement with OpenAI.
      </p>

      <h2>2. No Financial, Investment, Legal, Tax, or Professional Advice</h2>
      <p>
        Nothing provided by the Website, the App, ChatGPT, or a returned Library resource is financial, investment, trading, legal, tax, medical, accounting, cybersecurity, or other professional advice. Nothing is an offer, solicitation, recommendation, endorsement, guarantee, or instruction to buy, sell, hold, stake, bridge, transfer, or use any asset, token, protocol, software, or service.
      </p>

      <h2>3. Digital-Asset Risk</h2>
      <p>
        Blockchain, cryptocurrency, decentralized finance, smart contracts, wallets, bridges, exchanges, and related technologies may involve extreme volatility, fraud, technical failure, smart-contract vulnerabilities, loss of access, regulatory change, and irreversible transactions. You may lose some or all funds or data. Conduct independent research and consult qualified professionals.
      </p>

      <h2>4. ChatGPT and Automated Output</h2>
      <p>
        ChatGPT may select a tool, interpret a request, summarize a source, or present an App Response in a way that is incomplete, inaccurate, outdated, or misleading. Always open and review the cited source. The Blockchain Library does not control OpenAI&rsquo;s model output, conversation retention, interface, or service availability.
      </p>
      <p>
        The App operates only on explicit tool inputs sent by ChatGPT and does not access your full conversation history.
      </p>

      <h2>5. Coming-Soon Tools</h2>
      <p>
        Semantic search, resource summaries, concept comparisons, citation generation, personalized recommendations, and AI-assisted learning paths are currently disabled and labelled &ldquo;Coming soon.&rdquo; They return a feature-availability notice and do not make an OpenAI API request through our MCP server while disabled. Their presence does not promise a release date or future availability.
      </p>

      <h2>6. Accuracy and Timeliness</h2>
      <p>
        We try to provide useful sources but do not guarantee accuracy, completeness, availability, currency, or fitness for a particular purpose. Blockchain data, links, software, documentation, RPC endpoints, fees, laws, markets, and technical requirements can change without notice.
      </p>

      <h2>7. Code, RPC, and Developer Resources</h2>
      <p>
        Code snippets, SDK references, configuration examples, contract addresses, and RPC directory information are educational. Review, test, audit, and verify all code and endpoints before use. Never include a private key, seed phrase, password, API key, or signing secret in code, prompts, URLs, logs, or RPC requests.
      </p>

      <h2>8. External Links and Third-Party Services</h2>
      <p>
        The Services may link to third-party websites, protocols, applications, books, providers, and developer tools. We do not control or warrant them. A link does not imply endorsement. Review the third party&rsquo;s current terms, privacy policy, security practices, and applicable fees.
      </p>

      <h2>9. Affiliate Disclosure</h2>
      <p>
        Some Website links may be affiliate links. We may receive compensation if you complete a qualifying action, at no additional cost to you. Affiliate relationships do not change our obligation to identify educational content honestly. ChatGPT App tool inputs are not sold or used for targeted advertising.
      </p>

      <h2>10. No Custody or Transactions</h2>
      <p>
        The App does not hold funds, connect to a wallet, request signing authority, initiate transfers, execute trades, make purchases, or provide custody. Never send funds or credentials to anyone claiming that the App requires them.
      </p>

      <h2>11. Use at Your Own Risk</h2>
      <p>
        You are responsible for evaluating information and decisions. To the maximum extent permitted by law, use of and reliance on the Services is at your own risk. See the <a href="/terms">Terms &amp; Conditions</a> for additional limitations.
      </p>

      <h2>12. Changes and Contact</h2>
      <p>
        We may update this Disclaimer. Questions can be submitted through the <a href="/contact">/contact page</a>.
      </p>
    </LegalPageLayout>
  );
}