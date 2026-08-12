'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@showroom/ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    const userProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 987-6543',
      address: 'Private Executive Suite',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      membershipTier: 'Apex VIP Club Member',
      memberId: `APX-VIP-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    // Save session to localStorage
    try {
      localStorage.setItem('APEX_USER_SESSION', JSON.stringify(userProfile));
    } catch (err) {
      console.error(err);
    }

    try {
      const res = await fetch('http://localhost:3333/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
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
          <Badge variant="amber">Client Registration</Badge>
          <h1 className="text-2xl font-extrabold uppercase text-white">
            Create Account
          </h1>
          <p className="text-xs text-gray-400">Join the exclusive Apex Luxury Motors platform.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 uppercase mb-1 font-bold">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121520] text-white p-3.5 rounded-[12px] border border-[#3A3D42] outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="block text-gray-300 uppercase mb-1 font-bold">Email Address</label>
            <input
              type="email"
              required
              placeholder="client@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121520] text-white p-3.5 rounded-[12px] border border-[#3A3D42] outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="block text-gray-300 uppercase mb-1 font-bold">Phone Number (Optional)</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#121520] text-white p-3.5 rounded-[12px] border border-[#3A3D42] outline-none focus:border-[#F5A623]"
            />
          </div>

          <div>
            <label className="block text-gray-300 uppercase mb-1 font-bold">Password</label>
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
            Register & Open My Profile
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-[#F5A623] hover:underline font-bold">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
}
