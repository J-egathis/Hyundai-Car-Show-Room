import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const baseStyle =
    'inline-flex items-center justify-center font-mono font-bold transition-all duration-300 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#003082] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#003082] text-white hover:bg-[#000000] shadow-[0_4px_20px_rgba(0,48,130,0.3)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.4)] transform hover:-translate-y-0.5',
    secondary:
      'bg-[#000000] text-white hover:bg-[#003082] border border-[#60605B]',
    outline:
      'bg-transparent text-[#003082] border-2 border-[#003082] hover:bg-[#003082] hover:text-white font-bold',
    ghost:
      'bg-transparent text-[#000000] hover:bg-[#BFBAAF]/30 hover:text-[#003082]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs uppercase tracking-wider',
    md: 'px-5 py-2.5 text-sm uppercase tracking-wider',
    lg: 'px-7 py-3.5 text-base uppercase tracking-widest font-bold',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  hoverEffect = true,
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}) {
  const hasCustomPadding = /\bp-\d+|\bpx-\d+|\bpy-\d+/.test(className);

  return (
    <div
      className={`bg-white border border-[#BFBAAF] rounded-[20px] shadow-md text-[#000000] ${
        hasCustomPadding ? '' : 'p-6'
      } ${
        hoverEffect
          ? 'transition-all duration-300 hover:border-[#003082] hover:shadow-[0_12px_30px_rgba(0,48,130,0.15)] hover:-translate-y-1'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'amber',
}: {
  children: React.ReactNode;
  variant?: 'amber' | 'titanium' | 'green' | 'blue' | 'red' | 'gray';
}) {
  const styles = {
    amber: 'bg-[#003082]/15 text-[#003082] border border-[#003082] font-extrabold',
    titanium: 'bg-[#BFBAAF]/30 text-[#000000] border border-[#60605B]/40 font-bold',
    green: 'bg-[#003082] text-white font-extrabold',
    blue: 'bg-[#BFBAAF] text-[#000000] border border-[#003082] font-bold',
    red: 'bg-red-100 text-red-800 border border-red-300 font-bold',
    gray: 'bg-[#60605B]/20 text-[#000000] border border-[#60605B] font-bold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[12px] text-xs font-semibold uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function PriceTag({ price }: { price: number }) {
  return (
    <span className="text-[#003082] font-black tracking-tight font-mono text-xl sm:text-2xl">
      ${price.toLocaleString()}
    </span>
  );
}
