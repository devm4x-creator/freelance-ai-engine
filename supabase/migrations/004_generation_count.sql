-- Freelance AI Engine - Generation Count Support
-- Run this in your Supabase SQL Editor
-- This adds support for multiple generations at once (e.g., 3 logos = 3 generations)

-- =====================================================
-- UPDATE use_generation FUNCTION to support count parameter
-- =====================================================
CREATE OR REPLACE FUNCTION public.use_generation(
  p_user_id UUID,
  p_tool_type TEXT,
  p_input JSONB,
  p_output TEXT,
  p_count INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_limit INTEGER;
  v_current_month INTEGER;
  v_current_year INTEGER;
  v_generation_id UUID;
  v_actual_count INTEGER;
BEGIN
  -- Ensure count is at least 1
  v_actual_count := GREATEST(p_count, 1);

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

  -- Check if user has enough remaining generations
  IF v_profile.generations_this_month + v_actual_count > v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Generation limit reached',
      'limit', v_limit,
      'used', v_profile.generations_this_month,
      'remaining', v_limit - v_profile.generations_this_month,
      'requested', v_actual_count,
      'plan', v_profile.plan
    );
  END IF;

  -- Log the generation (with count info)
  INSERT INTO public.generations (user_id, tool_type, input_data, output_preview, tokens_used)
  VALUES (p_user_id, p_tool_type, p_input, LEFT(p_output, 500), v_actual_count)
  RETURNING id INTO v_generation_id;

  -- Increment generation counter by count
  UPDATE public.profiles
  SET generations_this_month = generations_this_month + v_actual_count,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Return success with updated stats
  RETURN jsonb_build_object(
    'success', true,
    'generation_id', v_generation_id,
    'used', v_profile.generations_this_month + v_actual_count,
    'limit', v_limit,
    'remaining', v_limit - v_profile.generations_this_month - v_actual_count,
    'plan', v_profile.plan,
    'count', v_actual_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.use_generation(UUID, TEXT, JSONB, TEXT, INTEGER) TO authenticated;
