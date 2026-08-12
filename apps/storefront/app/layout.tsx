import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Hyundai Motors | Sapphire Blueprint Series',
  description: 'Experience hyper-performance engineering, instant AI vehicle search, and concierge home test drives at Hyundai Motors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-[#000000] min-h-screen flex flex-col blueprint-grid">
        {children}
      </body>
    </html>
  );
}
