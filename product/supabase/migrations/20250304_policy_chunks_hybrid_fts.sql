-- Full-text search for hybrid RAG: vector + keyword.
-- chunk_tsv is populated automatically from chunk_text on insert/update.

ALTER TABLE policy_chunks
  ADD COLUMN IF NOT EXISTS chunk_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(chunk_text, ''))) STORED;

CREATE INDEX IF NOT EXISTS policy_chunks_tsv_idx
  ON policy_chunks
  USING gin(chunk_tsv);

-- Keyword search scoped to latest document (same as vector search).
create or replace function search_policy_chunks_fts_by_document(
  p_document_id uuid,
  p_query text,
  p_limit int default 10
)
returns table (chunk_text text, policy_id uuid)
language sql stable
as $$
  select pc.chunk_text, pc.policy_id
  from policy_chunks pc
  where pc.document_id = p_document_id
    and pc.chunk_tsv @@ plainto_tsquery('english', coalesce(p_query, ''))
  limit least(p_limit, 20);
$$;
