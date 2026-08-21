'use client';

import { useEffect, useRef } from 'react';

// CLS-safe AdSense slot: the container reserves its space in the
// server-rendered HTML, so the ad arriving later never shifts the layout.
// The adsbygoogle.js script is lazyOnload in the root layout, so we poll
// for it before pushing (instead of the inline push in AdSense's snippet).
//
// format="horizontal" renders 320x100 (mobile) / 728x90 (desktop) and can
// reserve as little as 100px; "auto" needs ~280px (may render a rectangle).
export default function AdSlot({
  slot,
  format = 'auto',
  minHeight = 280,
}: {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  minHeight?: number;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const w = window as any;
      if (w.adsbygoogle) {
        clearInterval(timer);
        if (!pushed.current) {
          pushed.current = true;
          try {
            w.adsbygoogle.push({});
          } catch {
            // ad push failures are non-fatal
          }
        }
      } else if (attempts > 60) {
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto mt-2 w-full max-w-3xl" style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7675040875330859"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(format === 'auto' ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  );
}
