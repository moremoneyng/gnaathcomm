'use client';

import React, { useState } from 'react';
import { KeyRound, RefreshCw } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none';

export function ChangePasswordCard({ notify }: { notify: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notify(data.message || 'Password updated', 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Could not update password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
      <div>
        <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
          <KeyRound className="h-5 w-5 text-emerald-600" /> Admin password
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Use at least 10 characters. Changing it signs out every other device using the old password.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pw-current" className="mb-1 block text-xs font-bold text-slate-700">Current password</label>
          <input id="pw-current" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pw-new" className="mb-1 block text-xs font-bold text-slate-700">New password</label>
          <input id="pw-new" type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="mb-1 block text-xs font-bold text-slate-700">Confirm new password</label>
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={mismatch}
            className={`${inputClass} ${mismatch ? 'border-rose-400' : ''}`}
          />
          {mismatch && <p className="mt-1 text-[11px] font-semibold text-rose-600">Passwords don&apos;t match</p>}
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={isSaving || mismatch || newPassword.length < 10}
          className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </div>
    </form>
  );
}
