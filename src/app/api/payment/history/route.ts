import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required',
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error',
      }, { status: 500 });
    }

    // Fetch payments for this user
    const response = await fetch(
      `${supabaseUrl}/rest/v1/baridimob_payments?user_email=eq.${encodeURIComponent(email)}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Payment History] Fetch failed:', errorText);

      // If table doesn't exist, return empty array
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          payments: [],
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payments',
      }, { status: 500 });
    }

    const payments = await response.json();

    // Remove receipt_url from response to reduce payload size
    // (base64 images can be very large)
    const paymentsWithoutReceipt = payments.map((p: Record<string, unknown>) => ({
      id: p.id,
      customer_name: p.customer_name,
      customer_phone: p.customer_phone,
      plan: p.plan,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      // Only include receipt_url indicator, not the actual data
      receipt_url: p.receipt_url ? 'has_receipt' : null,
    }));

    return NextResponse.json({
      success: true,
      payments: paymentsWithoutReceipt,
    });

  } catch (error) {
    console.error('[Payment History] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
