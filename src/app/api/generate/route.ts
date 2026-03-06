import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization of OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

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

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// System prompts for different tools
const systemPrompts: Record<string, string> = {
  branding: `You are an expert brand strategist and designer specializing in creating brand identities for Arab and Algerian businesses.
You create comprehensive branding packages including:
- Brand names (in both Arabic and English when requested)
- Slogans and taglines
- Color palette recommendations with hex codes
- Typography/font pairing suggestions
- Tone of voice guidelines
- AI image prompts for logo generation

Format your output in a clean, professional manner using clear sections with headers.
Use both Arabic and English when the user requests Arabic output.
Be creative, modern, and culturally aware of Arab/Algerian market preferences.`,

  social: `You are a social media marketing expert specializing in content for Arab and Algerian audiences.
You create viral, engaging content for Instagram, TikTok, Facebook, and LinkedIn.
You understand Darija (Algerian Arabic dialect), formal Arabic, and English.

Create content that:
- Captures attention in the first 3 seconds (for video scripts)
- Uses trending formats and hooks
- Includes relevant hashtags
- Has clear calls-to-action
- Is optimized for each specific platform

When asked for Darija tone, write in a casual, relatable Algerian dialect.
Format output clearly with sections for different content types.`,

  proposal: `You are an expert freelance consultant who helps Arab freelancers win clients on Fiverr, Upwork, and through cold outreach.
You write compelling proposals that:
- Stand out from competition
- Show understanding of client needs
- Highlight relevant experience
- Include clear deliverables and timelines
- Have professional yet approachable tone

Adapt your writing style based on the platform (Fiverr is more casual, Upwork is more professional).
For WhatsApp and cold DMs, keep messages concise and personal.
Include both Arabic and English versions when requested.`,

  pricing: `You are a freelance business consultant specializing in pricing strategies for Arab freelancers.
You help freelancers create profitable pricing packages based on:
- Their experience level
- Market rates (Algeria, Arab region, international)
- Project complexity
- Value delivered

Create three-tier pricing packages (Basic, Standard, Premium) with:
- Clear deliverables for each tier
- USD and DZD pricing (use 135 DZD = 1 USD rate)
- Value justification
- Recommended hourly rates

Be realistic about Arab market rates while encouraging premium pricing for quality work.`,

  brief: `You are an expert freelance project manager who analyzes client briefs and messages.
When given a client message, you:
- Extract key requirements and needs
- Identify the project type and scope
- Spot potential challenges or red flags
- Suggest the best approach/solution
- Draft a professional response
- Recommend upselling opportunities

Be thorough in your analysis and provide actionable insights.
Include both Arabic and English responses when requested.`,

  portfolio: `You are a personal branding expert who helps freelancers create compelling portfolios.
You create:
- Professional bios that tell a story
- Detailed case studies with results
- Service positioning statements
- Unique value propositions

Focus on:
- Quantifiable results and achievements
- Client-focused language
- Industry-specific expertise
- Clear differentiation from competitors

Write in a confident, professional tone that appeals to potential clients.`,

  contract: `You are a legal document specialist who creates freelance service agreements.
Create clear, professional contracts that:
- Protect both freelancer and client
- Define scope of work clearly
- Specify payment terms and milestones
- Include revision policies
- Address intellectual property rights
- Have termination clauses

Provide contracts in the requested language (Arabic or English).
Use simple, clear language that both parties can understand.
Format with proper legal document structure.`,

  'landing-page': `You are a conversion-focused copywriter specializing in ecommerce landing pages.
You create compelling, persuasive copy that drives sales and conversions.

Your landing page copy includes:
- Attention-grabbing headlines that highlight benefits
- Persuasive subheadlines that expand on the value proposition
- Benefit-focused feature descriptions
- Social proof elements (testimonials, reviews)
- Urgency and scarcity elements when appropriate
- Clear, action-oriented CTAs

Write in a tone that:
- Is confident but not pushy
- Focuses on customer benefits, not just features
- Creates emotional connection
- Addresses objections
- Builds trust

Adapt to both Arabic and English markets, understanding cultural nuances.`,
};

