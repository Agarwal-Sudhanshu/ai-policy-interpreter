-- Policy document versioning: each policy can have multiple documents (one per upload).
-- Storage path format: organization_id/product_id/policy_id/v{version}/policy.pdf

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS version integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS original_filename text;

-- Backfill: existing rows get version 1 and created_at = uploaded_at if available
UPDATE documents
SET version = 1
WHERE version IS NULL;

UPDATE documents
SET created_at = uploaded_at
WHERE created_at IS NULL AND uploaded_at IS NOT NULL;

-- Default version for any new rows inserted without version (safety)
ALTER TABLE documents
  ALTER COLUMN version SET DEFAULT 1;

COMMENT ON COLUMN documents.version IS 'Document version per policy; next upload = max(version)+1 for that policy_id';
COMMENT ON COLUMN documents.created_at IS 'When this document record was created';
COMMENT ON COLUMN documents.original_filename IS 'Original file name at upload';
