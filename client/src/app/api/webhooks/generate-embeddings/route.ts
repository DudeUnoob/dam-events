import { NextRequest, NextResponse } from 'next/server';
import { generatePackageEmbedding, generateVendorEmbedding, generateEventEmbedding } from '@/lib/rag/embeddings-server';

/**
 * Webhook to automatically generate embeddings for new/updated content
 * Can be triggered by Supabase webhooks or cron jobs
 * 
 * Set WEBHOOK_SECRET in your environment variables for security
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const secret = request.headers.get('x-webhook-secret');
    if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { type, record } = body;
    
    if (!type || !record || !record.id) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected: { type, record: { id, ... } }' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Handle different entity types
    switch (type) {
      case 'package':
        result = await generatePackageEmbedding(record.id);
        break;
        
      case 'vendor':
        result = await generateVendorEmbedding(record.id);
        break;
        
      case 'event':
        result = await generateEventEmbedding(record.id);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}. Expected: package, vendor, or event` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true, 
      type,
      ...result 
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

