'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, STORAGE_BUCKETS, validateImageFile } from '@/lib/supabase/storage';

interface PhotoUploadProps {
  onUpload: (urls: string[]) => void;
  bucketName?: 'vendor-photos' | 'package-photos';
  folderId: string; // vendorId or packageId
  maxPhotos?: number;
  existingPhotos?: string[];
}

export function PhotoUpload({
  onUpload,
  bucketName = 'package-photos',
  folderId,
  maxPhotos = 15,
  existingPhotos = [],
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const filesArray = Array.from(files);
      const newPhotoUrls: string[] = [];

      // Upload files one by one with progress tracking
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          setUploading(false);
          return;
        }

        // Upload to Supabase Storage
        const { url, error: uploadError } = await uploadFile(
          supabase,
          bucketName,
          file,
          folderId
        );

        if (uploadError || !url) {
          console.error('Upload error:', uploadError);
          setError(uploadError?.message || 'Failed to upload photo');
          setUploading(false);
          return;
        }

        newPhotoUrls.push(url);

        // Update progress
        setUploadProgress(Math.round(((i + 1) / filesArray.length) * 100));
      }

      const updatedPhotos = [...photos, ...newPhotoUrls];
      setPhotos(updatedPhotos);
      onUpload(updatedPhotos);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onUpload(updatedPhotos);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={uploading || photos.length >= maxPhotos}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos ({photos.length}/{maxPhotos})
            </>
          )}
        </Button>

        {uploading && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-slate-500">
          JPG, PNG, or WebP. Max 5MB per image. Up to {maxPhotos} photos.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-primary-600 text-white text-xs font-medium">
                  Cover
                </div>
              )}
            </div>
          ))}

          {/* Add More Placeholder */}
          {photos.length < maxPhotos && (
            <button
              type="button"
              onClick={handleButtonClick}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
              disabled={uploading}
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-xs text-slate-600">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No photos uploaded yet</p>
          <p className="text-xs text-slate-500 mt-1">Click the button above to add photos</p>
        </div>
      )}
    </div>
  );
}
