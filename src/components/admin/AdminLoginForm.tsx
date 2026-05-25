"use client";

import React, { useState, useTransition } from 'react';
import { LockKeyhole, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        toast({ title: 'Access denied', description: 'The admin password is incorrect or not configured.' });
        return;
      }

      setPassword('');
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full rounded-[2rem] border bg-white p-8 shadow-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
          <LockKeyhole className="h-4 w-4" /> Admin access
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">Sign in to bookings</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter the admin password to view and manage reservation requests.
        </p>

        <div className="mt-8 space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-1">Admin password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-muted bg-white px-6 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter the admin password"
            required
          />
        </div>

        <Button type="submit" className="mt-6 w-full rounded-full py-7 text-base font-semibold" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Sign in
        </Button>
      </form>
    </div>
  );
}