'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@showroom/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Derive name from email if needed or use existing saved session
    let userName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    userName = userName.charAt(0).toUpperCase() + userName.slice(1);

    const userProfile = {
      name: userName || 'Valued Client',
      email: email.trim(),
      phone: '+1 (555) 349-9021',
      address: 'Private Executive Suite',
      memberSince: 'August 2026',
      membershipTier: 'Apex Gold VIP Member',
      memberId: `APX-VIP-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    // Save session to localStorage
    try {
      const existing = localStorage.getItem('APEX_USER_SESSION');
      if (!existing) {
        localStorage.setItem('APEX_USER_SESSION', JSON.stringify(userProfile));
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const res = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) localStorage.setItem('apex_token', data.accessToken);
      }
    } catch (err) {
      console.error(err);
    }

    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060810] font-mono">
      <Card hoverEffect={false} className="max-w-md w-full p-8 space-y-6 border-[#F5A623]/40 bg-[#0a0c14] shadow-2xl">
        <div className="text-center space-y-2">
          <Badge variant="amber">Client Sign In</Badge>
          <h1 className="text-2xl font-extrabold uppercase text-white">
            Sign In to Apex Motors
          </h1>
          <p className="text-xs text-gray-400">Access your VIP showroom profile and bookings.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 uppercase font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="client@apex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121520] text-white p-3.5 rounded-[12px] border border-[#3A3D42] outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="block text-gray-300 uppercase font-bold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121520] text-white p-3.5 rounded-[12px] border border-[#3A3D42] outline-none focus:border-[#F5A623]"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Sign In & Open My Profile
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#F5A623] hover:underline font-bold">
            Register Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
