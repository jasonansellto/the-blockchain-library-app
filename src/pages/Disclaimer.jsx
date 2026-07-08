import React from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      description="Important disclaimers regarding the content on The Blockchain Library, including the no-financial-advice notice."
      lastUpdated="July 8, 2026"
    >
      <p>
        The information provided by The Blockchain Library (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) on this website
        is for general informational and educational purposes only. By accessing this site, you accept this Disclaimer in full.
      </p>

      <h2>1. No Financial or Investment Advice</h2>
      <p>
        All content on this website &mdash; including articles, glossary terms, guides, learning paths, and news &mdash; is
        provided strictly for educational purposes. Nothing constitutes financial, investment, trading, legal, accounting, or
        tax advice.
      </p>
      <p>
        Cryptocurrency, blockchain, and Web3 technologies involve significant risk. Markets are highly volatile, and you may
        lose some or all of your investment. You should not treat any content on this site as a recommendation to buy, sell,
        or hold any asset. Always conduct your own research and consult a licensed financial advisor before making investment
        decisions.
      </p>

      <h2>2. Accuracy of Information</h2>
      <p>
        We strive to keep content accurate and up to date, but we make no warranties, express or implied, about completeness,
        accuracy, reliability, or currency. Content may become outdated as the blockchain industry evolves rapidly. Any
        reliance you place on such information is strictly at your own risk.
      </p>

      <h2>3. External Links Disclaimer</h2>
      <p>
        This website may contain links to external websites, tools, RPC endpoints, and resources that are not provided or
        maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on
        external sites. The inclusion of links does not imply endorsement.
      </p>

      <h2>4. Affiliate Disclosure</h2>
      <p>
        Some links on this website, including those to books, courses, and tools, may be affiliate links. This means we may
        earn a commission if you make a purchase through them, at no additional cost to you. Affiliate relationships do not
        influence our editorial content, and recommendations are based on our independent assessment. We only feature products
        and services we believe provide value.
      </p>

      <h2>5. Testimonials and Examples</h2>
      <p>
        Any examples, case studies, or testimonials are illustrative and do not represent typical or guaranteed results. Past
        performance does not guarantee future results.
      </p>

      <h2>6. Technical Tools and Resources</h2>
      <p>
        Developer resources, code snippets, and RPC endpoints are provided &ldquo;as is&rdquo; for educational purposes. You are
        responsible for reviewing and testing any code or configuration before using it in production. We are not liable for
        any issues, losses, or damage arising from the use of these resources.
      </p>

      <h2>7. Professional Assistance Disclaimer</h2>
      <p>
        The content is not a substitute for professional advice. You should seek the advice of a qualified professional for
        matters specific to your situation.
      </p>

      <h2>8. Use at Your Own Risk</h2>
      <p>
        Your use of the website and any reliance on its content is solely at your own risk. To the fullest extent permitted by
        law, The Blockchain Library disclaims all liability for any losses or damages arising from your use of the site.
      </p>

      <h2>9. Changes to This Disclaimer</h2>
      <p>
        We may update this Disclaimer from time to time. The &ldquo;Last updated&rdquo; date above reflects the latest revision.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have any questions about this Disclaimer, please <a href="/contact">contact us</a>.
      </p>
    </LegalPageLayout>
  );
}