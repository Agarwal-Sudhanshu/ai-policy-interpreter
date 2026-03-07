-- Add document_id to policy_chunks for per-document chunk lifecycle (delete old, insert new per document).
ALTER TABLE policy_chunks
  ADD COLUMN IF NOT EXISTS document_id uuid REFERENCES documents(id);

CREATE INDEX IF NOT EXISTS policy_chunks_document_id_idx ON policy_chunks (document_id);

COMMENT ON COLUMN policy_chunks.document_id IS 'Document this chunk was generated from; delete by document_id before regenerating.';
