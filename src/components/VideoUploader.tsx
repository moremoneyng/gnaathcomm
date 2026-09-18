'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, X, Video } from 'lucide-react';

interface VideoUploaderProps {
  currentVideoUrl?: string | null;
  onUploadSuccess: (secureUrl: string | null) => void;
  label?: string;
}

export function VideoUploader({
  currentVideoUrl,
  onUploadSuccess,
  label = 'Upload Product Video (Optional, max 50MB)',
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentVideoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setPreview(currentVideoUrl || null);
  }, [currentVideoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Video is too large. Please choose a video under 50 MB.');
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

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
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeVideo = () => {
    setPreview(null);
    setSuccess(false);
    onUploadSuccess(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
        {preview ? (
          <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-black shrink-0 group">
            <video src={preview} className="w-full h-full object-cover" muted loop playsInline />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
            <Video className="w-8 h-8" />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            id="cloudinary-video-input"
            className="hidden"
          />

          {!preview && (
            <label
              htmlFor="cloudinary-video-input"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Uploading Video...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Select & Upload Video</span>
                </>
              )}
            </label>
          )}

          {success && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Video uploaded to Cloudinary!</span>
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
