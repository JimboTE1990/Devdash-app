-- Migration: Create planner_tasks table for Planner V2
-- Purpose: Simplified task storage for the planner-v2 Kanban board
-- Date: 2025-10-24

-- =====================================================
-- PLANNER_TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS planner_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_type TEXT NOT NULL DEFAULT 'planner-v2',
  title TEXT NOT NULL,
  description TEXT,
  column_id TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  assignee TEXT,
  subtasks JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS planner_tasks_user_id_idx ON planner_tasks(user_id);
CREATE INDEX IF NOT EXISTS planner_tasks_board_type_idx ON planner_tasks(board_type);
CREATE INDEX IF NOT EXISTS planner_tasks_column_id_idx ON planner_tasks(column_id);
CREATE INDEX IF NOT EXISTS planner_tasks_due_date_idx ON planner_tasks(due_date);

-- Create updated_at trigger
CREATE TRIGGER update_planner_tasks_updated_at
  BEFORE UPDATE ON planner_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own planner tasks
CREATE POLICY "Users can view own planner tasks"
  ON planner_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own planner tasks
CREATE POLICY "Users can insert own planner tasks"
  ON planner_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own planner tasks
CREATE POLICY "Users can update own planner tasks"
  ON planner_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own planner tasks
CREATE POLICY "Users can delete own planner tasks"
  ON planner_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Created planner_tasks table with RLS policies';
END $$;

-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'planner_tasks'
) AS planner_tasks_table_exists;
