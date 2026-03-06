-- Freelance AI Engine - Generation Tracking System
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. UPDATE PROFILES TABLE for monthly generation tracking
-- =====================================================
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS generations_today,
  DROP COLUMN IF EXISTS last_generation_date;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  ADD COLUMN IF NOT EXISTS generations_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS generation_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW()),
  ADD COLUMN IF NOT EXISTS generation_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  ADD COLUMN IF NOT EXISTS subscription_start DATE,
  ADD COLUMN IF NOT EXISTS subscription_end DATE;

-- =====================================================
-- 2. GENERATIONS HISTORY TABLE (logs all generations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  output_preview TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policies for generations
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_tool_type ON public.generations(tool_type);

-- =====================================================
-- 3. FUNCTION TO CHECK AND INCREMENT GENERATIONS
-- =====================================================
CREATE OR REPLACE FUNCTION public.use_generation(p_user_id UUID, p_tool_type TEXT, p_input JSONB, p_output TEXT)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_limit INTEGER;
  v_current_month INTEGER;
  v_current_year INTEGER;
  v_generation_id UUID;
BEGIN
  -- Get current month and year
  v_current_month := EXTRACT(MONTH FROM NOW());
  v_current_year := EXTRACT(YEAR FROM NOW());

  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  -- If profile doesn't exist, return error
  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Reset monthly counter if new month
  IF v_profile.generation_month != v_current_month OR v_profile.generation_year != v_current_year THEN
    UPDATE public.profiles
    SET generations_this_month = 0,
        generation_month = v_current_month,
        generation_year = v_current_year
    WHERE id = p_user_id;

    -- Re-fetch profile
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  END IF;

  -- Determine generation limit based on plan
  CASE v_profile.plan
    WHEN 'free' THEN v_limit := 20;
    WHEN 'pro' THEN v_limit := 300;
    WHEN 'business' THEN v_limit := 1000;
    ELSE v_limit := 20;
  END CASE;

  -- Check if user has remaining generations
  IF v_profile.generations_this_month >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Generation limit reached',
      'limit', v_limit,
      'used', v_profile.generations_this_month,
      'plan', v_profile.plan
    );
  END IF;

  -- Log the generation
  INSERT INTO public.generations (user_id, tool_type, input_data, output_preview)
  VALUES (p_user_id, p_tool_type, p_input, LEFT(p_output, 500))
  RETURNING id INTO v_generation_id;

  -- Increment generation counter
  UPDATE public.profiles
  SET generations_this_month = generations_this_month + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Return success with updated stats
  RETURN jsonb_build_object(
    'success', true,
    'generation_id', v_generation_id,
    'used', v_profile.generations_this_month + 1,
    'limit', v_limit,
    'remaining', v_limit - v_profile.generations_this_month - 1,
    'plan', v_profile.plan
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCTION TO GET USER GENERATION STATS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_generation_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_limit INTEGER;
  v_current_month INTEGER;
  v_current_year INTEGER;
BEGIN
  v_current_month := EXTRACT(MONTH FROM NOW());
  v_current_year := EXTRACT(YEAR FROM NOW());

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Reset if new month
  IF v_profile.generation_month != v_current_month OR v_profile.generation_year != v_current_year THEN
    UPDATE public.profiles
    SET generations_this_month = 0,
        generation_month = v_current_month,
        generation_year = v_current_year
    WHERE id = p_user_id;

    v_profile.generations_this_month := 0;
  END IF;

  -- Determine limit
  CASE v_profile.plan
    WHEN 'free' THEN v_limit := 20;
    WHEN 'pro' THEN v_limit := 300;
    WHEN 'business' THEN v_limit := 1000;
    ELSE v_limit := 20;
  END CASE;

  RETURN jsonb_build_object(
    'success', true,
    'plan', v_profile.plan,
    'used', v_profile.generations_this_month,
    'limit', v_limit,
    'remaining', v_limit - v_profile.generations_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.generations TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.use_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_generation_stats TO authenticated;
