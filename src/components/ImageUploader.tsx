'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/utils/compressImage';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (secureUrl: string) => void;
  label?: string;
}

export function ImageUploader({
  currentImageUrl,
  onUploadSuccess,
  label = 'Upload Product Image to Cloudinary',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        setPreview(data.url);
        setSuccess(true);
        onUploadSuccess(data.url);
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
        {preview ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
            <Image src={preview} alt="Uploaded Preview" fill className="object-contain p-1" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
            <UploadCloud className="w-8 h-8" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            id="cloudinary-file-input"
            className="hidden"
          />

          <label
            htmlFor="cloudinary-file-input"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Select & Upload Image</span>
              </>
            )}
          </label>

          {success && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Image uploaded to Cloudinary!</span>
            </p>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

          {preview && (
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{preview}</p>
          )}
        </div>
      </div>
    </div>
  );
}
