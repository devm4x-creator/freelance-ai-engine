import { NextRequest, NextResponse } from 'next/server';

interface CheckoutRequest {
  planType: 'pro' | 'business';
  period: 'monthly' | 'yearly';
  paymentMethod: 'edahabia' | 'cib' | 'baridimob';
  userId: string;
  userEmail: string;
}

// Pricing in DZD
const PRICING = {
  pro: {
    monthly: {
      amount: 2000,
      name: 'AI Freelancer Pro - Monthly',
      nameAr: 'AI Freelancer Pro - شهري',
    },
    yearly: {
      amount: 19200, // ~20% discount
      name: 'AI Freelancer Pro - Yearly',
      nameAr: 'AI Freelancer Pro - سنوي',
    },
  },
  business: {
    monthly: {
      amount: 4000,
      name: 'AI Freelancer Business - Monthly',
      nameAr: 'AI Freelancer Business - شهري',
    },
    yearly: {
      amount: 38400, // ~20% discount
      name: 'AI Freelancer Business - Yearly',
      nameAr: 'AI Freelancer Business - سنوي',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.CHARGILY_SECRET_KEY;

    if (!secretKey) {
      console.error('[Chargily] CHARGILY_SECRET_KEY not found');
      return NextResponse.json({
        success: false,
        error: 'Payment service not configured. Missing CHARGILY_SECRET_KEY.',
      }, { status: 500 });
    }

    // Validate secret key format - can be test_sk_, live_sk_, test_, or live_
    const isTestKey = secretKey.startsWith('test_sk_') || secretKey.startsWith('test_');
    const isLiveKey = secretKey.startsWith('live_sk_') || secretKey.startsWith('live_');

    if (!isTestKey && !isLiveKey) {
      console.error('[Chargily] Invalid secret key format:', secretKey.substring(0, 10));
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. Key must start with test_ or live_',
      }, { status: 500 });
    }

    const mode = isLiveKey ? 'live' : 'test';
    // Live mode URL is different - no /live/ prefix, just /api/v2
    const apiBaseUrl = isLiveKey
      ? 'https://pay.chargily.net/api/v2'
      : 'https://pay.chargily.net/test/api/v2';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aifreelancer.app';

    console.log('[Chargily] Configuration:', {
      mode,
      apiBaseUrl,
      appUrl,
      keyPrefix: secretKey.substring(0, 12) + '...',
    });

    const body = await request.json();
    // Support both old format (plan) and new format (planType + period)
    let planType = body.planType || body.plan;
    let period = body.period || 'monthly';
    const { paymentMethod, userId, userEmail } = body;

    // Handle old format where plan was 'monthly' or 'yearly'
    if (planType === 'monthly' || planType === 'yearly') {
      period = planType;
      planType = 'pro'; // Default to pro for backwards compatibility
    }

    // Validation
    if (!planType || !['pro', 'business'].includes(planType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid plan type. Must be pro or business.',
      }, { status: 400 });
    }

    if (!period || !['monthly', 'yearly'].includes(period)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid period. Must be monthly or yearly.',
      }, { status: 400 });
    }

    if (!paymentMethod || !['edahabia', 'cib', 'baridimob'].includes(paymentMethod)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment method. Must be edahabia, cib, or baridimob',
      }, { status: 400 });
    }

    const planDetails = PRICING[planType as 'pro' | 'business'][period as 'monthly' | 'yearly'];

    // Prepare checkout data according to Chargily API v2
    // Using amount + currency instead of items
    const checkoutData = {
      amount: planDetails.amount,
      currency: 'dzd',
      success_url: `${appUrl}/dashboard/upgrade/success?plan=${planType}&period=${period}`,
      failure_url: `${appUrl}/dashboard/upgrade/failed`,
      payment_method: paymentMethod === 'baridimob' ? 'edahabia' : paymentMethod,
      locale: 'ar',
      description: planDetails.name,
      metadata: {
        user_id: userId || 'guest',
        user_email: userEmail || '',
        plan_type: planType,
        period: period,
      },
    };

    console.log('[Chargily] Creating checkout with data:', JSON.stringify(checkoutData, null, 2));

    // Call Chargily API directly
    const response = await fetch(`${apiBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    console.log('[Chargily] API Response Status:', response.status);
    console.log('[Chargily] API Response:', responseText);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.errors) {
          errorMessage += ': ' + JSON.stringify(errorData.errors);
        }
      } catch {
        errorMessage = responseText || errorMessage;
      }

      console.error('[Chargily] API Error:', errorMessage);
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: response.status,
      }, { status: response.status });
    }

    const checkout = JSON.parse(responseText);

    console.log('[Chargily] Checkout created successfully:', {
      id: checkout.id,
      checkout_url: checkout.checkout_url,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id,
    });
  } catch (error: unknown) {
    console.error('[Chargily] Unexpected error:', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
