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
    <div className="bg-zinc-900/20 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col h-full items-center justify-center min-h-[200px]">
      <ins className="adsbygoogle w-full h-full flex-1"
           style={{ display: 'block' }}
           data-ad-format="fluid"
           data-ad-layout-key="-6r+ed+2n-1e-69"
           data-ad-client="ca-pub-5594071281413115"
           data-ad-slot="1757738753"></ins>
    </div>
  );
}
