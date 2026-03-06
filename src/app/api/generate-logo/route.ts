import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const KREA_API_BASE = 'https://api.krea.ai';

// Create admin client for server-side operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey);
}

interface LogoGenerationParams {
  prompt?: string;
  logoName?: string;
  slogan?: string;
  businessType?: string;
  style: string;
  colorScheme: string;
  includeText: boolean;
  variationIndex?: number;
}

interface KreaJobResponse {
  job_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  type?: string;
  result: {
    urls?: string[];
    error?: string;
  } | null;
}

// Detect if text contains Arabic characters
function containsArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

// Enhanced prompt rules for Seedream 4 (optimized for text rendering)
const QUALITY_CORE = "Professional logo design, clean white #FFFFFF background, vector-style graphics, ultra sharp, 8K resolution, centered composition, perfect symmetry, high contrast, Fortune 500 quality branding";
const TYPOGRAPHY_CORE = "Typography must be crisp, clear, legible, properly kerned, modern sans-serif or serif typeface, exact spelling, balanced proportions, professional font rendering";
const ARABIC_CORE = "Arabic text rendered right-to-left (RTL), properly connected Arabic letters, elegant modern Arabic typography, Kufi or Naskh style calligraphy";
const LOGO_RULES = "Single logo design only, no mockups, no multiple versions, no watermarks, isolated on pure white background, suitable for business use";

// Style mappings for better visual consistency
const styleKeywords: Record<string, string> = {
  'modern': 'sleek, minimal, contemporary, clean lines, geometric',
  'classic': 'timeless, elegant, traditional, refined, sophisticated',
  'minimalist': 'ultra-minimal, simple, essential, breathing space, less is more',
  'playful': 'friendly, approachable, rounded shapes, warm, inviting',
  'tech': 'futuristic, innovative, digital, cutting-edge, dynamic',
  'luxury': 'premium, exclusive, high-end, gold accents, refined details',
  'vintage': 'retro-inspired, nostalgic, classic charm, heritage feel',
  'bold': 'strong, impactful, confident, powerful presence, striking'
};

// Color scheme descriptions for better color accuracy
const colorDescriptions: Record<string, string> = {
  'blue': 'professional blue tones, corporate blue, trustworthy blue palette',
  'green': 'fresh green, eco-friendly green, nature-inspired green tones',
  'red': 'bold red, energetic red, passionate red accents',
  'orange': 'warm orange, vibrant orange, energetic orange tones',
  'purple': 'royal purple, creative purple, elegant purple shades',
  'black': 'elegant black, sophisticated monochrome, black and white contrast',
  'gold': 'luxurious gold, premium gold accents, metallic gold highlights',
  'gradient': 'smooth gradient colors, modern color transition, dynamic color blend',
  'colorful': 'vibrant multi-color palette, diverse colors, dynamic color scheme'
};

function buildPrompt(params: LogoGenerationParams): string {
  const { prompt, logoName, slogan, businessType, style, colorScheme, includeText, variationIndex = 0 } = params;

  // Style variations for diversity
  const compositions = [
    'icon positioned above text, vertically stacked layout',
    'icon on the left with text to the right, horizontal layout',
    'icon integrated creatively with the typography'
  ];
  const composition = compositions[variationIndex % compositions.length];

  // Visual variation elements
  const visualVariations = [
    'with subtle depth and dimension',
    'flat design with bold shapes',
    'with refined details and precision'
  ];
  const visualStyle = visualVariations[variationIndex % visualVariations.length];

  // Get style keywords
  const styleWords = styleKeywords[style.toLowerCase()] || 'professional, modern, clean';
  const colorWords = colorDescriptions[colorScheme.toLowerCase()] || `${colorScheme} color palette`;

  // Check for Arabic text in brand name
  const hasArabicName = logoName ? containsArabic(logoName) : false;
  const hasArabicSlogan = slogan ? containsArabic(slogan) : false;
  const hasArabicText = hasArabicName || hasArabicSlogan;
  const arabicRule = hasArabicText ? ` ${ARABIC_CORE}.` : '';

  // Extract business context from description (prompt field)
  const businessContext = prompt?.trim() || businessType || 'business';

  // LOGO WITH TEXT: Brand name comes from logoName field
  if (includeText && logoName?.trim()) {
    const brandName = logoName.trim();

    const textInstructions = hasArabicName
      ? `The logo MUST display the Arabic brand name "${brandName}" as the primary text element, rendered clearly and correctly in Arabic script`
      : `The logo MUST display the exact brand name "${brandName}" as the primary text element, spelled exactly as shown`;

    const sloganInstructions = slogan?.trim()
      ? hasArabicSlogan
        ? ` Also include the Arabic tagline "${slogan.trim()}" below the brand name in smaller text.`
        : ` Also include the tagline "${slogan.trim()}" below the brand name in smaller complementary font.`
      : '';

    return `Create a professional logo for: ${businessContext}

BRAND NAME TO DISPLAY: "${brandName}"
${sloganInstructions ? `TAGLINE: "${slogan?.trim()}"` : ''}

${textInstructions}.${sloganInstructions}

STYLE: ${styleWords}, ${visualStyle}
COLOR SCHEME: ${colorWords}
LAYOUT: ${composition}

CRITICAL REQUIREMENTS:
- ${QUALITY_CORE}
- ${TYPOGRAPHY_CORE}
- ${LOGO_RULES}${arabicRule}
- IMPORTANT: The text "${brandName}" must appear in the logo, spelled EXACTLY as shown - no variations or alternatives
- The brand name is the focal point with a supporting icon/symbol
- Do NOT add any other text or words that are not specified above

Render as a complete wordmark or combination logo design with the brand name "${brandName}" clearly visible.`;
  }

  // ICON-ONLY LOGO: No text in logo
  else {
    return `Create a professional symbol/icon logo representing: ${businessContext}

STYLE: ${styleWords}, ${visualStyle}
COLOR SCHEME: ${colorWords}

REQUIREMENTS:
- ${QUALITY_CORE}
- ${LOGO_RULES}
- NO text whatsoever - purely iconic/symbolic design
- Memorable, distinctive, timeless like Apple, Nike, or Twitter logos
- Simple enough to work at small sizes
- Unique geometric or abstract shape that represents the business

Render as a clean, iconic symbol logo with NO text.`;
  }
}

