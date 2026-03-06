import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const receipt = formData.get('receipt') as File;
    const customerName = formData.get('customerName') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const plan = formData.get('plan') as string;
    const amount = formData.get('amount') as string;
    const userEmail = formData.get('userEmail') as string;
    const userId = formData.get('userId') as string;

    console.log('[BaridiMob] Received payment submission:', {
      customerName,
      customerPhone,
      plan,
      amount,
      userEmail,
      hasReceipt: !!receipt,
    });

    // Validation
    if (!receipt || !customerName || !customerPhone || !plan || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required',
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[BaridiMob] Missing Supabase credentials');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials',
      }, { status: 500 });
    }

    // Convert file to base64 data URL
    const bytes = await receipt.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const receiptDataUrl = `data:${receipt.type};base64,${base64}`;

    console.log('[BaridiMob] Receipt converted to base64, size:', receiptDataUrl.length);

    // Save to database with receipt as data URL
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/baridimob_payments`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: userId || null,
          user_email: userEmail,
          customer_name: customerName,
          customer_phone: customerPhone,
          plan: plan,
          amount: parseInt(amount),
          receipt_url: receiptDataUrl,
          status: 'pending',
        }),
      }
    );

    const responseText = await insertResponse.text();
    console.log('[BaridiMob] Database response status:', insertResponse.status);

    if (!insertResponse.ok) {
      console.error('[BaridiMob] Database insert failed:', responseText);
      return NextResponse.json({
        success: false,
        error: `Database error: ${responseText}`,
      }, { status: 500 });
    }

    let paymentRecord;
    try {
      paymentRecord = JSON.parse(responseText);
    } catch {
      paymentRecord = [{ id: 'unknown' }];
    }

    console.log('[BaridiMob] Payment saved:', paymentRecord[0]?.id);

    // Send email notification
    await sendEmailNotification({
      customerName,
      customerPhone,
      userEmail,
      plan,
      amount,
      receiptDataUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully',
      paymentId: paymentRecord[0]?.id,
    });

  } catch (error) {
    console.error('[BaridiMob] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function sendEmailNotification(data: {
  customerName: string;
  customerPhone: string;
  userEmail: string;
  plan: string;
  amount: string;
  receiptDataUrl: string;
}) {
  const { customerName, customerPhone, userEmail, plan, amount, receiptDataUrl } = data;

  console.log('[BaridiMob] Sending email notification...');

  try {
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AI Freelancer <onboarding@resend.dev>',
          to: 'support@aifreelancer.app',
          subject: `New BaridiMob Payment - ${customerName}`,
          html: `
            <h2>New BaridiMob Payment Submission</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer Name</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>User Email</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Plan</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${plan}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${amount} DZD</td>
              </tr>
            </table>
            <h3>Receipt Image:</h3>
            <img src="${receiptDataUrl}" alt="Receipt" style="max-width: 400px; border: 1px solid #ddd; border-radius: 8px;" />
            <p style="color: #666; font-size: 12px;">Please review and approve/reject in the admin panel.</p>
          `,
        }),
      });

      if (response.ok) {
        console.log('[BaridiMob] Email sent successfully');
      } else {
        const errorText = await response.text();
        console.error('[BaridiMob] Email failed:', errorText);
      }
    } else {
      console.log('[BaridiMob] No RESEND_API_KEY configured, skipping email');
    }
  } catch (emailError) {
    console.error('[BaridiMob] Email error:', emailError);
  }
}
