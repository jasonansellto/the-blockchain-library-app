import React, { useState } from 'react';

// Renders `children` (the image frame) only while the image can load.
// If the URL is missing or the image fails, the whole frame disappears
// instead of showing a broken-image icon in an empty box.
export default function SafeImage({ src, alt = '', className = '', frameClassName = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <div className={frameClassName}>
      <img src={src} alt={alt} className={className} loading={loading} onError={() => setFailed(true)} />
    </div>
  );
}