async function pollJobStatus(jobId: string, apiToken: string, maxAttempts = 120): Promise<KreaJobResponse> {
  console.log(`[KREA Seedream4] Polling job ${jobId}...`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${KREA_API_BASE}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[KREA Seedream4] Poll failed for ${jobId}: HTTP ${response.status}`);
        throw new Error(`Failed to fetch job status: ${response.status}`);
      }

      const job: KreaJobResponse = await response.json();
      console.log(`[KREA Seedream4] Job ${jobId} status: ${job.status} (attempt ${attempt + 1})`);

      if (job.status === 'completed') {
        console.log(`[KREA Seedream4] Job ${jobId} completed successfully`);
        return job;
      }

      if (job.status === 'failed' || job.status === 'cancelled') {
        console.error(`[KREA Seedream4] Job ${jobId} failed:`, job.result?.error);
        throw new Error(job.result?.error || `Job ${job.status}`);
      }

      // Wait 2 seconds before next poll (Seedream 4 takes ~20 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      console.warn(`[KREA Seedream4] Poll attempt ${attempt + 1} error, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error('Job timed out waiting for completion (4 minutes)');
}

async function fetchImageAsBase64(url: string): Promise<string> {
  console.log(`[KREA Seedream4] Fetching image: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`[KREA Seedream4] Image fetched, size: ${buffer.length} bytes`);
  return buffer.toString('base64');
}

interface GenerationError {
  variationIndex: number;
  error: string;
}

async function generateSingleLogo(
  params: LogoGenerationParams,
  apiToken: string,
  variationIndex: number
): Promise<{ success: true; image: string } | { success: false; error: string }> {
  try {
    const prompt = buildPrompt(params);
    console.log(`[KREA Seedream4] Starting generation for variation ${variationIndex + 1}`);
    console.log(`[KREA Seedream4] Prompt length: ${prompt.length} chars`);

    // Create the generation job using Seedream 4 (better for text rendering)
    const response = await fetch(`${KREA_API_BASE}/generate/image/bytedance/seedream-4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        // Use different seeds for each variation to ensure diversity
        seed: Math.floor(Math.random() * 2147483647),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KREA Seedream4] API error for variation ${variationIndex + 1}:`, errorText);

      if (response.status === 402) {
        return { success: false, error: 'KREA API quota exceeded. Please upgrade your KREA plan.' };
      }
      if (response.status === 401) {
        return { success: false, error: 'KREA API authentication failed. Please check your API key.' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
      }

      return { success: false, error: `KREA API error: ${response.status}` };
    }

    const jobData: KreaJobResponse = await response.json();
    console.log(`[KREA Seedream4] Job created for variation ${variationIndex + 1}: ${jobData.job_id}`);

    if (!jobData.job_id) {
      return { success: false, error: 'No job ID returned from KREA API' };
    }

    // Poll for completion (Seedream 4 takes ~20 seconds per image)
    const completedJob = await pollJobStatus(jobData.job_id, apiToken);

    // Get the image URL from result
    const imageUrl = completedJob.result?.urls?.[0];
    if (!imageUrl) {
      return { success: false, error: 'No image URL in completed job' };
    }

    // Convert to base64 for frontend consistency
    const base64Image = await fetchImageAsBase64(imageUrl);
    console.log(`[KREA Seedream4] Variation ${variationIndex + 1} completed successfully`);
    return { success: true, image: base64Image };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[KREA Seedream4] Generation error for variation ${variationIndex + 1}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.KREA_API_KEY;

    if (!apiToken) {
      console.error('[KREA Seedream4] API key not configured');
      return NextResponse.json({
        success: false,
        error: 'KREA API key not configured. Please add KREA_API_KEY to environment variables.',
      }, { status: 500 });
    }

    const body = await request.json();
    const {
      prompt,
      logoName,
      slogan,
      businessType,
      style,
      colorScheme,
      includeText = true,
      variations = 3,
      authToken, // Add auth token support
    } = body;

    console.log('[KREA Seedream4] Received request:', { prompt: prompt?.substring(0, 50), logoName, style, colorScheme, variations });

    // Check generation limits if user is authenticated
    const supabase = getSupabaseAdmin();
    let userId: string | null = null;
    let generationStats: { used: number; limit: number; remaining: number; plan: string } | null = null;
    const variationCount = Math.min(Math.max(1, variations), 3);

    if (authToken && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(authToken);
      if (!error && user) {
        userId = user.id;

        // Get current generation stats
        const { data: stats } = await supabase.rpc('get_generation_stats', {
          p_user_id: userId,
        });

        if (stats?.success) {
          generationStats = stats;

          // Check if user has enough generations for requested variations
          if (stats.remaining < variationCount) {
            const planMessage = stats.plan === 'free'
              ? 'Upgrade to Pro for 300 generations/month!'
              : stats.plan === 'pro'
              ? 'Upgrade to Business for 1000 generations/month!'
              : 'Please contact support.';

            return NextResponse.json({
              success: false,
              error: stats.remaining === 0
                ? `You have reached your monthly limit of ${stats.limit} generations. ${planMessage}`
                : `You need ${variationCount} generations but only have ${stats.remaining} remaining. ${planMessage}`,
              limitReached: true,
              stats: {
                used: stats.used,
                limit: stats.limit,
                remaining: stats.remaining,
                plan: stats.plan,
                requested: variationCount,
              },
            }, { status: 429 });
          }
        }
      }
    }

    // Validate: either prompt or logoName is required
    if (!prompt?.trim() && !logoName?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Prompt or logo name is required',
      }, { status: 400 });
    }

    const baseParams: LogoGenerationParams = {
      prompt: prompt?.trim(),
      logoName: logoName?.trim(),
      slogan: slogan?.trim(),
      businessType: businessType?.trim(),
      style,
      colorScheme,
      includeText,
    };

    // Generate variations sequentially to avoid rate limiting
    // Seedream 4 takes ~20 seconds per image, so we run sequentially
    const successfulResults: string[] = [];
    const errors: GenerationError[] = [];

    console.log(`[KREA Seedream4] Generating ${variationCount} variations sequentially...`);

    for (let i = 0; i < variationCount; i++) {
      const result = await generateSingleLogo(
        { ...baseParams, variationIndex: i },
        apiToken,
        i
      );

      if (result.success) {
        successfulResults.push(result.image);
      } else {
        errors.push({ variationIndex: i, error: result.error });
        // Continue to try other variations even if one fails
      }

      // Small delay between requests to be nice to the API
      if (i < variationCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[KREA Seedream4] Generation complete: ${successfulResults.length}/${variationCount} successful`);

    if (successfulResults.length === 0) {
      // Return the most specific error message
      const specificError = errors.find(e =>
        e.error.includes('quota') ||
        e.error.includes('authentication') ||
        e.error.includes('Too many')
      );

      return NextResponse.json({
        success: false,
        error: specificError?.error || errors[0]?.error || 'Failed to generate any logos. Please try again.',
        details: errors,
      }, { status: 500 });
    }

    // Log the generation if user is authenticated (deduct generations based on successful logos)
    if (userId && supabase && successfulResults.length > 0) {
      const { data: logResult } = await supabase.rpc('use_generation', {
        p_user_id: userId,
        p_tool_type: 'logo',
        p_input: { prompt, logoName, style, colorScheme, variations: successfulResults.length },
        p_output: `Generated ${successfulResults.length} logo variations`,
        p_count: successfulResults.length, // Deduct based on successful generations
      });

      // Update generation stats for response
      if (logResult?.success) {
        generationStats = {
          used: logResult.used,
          limit: logResult.limit,
          remaining: logResult.remaining,
          plan: logResult.plan,
        };
      }
    }

    return NextResponse.json({
      success: true,
      logos: successfulResults,
      count: successfulResults.length,
      includeText,
      provider: 'krea-seedream4',
      warnings: errors.length > 0 ? `${errors.length} variation(s) failed to generate` : undefined,
      generationStats,
    });
  } catch (error: unknown) {
    console.error('[KREA Seedream4] Unexpected error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
