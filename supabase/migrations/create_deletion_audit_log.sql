-- Create deletion audit log table for GDPR compliance
-- This table tracks all user data deletions for legal compliance and auditing

CREATE TABLE IF NOT EXISTS deletion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  deletion_reason TEXT NOT NULL, -- 'trial_expiry_90d', 'subscription_lapsed_12m', 'user_requested'
  scheduled_date TIMESTAMPTZ NOT NULL,
  warning_sent_date TIMESTAMPTZ,
  actual_deletion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_summary JSONB, -- count of tasks, boards, transactions deleted
  deleted_by TEXT NOT NULL DEFAULT 'automated_cron',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_deletion_audit_user_id ON deletion_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_deletion_date ON deletion_audit_log(actual_deletion_date);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_deletion_reason ON deletion_audit_log(deletion_reason);

-- Add comments for documentation
COMMENT ON TABLE deletion_audit_log IS 'Audit log of all user data deletions for GDPR compliance and legal requirements';
COMMENT ON COLUMN deletion_audit_log.deletion_reason IS 'Reason for deletion: trial_expiry_90d (90 days after trial), subscription_lapsed_12m (12 months after cancellation), user_requested (user explicitly requested deletion)';
COMMENT ON COLUMN deletion_audit_log.data_summary IS 'JSON summary of deleted data counts: {tasks: N, boards: N, transactions: N, ideas: N, etc}';

-- Enable Row Level Security (RLS)
ALTER TABLE deletion_audit_log ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only admins/backend can access this table
-- Users should not have access to audit logs
