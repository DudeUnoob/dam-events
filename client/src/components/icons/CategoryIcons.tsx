'use client';

import Image from 'next/image';

type IconProps = {
  className?: string;
};

function IconImage({
  src,
  alt,
  width,
  height,
  className,
}: IconProps & { src: string; alt: string; width: number; height: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority
      className={className ?? 'object-contain'}
    />
  );
}

// Food category icon (dish)
export function FoodIcon(props: IconProps) {
  return <IconImage src="/icons/dish-3.png" alt="Food" width={63} height={62} {...props} />;
}

// Venue / Building icon
export function VenueIcon(props: IconProps) {
  return <IconImage src="/icons/Building.png" alt="Venue" width={69} height={65} {...props} />;
}

// Entertainment / Music Stool icon
export function EntertainmentIcon(props: IconProps) {
  return <IconImage src="/icons/Stool.png" alt="Entertainment" width={75} height={76} {...props} />;
}

// Rentals icon (box / vector)
export function RentalsIcon(props: IconProps) {
  return <IconImage src="/icons/Vector.png" alt="Rentals" width={49} height={63} {...props} />;
}

// Packages icon (cube)
export function PackagesIcon(props: IconProps) {
  return <IconImage src="/icons/bx-cube.png" alt="Packages" width={77} height={77} {...props} />;
}

// Brand logo icon
export function LogoIcon(props: IconProps) {
  return <IconImage src="/icons/logo.png" alt="Scout logo" width={120} height={40} {...props} />;
}

