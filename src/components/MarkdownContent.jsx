import React from 'react';
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  a: ({ node, href, children, ...props }) => {
    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
    if (isExternal) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    }
    return <a href={href} {...props}>{children}</a>;
  }
};

export default function MarkdownContent({ children, ...props }) {
  return <ReactMarkdown components={markdownComponents} {...props}>{children}</ReactMarkdown>;
}