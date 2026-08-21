'use client';

import { useEffect, useRef } from 'react';

// AdSense's documented multi-size pattern: two FIXED-size units switched by
// CSS media query — 320x100 on mobile, 728x90 on desktop. Each <ins> is
// always in the DOM with its exact size reserved, so the ad arriving never
// shifts the layout. Both units are processed by one push() after the
// lazyOnload script becomes available.
export default function AdSlotDual({
  mobileSlot,
  desktopSlot,
}: {
  mobileSlot: string;
  desktopSlot: string;
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
    <div className="mx-auto mt-2 w-full max-w-3xl">
      {/* Mobile: 320x100 */}
      <div className="flex justify-center md:hidden" style={{ minHeight: 100 }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: 320, height: 100 }}
          data-ad-client="ca-pub-7675040875330859"
          data-ad-slot={mobileSlot}
        />
      </div>
      {/* Desktop: 728x90 */}
      <div className="hidden md:flex justify-center" style={{ minHeight: 90 }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: 728, height: 90 }}
          data-ad-client="ca-pub-7675040875330859"
          data-ad-slot={desktopSlot}
        />
      </div>
    </div>
  );
}
