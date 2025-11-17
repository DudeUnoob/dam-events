import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { regenerateAllPackageEmbeddings, regenerateAllVendorEmbeddings } from '@/lib/rag/embeddings-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();
    const { type } = body; // 'packages', 'vendors', or 'all'
    
    let packagesResult = { processed: 0, failed: 0, total: 0 };
    let vendorsResult = { processed: 0, failed: 0, total: 0 };
    
    if (type === 'packages' || type === 'all' || !type) {
      packagesResult = await regenerateAllPackageEmbeddings();
    }
    
    if (type === 'vendors' || type === 'all') {
      vendorsResult = await regenerateAllVendorEmbeddings();
    }
    
    return NextResponse.json({
      success: true,
      packages: packagesResult,
      vendors: vendorsResult,
      message: `Processed ${packagesResult.processed + vendorsResult.processed} embeddings successfully`,
    });
    
  } catch (error) {
    console.error('Regenerate embeddings error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

