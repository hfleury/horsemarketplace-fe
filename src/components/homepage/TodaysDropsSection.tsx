import React from 'react';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import Avatar from '../ui/Avatar';

const avatars = [
  '/img/avatars/avatar_1.jpg',
  '/img/avatars/avatar_2.jpg',
  '/img/avatars/avatar_3.jpg',
  '/img/avatars/avatar_4.jpg',
].map(url => `https://xhibiter-next-appdir.vercel.app/_next/image?url=${encodeURIComponent(url)}&w=96&q=75`);

export default function TodaysDropsSection() {
  return (
    <Card>
      <SectionTitle title="Today's Drops" className="mb-6" />
      <div className="flex justify-center space-x-4">
        {avatars.map((src, i) => (
          <Avatar key={i} src={src} size="md" />
        ))}
      </div>
    </Card>
  );
}