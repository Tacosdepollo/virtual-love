import React, { useEffect } from 'react';

export default function AdSenseFluid() {
  useEffect(() => {
    let timeoutId = setTimeout(() => {
      try {
        const ads = document.getElementsByClassName("adsbygoogle");
        let unprocessedAds = 0;
        for (let i = 0; i < ads.length; i++) {
          if (!ads[i].hasAttribute("data-adsbygoogle-status")) {
            unprocessedAds++;
          }
        }
        if (unprocessedAds > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e: any) {
        if (!e.message?.includes("already have ads")) {
          console.warn("AdSense error:", e.message);
        }
      }
    }, 250);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="bg-zinc-900/20 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col h-full items-center justify-center min-h-[250px]" style={{ minWidth: '250px', width: '100%' }}>
      <ins className="adsbygoogle w-full h-full flex-1"
           style={{ display: 'block', minWidth: '250px' }}
           data-ad-format="fluid"
           data-ad-layout-key="-6r+ed+2n-1e-69"
           data-ad-client="ca-pub-5594071281413115"
           data-ad-slot="1757738753"></ins>
    </div>
  );
}
