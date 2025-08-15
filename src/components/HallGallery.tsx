import React from 'react';

interface HallGalleryProps {
  imageUrl: string;
  name: string;
}

export function HallGallery({ imageUrl, name }: HallGalleryProps) {
  return (
    <div className="relative h-96">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}