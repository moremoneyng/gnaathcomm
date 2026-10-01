'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, AlertCircle, ChevronLeft, ChevronRight, Star, Trash2, Undo2, ImagePlus } from 'lucide-react';
import { compressImage } from '@/utils/compressImage';

interface MultiImageUploaderProps {
  currentImages?: string[];
  /** Called with the full, ordered image list after every upload, removal or reorder. */
  onUploadSuccess: (secureUrls: string[]) => void;
  label?: string;
  maxImages?: number;
  /** Shown under the grid, e.g. to explain that changes apply on save. */
  hint?: string;
}

export function MultiImageUploader({
  currentImages = [],
  onUploadSuccess,
  label = 'Upload Product Images (Up to 5)',
  maxImages = 5,
  hint,
}: MultiImageUploaderProps) {
  const inputId = useId();
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{ url: string; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Uploads are sequential; always build on the newest list so removals during an upload stick.
  const imagesRef = useRef(currentImages);
  useEffect(() => {
    imagesRef.current = currentImages;
  }, [currentImages]);

  const update = (next: string[]) => {
    imagesRef.current = next;
    onUploadSuccess(next);
  };

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (!images.length) {
      setError('Please choose image files (JPG, PNG or WebP).');
      return;
    }

    const room = maxImages - imagesRef.current.length;
    if (room <= 0) {
      setError(`This product already has the maximum of ${maxImages} images. Remove one first.`);
      return;
    }

    const queue = images.slice(0, room);
    setError(images.length > room ? `Only ${room} more image${room === 1 ? '' : 's'} can be added (max ${maxImages}).` : null);
    setLastRemoved(null);
    setUploadProgress({ done: 0, total: queue.length });

    for (const [index, file] of queue.entries()) {
      try {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressedFile);

        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok || !data.success || !data.url) {
          throw new Error(data.error || 'Failed to upload image');
        }
        update([...imagesRef.current, data.url]);
      } catch (err: unknown) {
        setError(`${file.name}: ${err instanceof Error ? err.message : 'Upload error'}`);
      } finally {
        setUploadProgress({ done: index + 1, total: queue.length });
      }
    }

    setUploadProgress(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length) await uploadFiles(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploadProgress) return;
    await uploadFiles(Array.from(e.dataTransfer.files || []));
  };

  const removeImage = (index: number) => {
    const list = imagesRef.current;
    setLastRemoved({ url: list[index], index });
    setError(null);
    update(list.filter((_, i) => i !== index));
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    const list = [...imagesRef.current];
    if (list.length >= maxImages || list.includes(lastRemoved.url)) {
      setLastRemoved(null);
      return;
    }
    list.splice(Math.min(lastRemoved.index, list.length), 0, lastRemoved.url);
    update(list);
    setLastRemoved(null);
  };

  const moveImage = (from: number, to: number) => {
    const list = [...imagesRef.current];
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    update(list);
  };

  const isUploading = uploadProgress !== null;
  const canAddMore = currentImages.length < maxImages;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
            {label}
          </label>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {currentImages.length}/{maxImages}
          </span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (canAddMore) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-3 transition sm:p-4 ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {currentImages.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
              <Image src={url} alt={`Image ${index + 1}`} fill sizes="140px" className="object-contain p-1.5" />

              {index === 0 && maxImages > 1 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                title="Remove image"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {currentImages.length > 1 && (
                <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-slate-200">
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move image ${index + 1} left`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-25"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 0)}
                      aria-label={`Make image ${index + 1} the cover`}
                      title="Make cover image"
                      className="flex h-6 items-center gap-0.5 rounded-full px-1.5 text-[9px] font-bold text-amber-600 hover:bg-amber-50"
                    >
                      <Star className="h-3 w-3" />
                      <span className="hidden sm:inline">Cover</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === currentImages.length - 1}
                    aria-label={`Move image ${index + 1} right`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-25"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {canAddMore && (
            <label
              htmlFor={inputId}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-center text-slate-500 transition hover:border-emerald-500 hover:text-emerald-600 ${
                isUploading ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              {uploadProgress ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  <span className="text-[10px] font-bold">
                    {uploadProgress.done}/{uploadProgress.total}
                  </span>
                </>
              ) : currentImages.length === 0 ? (
                <>
                  <UploadCloud className="h-6 w-6" />
                  <span className="px-1 text-[10px] font-bold">Add photos</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-[10px] font-bold">Add more</span>
                </>
              )}
            </label>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          multiple={maxImages > 1}
          onChange={handleFileChange}
          disabled={isUploading || !canAddMore}
          id={inputId}
          className="sr-only"
        />

        <p className="mt-3 text-[11px] text-slate-500">
          {hint ||
            (maxImages > 1
              ? 'Drag photos here or tap “Add”. The first image is the cover shown in the shop. Use the arrows to reorder.'
              : 'Drag an image here or tap to upload.')}
        </p>
      </div>

      {lastRemoved && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-ink-900 px-3.5 py-2.5 text-xs text-white">
          <span>Image removed.</span>
          <button type="button" onClick={undoRemove} className="inline-flex items-center gap-1 font-bold text-brand-green hover:text-white">
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-start gap-1.5 text-xs font-semibold text-rose-600" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
