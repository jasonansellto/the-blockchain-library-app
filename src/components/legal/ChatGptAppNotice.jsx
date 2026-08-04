import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function ChatGptAppNotice() {
  return (
    <div className="not-prose my-6 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800">
        <Shield className="w-4 h-4" /> ChatGPT App and OpenAI
      </h3>
      <p className="mt-2 text-sm text-slate-700 leading-relaxed">
        The Blockchain Library ChatGPT App is an independent third-party app available through ChatGPT. It is not created, operated, sponsored, certified, or endorsed by OpenAI. Your use of ChatGPT is governed by your agreement with OpenAI, including the{' '}
        <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline underline-offset-2">OpenAI Privacy Policy</a>{' '}
        and{' '}
        <a href="https://openai.com/policies/service-terms/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline underline-offset-2">OpenAI Service Terms</a>.
        For privacy questions or rights requests, use our{' '}
        <Link to="/contact" className="font-medium text-blue-700 underline underline-offset-2">contact page</Link>{' '}
        and select <strong>Privacy or data request</strong> as the subject.
      </p>
    </div>
  );
}