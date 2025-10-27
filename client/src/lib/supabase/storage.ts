/**
 * Supabase Storage Helpers
 * Handles file uploads to Supabase Storage buckets
 */

import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type Client = SupabaseClient<Database>;

export const STORAGE_BUCKETS = {
  VENDOR_PHOTOS: 'vendor-photos',
  PACKAGE_PHOTOS: 'package-photos',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  supabase: Client,
  bucket: string,
  file: File,
  folder: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: new Error('File size exceeds 5MB limit'),
      };
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        url: null,
        error: new Error('Only JPEG, PNG, and WebP images are allowed'),
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadFiles(
  supabase: Client,
  bucket: string,
  files: File[],
  folder: string
): Promise<{ urls: string[]; errors: (Error | null)[] }> {
  const results = await Promise.all(
    files.map(file => uploadFile(supabase, bucket, file, folder))
  );

  return {
    urls: results.map(r => r.url).filter(Boolean) as string[],
    errors: results.map(r => r.error),
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  supabase: Client,
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteFiles(
  supabase: Client,
  bucket: string,
  paths: string[]
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      console.error('Delete error:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get file path from public URL
 */
export function getFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts[1] || null;
  } catch {
    return null;
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Only JPEG, PNG, and WebP are supported.`,
    };
  }

  return { valid: true };
}
