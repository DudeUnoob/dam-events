'use client';

import Link from 'next/link';
import Image from 'next/image';

// Scout Logo Icon (reused from Navigation)
const ScoutIcon = () => (
  <svg width="70" height="72" viewBox="0 0 70 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="32" width="24" height="27" rx="3" fill="#232834" transform="rotate(-90 0 32)"/>
    <rect x="45" y="72" width="24" height="27" rx="3" fill="#232834" transform="rotate(-90 45 72)"/>
    <circle cx="15" cy="14" r="7" fill="#F5C6C6"/>
    <circle cx="35" cy="34" r="7" fill="#232834"/>
    <circle cx="55" cy="58" r="7" fill="#C5D5C5"/>
    <circle cx="35" cy="54" r="7" fill="#232834"/>
  </svg>
);

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex flex-col px-8 py-8 lg:px-16 lg:py-12">
        {/* Scout Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12">
          <ScoutIcon />
          <span className="text-[48px] font-medium text-black font-urbanist">
            scout
          </span>
        </Link>

        {/* Form Content */}
        <div className="flex-1 max-w-[478px]">
          {children}
        </div>
      </div>

      {/* Right Side - Illustration Panel */}
      <div className="hidden lg:block lg:w-[624px] p-8">
        <div
          className="w-full h-full rounded-[25px] shadow-[10px_10px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden relative"
          style={{ backgroundColor: '#d8dfe9' }}
        >
          {/* Event Illustration */}
          <Image
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
            alt="Event venue with elegant setup"
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#d8dfe9]/90 via-[#d8dfe9]/30 to-transparent" />

          {/* Optional caption at bottom */}
          <div className="absolute bottom-8 left-8 right-8">
            <h3 className="text-2xl font-semibold text-slate-800">
              Find your perfect event venue
            </h3>
            <p className="mt-2 text-slate-600">
              Connect with pre-vetted vendors and plan unforgettable events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
