import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function AppPromo() {
  const phoneImg = 'https://xhibiter-next-appdir.vercel.app/_next/image?url=%2Fimg%2Fmobile_app_iphone.png&w=750&q=75';

  return (
    <Card className="flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-4">
          Download Xhibiter app<br />
          to track your NFT portfolio and discover drops
        </h3>
        <div className="flex space-x-4">
          <Button>App Store</Button>
          <Button variant="outline">Google Play</Button>
        </div>
      </div>
      <img
        src={phoneImg}
        alt="Xhibiter mobile app"
        className="w-64 h-auto"
      />
    </Card>
  );
}