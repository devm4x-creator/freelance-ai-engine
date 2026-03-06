// AI Generator - Calls the server-side API route for OpenAI generation

interface GenerateResponse {
  success: boolean;
  content?: string;
  error?: string;
  mock?: boolean;
  limitReached?: boolean;
  generationStats?: {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
  };
}

interface GenerateOptions {
  authToken?: string;
  onStatsUpdate?: (stats: GenerateResponse['generationStats']) => void;
}

async function callGenerateAPI(
  toolType: string,
  data: Record<string, string>,
  options?: GenerateOptions
): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolType,
        data,
        authToken: options?.authToken,
      }),
    });

    const result: GenerateResponse = await response.json();

    if (!result.success) {
      if (result.limitReached) {
        throw new Error(result.error || 'Generation limit reached');
      }
      throw new Error(result.error || 'Generation failed');
    }

    // Call the stats update callback if provided
    if (result.generationStats && options?.onStatsUpdate) {
      options.onStatsUpdate(result.generationStats);
    }

    return result.content || 'No content generated';
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

export async function generateBranding(
  data: {
    businessType: string;
    targetAudience: string;
    style: string;
    language: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('branding', data, options);
}

export async function generateSocialContent(
  data: {
    niche: string;
    targetAudience: string;
    goal: string;
    tone: string;
    platform: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('social', data, options);
}

export async function generateProposal(
  data: {
    proposalType: string;
    clientRequest: string;
    experience: string;
    proposalLength: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('proposal', data, options);
}

export async function generatePricing(
  data: {
    service: string;
    experience: string;
    complexity: string;
    market: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('pricing', data, options);
}

export async function analyzeBrief(
  brief: string,
  language: string,
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('brief', { brief, language }, options);
}

export async function generatePortfolio(
  data: {
    skills: string;
    tools: string;
    niche: string;
    experience: string;
    language: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('portfolio', data, options);
}

export async function generateContract(
  data: {
    clientName: string;
    projectDescription: string;
    price: string;
    timeline: string;
    language: string;
  },
  options?: GenerateOptions
): Promise<string> {
  return callGenerateAPI('contract', data, options);
}

// Helper to get current auth token from session storage or context
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try to get from localStorage (where Supabase stores it)
  try {
    const supabaseAuth = localStorage.getItem('sb-wwsjoagnsjjynuaiwfuz-auth-token');
    if (supabaseAuth) {
      const parsed = JSON.parse(supabaseAuth);
      return parsed?.access_token || null;
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}
