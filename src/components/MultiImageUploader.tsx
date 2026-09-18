'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, Loader2, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';
import { compressImage } from '@/utils/compressImage';

interface MultiImageUploaderProps {
  currentImages?: string[];
  onUploadSuccess: (secureUrls: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUploader({
  currentImages = [],
  onUploadSuccess,
  label = 'Upload Product Images (Up to 5)',
  maxImages = 5,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviews(currentImages);
  }, [currentImages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (previews.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const newUrls: string[] = [];

      for (const file of files) {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          throw new Error(data.error || 'Failed to upload image');
        }
      }

      const updatedPreviews = [...previews, ...newUrls];
      setPreviews(updatedPreviews);
      onUploadSuccess(updatedPreviews);
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onUploadSuccess(updatedPreviews);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          <span className="text-xs text-slate-500">{previews.length}/{maxImages}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
        <div className="flex flex-wrap gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 group">
              <Image src={url} alt={`Preview ${index + 1}`} fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {previews.length < maxImages && (
            <div className="w-20 h-20 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0 border-2 border-dashed border-slate-300">
              <label
                htmlFor="multi-cloudinary-file-input"
                className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-slate-200 transition-colors rounded-xl"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </label>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || previews.length >= maxImages}
            id="multi-cloudinary-file-input"
            className="hidden"
          />

          {error && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
