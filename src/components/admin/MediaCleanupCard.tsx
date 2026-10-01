'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CheckSquare, HardDrive, RefreshCw, Square, Trash2, Video } from 'lucide-react';

interface OrphanFile {
  publicId: string;
  resourceType: string;
  url: string;
  bytes: number;
  createdAt: string;
  format?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCleanupCard({ notify }: { notify: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [scan, setScan] = useState<{ totalFiles: number; orphans: OrphanFile[] } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const runScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Scan failed');
      setScan({ totalFiles: data.totalFiles, orphans: data.orphans });
      setSelected(new Set());
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Scan failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const deleteSelected = async () => {
    const ids = Array.from(selected).slice(0, 200);
    if (
      !confirm(
        `Permanently delete ${ids.length} file(s) from Cloudinary?\n\nThey are not used by any product, category or the logo, but this cannot be undone. If you used these images elsewhere (social posts, other sites), keep them.`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicIds: ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
      notify(`${data.deleted} file(s) deleted${data.skipped ? `, ${data.skipped} skipped because they are in use` : ''}`, 'success');
      await runScan();
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const orphanBytes = scan?.orphans.reduce((sum, file) => sum + file.bytes, 0) || 0;
  const allSelected = Boolean(scan && scan.orphans.length > 0 && selected.size === scan.orphans.length);

  return (
    <div className="max-w-3xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
            <HardDrive className="h-5 w-5 text-emerald-600" /> Unused photos &amp; videos
          </h3>
          <p className="mt-1 max-w-xl text-xs text-slate-500">
            Photos you remove from a product stay in Cloudinary so a mistake can always be undone. Scan to review files
            that no product, category or logo uses any more (uploaded over 24 hours ago) and free up storage. Nothing is
            deleted until you choose.
          </p>
        </div>
        <button
          type="button"
          onClick={runScan}
          disabled={isScanning}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {scan ? 'Scan again' : 'Scan for unused files'}
        </button>
      </div>

      {scan && (
        <>
          <div className="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600">
            {scan.orphans.length === 0 ? (
              <>All {scan.totalFiles} files in Cloudinary are in use. Nothing to clean up.</>
            ) : (
              <>
                <strong className="text-slate-900">{scan.orphans.length}</strong> of {scan.totalFiles} files are unused (
                {formatBytes(orphanBytes)}).
              </>
            )}
          </div>

          {scan.orphans.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(allSelected ? new Set() : new Set(scan.orphans.map((o) => o.publicId)))}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600"
                >
                  {allSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
                  Select all
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={selected.size === 0 || isDeleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-40"
                >
                  {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete {selected.size || ''} selected
                </button>
              </div>

              <div className="grid max-h-[28rem] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
                {scan.orphans.map((file) => {
                  const isSelected = selected.has(file.publicId);
                  return (
                    <button
                      key={file.publicId}
                      type="button"
                      onClick={() => toggle(file.publicId)}
                      aria-pressed={isSelected}
                      title={`${file.publicId} · ${formatBytes(file.bytes)}`}
                      className={`relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-2 transition ${
                        isSelected ? 'ring-rose-500' : 'ring-transparent hover:ring-slate-300'
                      }`}
                    >
                      {file.resourceType === 'video' ? (
                        <span className="flex h-full w-full items-center justify-center text-slate-500">
                          <Video className="h-6 w-6" />
                        </span>
                      ) : (
                        <Image src={file.url} alt="" fill sizes="120px" className="object-contain p-1" />
                      )}
                      <span className="absolute left-1 top-1 rounded bg-white/90 p-0.5">
                        {isSelected ? <CheckSquare className="h-4 w-4 text-rose-600" /> : <Square className="h-4 w-4 text-slate-400" />}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-ink-900/70 px-1 py-0.5 text-[9px] font-bold text-white">
                        {formatBytes(file.bytes)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
