-- Add processing status tracking to documents table.
-- status: 'processing' | 'completed' | 'failed'
-- processing_error: set when status = 'failed'
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS processing_error text;

COMMENT ON COLUMN documents.status IS 'processing | completed | failed';
COMMENT ON COLUMN documents.processing_error IS 'Error message when status = failed';
