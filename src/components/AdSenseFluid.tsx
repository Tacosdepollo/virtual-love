import React, { useEffect } from 'react';

export default function AdSenseFluid() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full bg-zinc-900/10 rounded-2xl overflow-hidden border border-zinc-800/30 p-4">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-format="fluid"
           data-ad-layout-key="-6r+ed+2n-1e-69"
           data-ad-client="ca-pub-5594071281413115"
           data-ad-slot="1757738753"></ins>
    </div>
  );
}
