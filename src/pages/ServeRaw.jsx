import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function ServeRaw({ mode }) {
  const params = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let endpoint = '';
    let payload = {};

    switch (mode) {
      case 'sitemap-index':
        endpoint = 'generateSitemap';
        payload = { type: 'index' };
        break;
      case 'sitemap-type':
        endpoint = 'generateSitemap';
        payload = { type: params.type };
        break;
      case 'robots':
        endpoint = 'generateRobotsTxt';
        break;
      case 'llms':
        endpoint = 'generateLlmsTxt';
        payload = { variant: 'standard' };
        break;
      case 'llms-full':
        endpoint = 'generateLlmsTxt';
        payload = { variant: 'full' };
        break;
      case 'aitxt':
        endpoint = 'generateLlmsTxt';
        payload = { variant: 'aitxt' };
        break;
      default:
        return;
    }

    (async () => {
      try {
        const res = await base44.functions.invoke(endpoint, payload);
        const data = res.data ?? res;
        if (typeof data === 'string') {
          setContent(data);
        } else if (data?.content) {
          setContent(data.content);
        } else {
          setContent(JSON.stringify(data, null, 2));
        }
      } catch (e) {
        setContent('Error: ' + (e.message || 'Failed to load'));
      }
      setLoading(false);
    })();
  }, [mode, params.type]);

  if (loading) return null;

  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '13px', margin: 0, padding: '16px', background: '#fff', color: '#000' }}>
      {content}
    </pre>
  );
}