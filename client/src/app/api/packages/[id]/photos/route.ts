/**
 * Package Photos API
 * POST /api/packages/[id]/photos - Upload photos to package
 *
 * Note: This is a simplified version for server-side uploads.
 * For better UX, consider direct client-to-storage uploads.
 */

import { createClient } from '@/lib/supabase/route-handler';
import { STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Get package and verify ownership
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        vendors!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (pkgError) {
      return NextResponse.json(
        { data: null, error: { message: 'Package not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (pkg.vendors.user_id !== user.id) {
      return NextResponse.json(
        { data: null, error: { message: 'You can only upload photos to your own packages', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const photoUrls = formData.getAll('photoUrls');

    if (!photoUrls || photoUrls.length === 0) {
      return NextResponse.json(
        { data: null, error: { message: 'No photo URLs provided', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Convert to string array
    const urls = photoUrls.map(url => String(url));

    // Update package with new photo URLs (append to existing)
    const currentPhotos = pkg.photos || [];
    const updatedPhotos = [...currentPhotos, ...urls];

    // Limit to 15 photos max
    if (updatedPhotos.length > 15) {
      return NextResponse.json(
        { data: null, error: { message: 'Maximum 15 photos allowed per package', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { data: updatedPkg, error: updateError } = await supabase
      .from('packages')
      .update({ photos: updatedPhotos })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating package photos:', updateError);
      return NextResponse.json(
        { data: null, error: { message: updateError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { package: updatedPkg, uploadedUrls: urls }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
