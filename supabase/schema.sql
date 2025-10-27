-- DevDash Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- This creates all tables, indexes, and Row Level Security policies

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE plan_type AS ENUM ('free', 'premium');
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE frequency_type AS ENUM ('one-off', 'weekly', 'monthly', 'annual');
CREATE TYPE board_type AS ENUM ('marketing', 'product', 'custom');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'system');

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  plan plan_type NOT NULL DEFAULT 'free',
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- BOARDS TABLE
-- =====================================================

CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  board_type board_type NOT NULL DEFAULT 'custom',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX boards_user_id_idx ON boards(user_id);

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for boards
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- COLUMNS TABLE
-- =====================================================

CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX columns_board_id_idx ON columns(board_id);

-- RLS for columns (inherits from board)
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view columns of own boards"
  ON columns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = columns.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert columns to own boards"
  ON columns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = columns.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update columns of own boards"
  ON columns FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = columns.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete columns of own boards"
  ON columns FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = columns.board_id AND boards.user_id = auth.uid()
  ));

-- =====================================================
-- SWIMLANES TABLE
-- =====================================================

CREATE TABLE swimlanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  collapsed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX swimlanes_board_id_idx ON swimlanes(board_id);

-- RLS for swimlanes (inherits from board)
ALTER TABLE swimlanes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view swimlanes of own boards"
  ON swimlanes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = swimlanes.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert swimlanes to own boards"
  ON swimlanes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = swimlanes.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update swimlanes of own boards"
  ON swimlanes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = swimlanes.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete swimlanes of own boards"
  ON swimlanes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = swimlanes.board_id AND boards.user_id = auth.uid()
  ));

-- =====================================================
-- TASKS TABLE
-- =====================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  swimlane_id UUID NOT NULL REFERENCES swimlanes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority priority_type DEFAULT 'medium',
  assignee TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  is_rejected BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  linked_event_id UUID,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_board_id_idx ON tasks(board_id);
CREATE INDEX tasks_column_id_idx ON tasks(column_id);
CREATE INDEX tasks_swimlane_id_idx ON tasks(swimlane_id);

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for tasks (inherits from board)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks of own boards"
  ON tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = tasks.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tasks to own boards"
  ON tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = tasks.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tasks of own boards"
  ON tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = tasks.board_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tasks of own boards"
  ON tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards WHERE boards.id = tasks.board_id AND boards.user_id = auth.uid()
  ));

-- =====================================================
-- SUBTASKS TABLE
-- =====================================================

CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX subtasks_task_id_idx ON subtasks(task_id);

-- RLS for subtasks (inherits from task)
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subtasks of own tasks"
  ON subtasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks
    JOIN boards ON boards.id = tasks.board_id
    WHERE tasks.id = subtasks.task_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert subtasks to own tasks"
  ON subtasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks
    JOIN boards ON boards.id = tasks.board_id
    WHERE tasks.id = subtasks.task_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update subtasks of own tasks"
  ON subtasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tasks
    JOIN boards ON boards.id = tasks.board_id
    WHERE tasks.id = subtasks.task_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete subtasks of own tasks"
  ON subtasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tasks
    JOIN boards ON boards.id = tasks.board_id
    WHERE tasks.id = subtasks.task_id AND boards.user_id = auth.uid()
  ));

-- =====================================================
-- COMMENTS TABLE
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_task_id_idx ON comments(task_id);

-- RLS for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own tasks"
  ON comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks
    JOIN boards ON boards.id = tasks.board_id
    WHERE tasks.id = comments.task_id AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert comments on own tasks"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks
      JOIN boards ON boards.id = tasks.board_id
      WHERE tasks.id = comments.task_id AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FINANCE TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  service TEXT,
  notes TEXT,
  frequency frequency_type NOT NULL DEFAULT 'one-off',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX finance_transactions_user_id_idx ON finance_transactions(user_id);
CREATE INDEX finance_transactions_date_idx ON finance_transactions(date);

-- RLS for finance_transactions
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON finance_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON finance_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON finance_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON finance_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  theme theme_type NOT NULL DEFAULT 'system',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- IDEA BOARDS TABLE
-- =====================================================

CREATE TABLE idea_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idea_boards_user_id_idx ON idea_boards(user_id);

CREATE TRIGGER update_idea_boards_updated_at
  BEFORE UPDATE ON idea_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for idea_boards
ALTER TABLE idea_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idea boards"
  ON idea_boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own idea boards"
  ON idea_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own idea boards"
  ON idea_boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own idea boards"
  ON idea_boards FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- IDEA SECTIONS TABLE
-- =====================================================

CREATE TABLE idea_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES idea_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idea_sections_board_id_idx ON idea_sections(board_id);

-- RLS for idea_sections
ALTER TABLE idea_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sections of own idea boards"
  ON idea_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_sections.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sections to own idea boards"
  ON idea_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_sections.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sections of own idea boards"
  ON idea_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_sections.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sections of own idea boards"
  ON idea_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_sections.board_id AND idea_boards.user_id = auth.uid()
  ));

-- =====================================================
-- IDEA NOTES TABLE
-- =====================================================

CREATE TABLE idea_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES idea_boards(id) ON DELETE CASCADE,
  section_id UUID REFERENCES idea_sections(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  color TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idea_notes_board_id_idx ON idea_notes(board_id);

-- RLS for idea_notes
ALTER TABLE idea_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes of own idea boards"
  ON idea_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_notes.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert notes to own idea boards"
  ON idea_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_notes.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update notes of own idea boards"
  ON idea_notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_notes.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete notes of own idea boards"
  ON idea_notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_notes.board_id AND idea_boards.user_id = auth.uid()
  ));

-- =====================================================
-- IDEA COLLABORATORS TABLE
-- =====================================================

CREATE TABLE idea_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES idea_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT
);

CREATE INDEX idea_collaborators_board_id_idx ON idea_collaborators(board_id);

-- RLS for idea_collaborators
ALTER TABLE idea_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators of own idea boards"
  ON idea_collaborators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_collaborators.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert collaborators to own idea boards"
  ON idea_collaborators FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_collaborators.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update collaborators of own idea boards"
  ON idea_collaborators FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_collaborators.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete collaborators of own idea boards"
  ON idea_collaborators FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_collaborators.board_id AND idea_boards.user_id = auth.uid()
  ));

-- =====================================================
-- IDEA COMMENTS TABLE
-- =====================================================

CREATE TABLE idea_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES idea_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idea_comments_board_id_idx ON idea_comments(board_id);

-- RLS for idea_comments
ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on own idea boards"
  ON idea_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_comments.board_id AND idea_boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert comments on own idea boards"
  ON idea_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM idea_boards WHERE idea_boards.id = idea_comments.board_id AND idea_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own idea comments"
  ON idea_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own idea comments"
  ON idea_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  color TEXT NOT NULL,
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX calendar_events_user_id_idx ON calendar_events(user_id);
CREATE INDEX calendar_events_date_idx ON calendar_events(date);

-- RLS for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, plan)
  VALUES (NEW.id, '', '', 'free');

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Already created inline above with tables, but listing key ones:
-- - boards_user_id_idx
-- - columns_board_id_idx
-- - swimlanes_board_id_idx
-- - tasks_board_id_idx, tasks_column_id_idx, tasks_swimlane_id_idx
-- - finance_transactions_user_id_idx, finance_transactions_date_idx
-- - calendar_events_user_id_idx, calendar_events_date_idx

-- =====================================================
-- DONE!
-- =====================================================
-- Schema creation complete. All tables have RLS enabled.
-- Now you can start migrating data from localStorage.
