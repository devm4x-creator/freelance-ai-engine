import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        error: 'No image provided',
      }, { status: 400 });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // We'll process this on the client side using canvas
    // Just return the image as-is for now
    // The client will handle white background removal

    return NextResponse.json({
      success: true,
      image: imageBase64,
    });
  } catch (error: unknown) {
    console.error('Background removal error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
