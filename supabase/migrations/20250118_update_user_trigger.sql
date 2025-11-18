-- Update handle_new_user function to NOT create profile automatically
-- This allows the trial claim API to create profiles with proper trial dates
-- The trigger will only create user_preferences now

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user preferences, NOT the profile
  -- Profile will be created by /api/trial/claim when user claims their trial
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment explaining the change
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user preferences only. Profile is created when user claims trial via /api/trial/claim';
