'use client';

import Image from 'next/image';
import { useState } from 'react';

export function HeroImage() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      <div className="aspect-square relative rounded-full overflow-hidden border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        {!imageError ? (
          <Image
            src="/divij-headshot.png"
            alt="Divij Shrivastava - Senior Full-Stack Engineer"
            fill
            className="object-cover object-[center_top]"
            style={{ inset: '-1px 0 0 0', objectPosition: 'center 30%' }}
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 flex items-center justify-center">
            <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              DS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

