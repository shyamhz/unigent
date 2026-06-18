'use client';

import { useRef, useEffect, useState } from 'react';

interface EmailBodyIframeProps {
  html: string;
  className?: string;
}

export default function EmailBodyIframe({ html, className }: EmailBodyIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const measure = () => {
        const b = doc.body;
        const h = doc.documentElement;
        setHeight(Math.max(b.scrollHeight, b.offsetHeight, h.scrollHeight, h.offsetHeight));
      };

      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(doc.body);
      ro.observe(doc.documentElement);

      return () => ro.disconnect();
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [html]);

  return (
    <div className={`flex justify-center ${className ?? ''}`}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-same-origin allow-scripts"
        scrolling="no"
        className="w-full border-0 bg-transparent"
        style={{ height: height || 'auto', minHeight: height ? undefined : 100 }}
        title="Email content"
      />
    </div>
  );
}
