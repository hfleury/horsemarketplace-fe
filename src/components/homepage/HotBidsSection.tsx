import React from 'react';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';

export default function HotBidsSection() {
  // Replace with real data later
  const gradientImg = 'https://xhibiter-next-appdir.vercel.app/_next/image?url=%2Fimg%2Fgradient_light.jpg&w=1920&q=75';

  return (
    <Card className="relative overflow-hidden">
      <SectionTitle title="Hot Bids" className="mb-6" />
      <img
        src={gradientImg}
        alt="Hot Bids"
        className="w-full h-auto rounded-2xl"
      />
    </Card>
  );
}