-- Create cancellation_feedback table to track why users cancel
-- This helps improve the product based on user feedback

CREATE TABLE cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  additional_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for querying feedback by user
CREATE INDEX idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);

-- Add index for querying feedback by date
CREATE INDEX idx_cancellation_feedback_created_at ON cancellation_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own feedback
CREATE POLICY "Users can insert their own cancellation feedback"
  ON cancellation_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own cancellation feedback"
  ON cancellation_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE cancellation_feedback IS 'Stores user feedback when they cancel their subscription';
COMMENT ON COLUMN cancellation_feedback.reason IS 'Primary cancellation reason from dropdown';
COMMENT ON COLUMN cancellation_feedback.additional_feedback IS 'Optional additional details from user';