// Build user prompts for each tool type
function buildUserPrompt(toolType: string, data: Record<string, string>): string {
  switch (toolType) {
    case 'branding':
      return `Create a complete brand identity package for:
Business Type: ${data.businessType}
Target Audience: ${data.targetAudience}
Style: ${data.style}
Output Language: ${data.language === 'ar' ? 'Arabic and English' : 'English'}

Include:
1. Brand Name suggestions (3 options)
2. Slogan/Tagline for each name
3. Color Palette (primary, secondary, accent colors with hex codes)
4. Typography recommendations (heading and body fonts)
5. Tone of Voice description
6. AI Image Prompt for logo generation
7. Brand Identity Summary`;

    case 'social':
      return `Create social media content for:
Niche/Industry: ${data.niche}
Target Audience: ${data.targetAudience}
Platform: ${data.platform}
Goal: ${data.goal}
Tone: ${data.tone}${data.tone === 'darija' ? ' (Algerian Darija dialect)' : ''}

Create content optimized for ${data.platform} including:
- Main post/caption with hook
- Call-to-action
- Relevant hashtags
- Best posting time recommendation
${data.platform === 'tiktok' ? '- Video script with hook, body, and CTA' : ''}
${data.platform === 'facebook' ? '- Ad copy with headline and description' : ''}`;

    case 'proposal':
      const platformName = data.proposalType === 'fiverr' ? 'Fiverr seller message' :
                          data.proposalType === 'upwork' ? 'Upwork proposal' :
                          data.proposalType === 'khamsat' ? 'Khamsat proposal (خمسات)' :
                          data.proposalType === 'mostaql' ? 'Mostaql proposal (مستقل)' :
                          data.proposalType === 'cold_dm' ? 'cold DM template' :
                          'WhatsApp pitch message';

      const lengthGuide = data.proposalLength === 'very_short' ? '2-3 sentences only (30-50 words max)' :
                         data.proposalLength === 'short' ? '4-5 sentences (50-80 words max)' :
                         '6-8 sentences (80-120 words max)';

      return `Write a ${platformName} that sounds 100% human-written.

CLIENT'S PROJECT REQUEST:
"${data.clientRequest || 'General freelance services'}"

ABOUT ME:
- Experience: ${data.experience}

STRICT RULES:
1. LENGTH: ${lengthGuide} - DO NOT exceed this
2. NO formatting symbols: no #, no *, no -, no bullets, no emojis
3. Sound like a REAL human freelancer, not AI:
   - Use casual professional tone
   - Add small natural touches (like "I'd love to help" or "sounds like an interesting project")
   - Vary sentence length naturally
   - Don't be overly formal or robotic
4. Understand what service the client needs from their request and respond as someone who provides that exact service
5. Reference specific details from their project (like project name, location, etc.)
6. End with ONE simple question or call to action
7. IMPORTANT - LANGUAGE: Detect the language of the client's request and respond in THE SAME LANGUAGE. If the client wrote in Arabic, respond in natural Arabic. If they wrote in English, respond in English. Match their language exactly.

Output ONLY the proposal message text. Nothing else.`;

    case 'pricing':
      return `Create a pricing strategy for:
Service: ${data.service}
Experience Level: ${data.experience}
Project Complexity: ${data.complexity}
Target Market: ${data.market}

Create:
1. Three-tier pricing packages (Basic, Standard, Premium)
2. Clear deliverables for each tier
3. Pricing in both USD and DZD
4. Recommended hourly rate
5. Value justification for each tier
6. Tips for presenting prices to clients`;

    case 'brief':
      return `Analyze this client message/brief:

"${data.brief}"

Provide:
1. Extracted Requirements (bullet points)
2. Project Type Identification
3. Scope Assessment
4. Potential Challenges/Red Flags
5. Recommended Approach
6. Professional Response Draft ${data.language === 'ar' ? '(in Arabic)' : '(in English)'}
7. Upselling Opportunities`;

    case 'portfolio':
      return `Create portfolio content for a freelancer with:
Skills: ${data.skills}
Tools: ${data.tools}
Niche/Industry Focus: ${data.niche}
Experience: ${data.experience}
Output Language: ${data.language === 'ar' ? 'Arabic' : 'English'}

Create:
1. Professional Bio (2-3 paragraphs)
2. Three Detailed Case Studies with:
   - Project overview
   - Challenge
   - Solution
   - Results (with metrics)
3. Service Positioning Statement
4. Unique Value Proposition`;

    case 'contract':
      return `Create a freelance service contract for:
Client Name: ${data.clientName}
Project Description: ${data.projectDescription}
Total Price: ${data.price}
Timeline: ${data.timeline}
Language: ${data.language === 'ar' ? 'Arabic' : 'English'}

Create a professional contract including:
1. Parties involved
2. Scope of work
3. Payment terms (50% upfront, 50% on delivery)
4. Timeline and milestones
5. Revision policy (3 rounds included)
6. Intellectual property rights
7. Confidentiality clause
8. Termination conditions
9. Signature lines`;

    case 'landing-page':
      return `Create compelling landing page copy for:
Product/Service: ${data.productName}
Tagline: ${data.tagline || 'Not provided'}
Description: ${data.description || 'Not provided'}
Key Features: ${data.features || 'Not provided'}
Output Language: ${data.language === 'ar' ? 'Arabic' : 'English'}

Create:
1. A powerful headline (max 10 words) that captures attention
2. A compelling subheadline that expands on the value
3. 4 benefit-focused feature descriptions (one sentence each)
4. A short testimonial quote
5. Urgency-creating CTA text

Format as clean sections. Be persuasive but authentic.`;

    default:
      return JSON.stringify(data);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      // Return mock response if no API key
      return NextResponse.json({
        success: true,
        content: `⚠️ OpenAI API key not configured.\n\nTo enable real AI generation:\n1. Create a .env.local file in the project root\n2. Add: OPENAI_API_KEY=sk-your-key-here\n3. Restart the development server\n\n---\n\n[Mock response would appear here with real API key]`,
        mock: true,
      });
    }

    const body = await request.json();
    const { toolType, data, authToken } = body;

    if (!toolType || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing toolType or data' },
        { status: 400 }
      );
    }

    const systemPrompt = systemPrompts[toolType];
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: 'Invalid tool type' },
        { status: 400 }
      );
    }

    // Check generation limits if user is authenticated
    const supabase = getSupabaseAdmin();
    let userId: string | null = null;
    let generationStats: { used: number; limit: number; remaining: number; plan: string } | null = null;

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

          // Check if limit reached
          if (stats.remaining <= 0) {
            return NextResponse.json({
              success: false,
              error: stats.plan === 'free'
                ? 'You have reached your monthly limit of 20 generations. Upgrade to Pro for 300 generations/month!'
                : stats.plan === 'pro'
                ? 'You have reached your monthly limit of 300 generations. Upgrade to Business for 1000 generations/month!'
                : 'You have reached your monthly limit. Please contact support.',
              limitReached: true,
              stats: {
                used: stats.used,
                limit: stats.limit,
                plan: stats.plan,
              },
            }, { status: 429 });
          }
        }
      }
    }

    const userPrompt = buildUserPrompt(toolType, data);

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI client not initialized',
      }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || 'No response generated';

    // Log the generation if user is authenticated
    if (userId && supabase) {
      const { data: logResult } = await supabase.rpc('use_generation', {
        p_user_id: userId,
        p_tool_type: toolType,
        p_input: data,
        p_output: content.substring(0, 500),
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
      content,
      usage: completion.usage,
      generationStats,
    });
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
