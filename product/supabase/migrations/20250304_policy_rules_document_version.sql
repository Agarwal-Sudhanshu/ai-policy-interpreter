-- Link policy_rules to documents for version tracking.
-- Each rule belongs to a specific document; fetch rules for latest document per policy.

ALTER TABLE policy_rules
  ADD COLUMN IF NOT EXISTS document_id uuid REFERENCES documents(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Backfill: set document_id to the latest document (max version) per policy
UPDATE policy_rules pr
SET document_id = (
  SELECT d.id
  FROM documents d
  WHERE d.policy_id = pr.policy_id
  ORDER BY d.version DESC NULLS LAST
  LIMIT 1
)
WHERE pr.document_id IS NULL;

COMMENT ON COLUMN policy_rules.document_id IS 'Document this rule was extracted from; filter by latest document when fetching';
COMMENT ON COLUMN policy_rules.created_at IS 'When this rule row was created';
