-- Add chunk_index for order and debugging.
ALTER TABLE policy_chunks
  ADD COLUMN IF NOT EXISTS chunk_index integer;

COMMENT ON COLUMN policy_chunks.chunk_index IS 'Order of chunk within the document; array index at insert time.';

-- RAG: similarity search scoped to a single document (latest version).
-- Use this so Q&A only searches chunks from the latest policy document.
create or replace function match_policy_chunks_by_document(
  p_document_id uuid,
  p_query_embedding vector(1536),
  p_match_count int default 10
)
returns table (chunk_text text, policy_id uuid)
language sql stable
as $$
  select pc.chunk_text, pc.policy_id
  from policy_chunks pc
  where pc.document_id = p_document_id
  order by pc.embedding <=> p_query_embedding
  limit least(p_match_count, 20);
$$;
