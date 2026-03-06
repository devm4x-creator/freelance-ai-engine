import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey);
}

// Get user from auth header
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return user;
}

// GET - Get user's generation stats
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      // Return default stats for unauthenticated users
      return NextResponse.json({
        success: true,
        plan: 'free',
        used: 0,
        limit: 20,
        remaining: 20,
      });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      }, { status: 500 });
    }

    // Call the database function
    const { data, error } = await supabase.rpc('get_generation_stats', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Get stats error:', error);
      // Return default stats on error
      return NextResponse.json({
        success: true,
        plan: 'free',
        used: 0,
        limit: 20,
        remaining: 20,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET generations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// POST - Use a generation and log it
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      }, { status: 500 });
    }

    const body = await request.json();
    const { toolType, inputData, outputPreview, count = 1 } = body;

    if (!toolType) {
      return NextResponse.json({
        success: false,
        error: 'Tool type is required',
      }, { status: 400 });
    }

    // Call the database function to use generation(s)
    const { data, error } = await supabase.rpc('use_generation', {
      p_user_id: user.id,
      p_tool_type: toolType,
      p_input: inputData || {},
      p_output: outputPreview || '',
      p_count: Math.max(1, count), // Support multiple generations at once
    });

    if (error) {
      console.error('Use generation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to log generation',
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('POST generations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
