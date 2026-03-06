import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify Chargily webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('signature');
    const webhookSecret = process.env.CHARGILY_WEBHOOK_SECRET || process.env.CHARGILY_SECRET_KEY;

    if (!signature || !webhookSecret) {
      console.error('[Webhook] Missing signature or secret');
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const payload = await request.text();

    // Verify webhook signature
    if (!verifySignature(payload, signature, webhookSecret)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    console.log('[Webhook] Event received:', event.type, event.data?.id);

    // Handle different event types
    switch (event.type) {
      case 'checkout.paid':
        // Payment successful
        const checkoutData = event.data;
        const metadata = checkoutData.metadata;

        console.log('[Webhook] Payment successful:', {
          checkoutId: checkoutData.id,
          userId: metadata?.user_id,
          plan: metadata?.plan,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
        });

        // Update user subscription in Supabase
        if (metadata?.user_id && metadata?.plan) {
          try {
            await updateUserSubscription(metadata.user_id, metadata.plan);
            console.log('[Webhook] ✅ Subscription activated for user:', metadata.user_id);
          } catch (error) {
            console.error('[Webhook] ❌ Failed to update subscription:', error);
          }
        } else {
          console.warn('[Webhook] Missing user_id or plan in metadata');
        }

        break;

      case 'checkout.failed':
        // Payment failed
        console.log('[Webhook] Payment failed:', event.data.id);
        break;

      case 'checkout.expired':
        // Checkout expired
        console.log('[Webhook] Checkout expired:', event.data.id);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

// Helper function to update user subscription in Supabase
async function updateUserSubscription(userId: string, plan: 'monthly' | 'yearly') {
  // This will be implemented with Supabase Admin SDK
  // For now, we'll create a simple HTTP endpoint call

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Webhook] Missing Supabase credentials');
      return;
    }

    // Update user profile with Pro plan
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        plan: 'pro',
        updated_at: new Date().toISOString(),
      })
    });

    if (!response.ok) {
      throw new Error(`Supabase update failed: ${response.status}`);
    }

    console.log('[Webhook] Subscription updated successfully');
  } catch (error) {
    console.error('[Webhook] Supabase update error:', error);
    throw error;
  }
}
