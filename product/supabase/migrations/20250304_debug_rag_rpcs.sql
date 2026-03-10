-- Debug RAG: vector results with similarity, keyword results with websearch_to_tsquery.
-- For /api/debug/rag and /debug/rag UI only.

create or replace function debug_match_policy_chunks_by_document(
  p_document_id uuid,
  p_query_embedding vector(1536),
  p_limit int default 10
)
returns table (chunk_text text, document_id uuid, chunk_index integer, similarity double precision)
language sql stable
as $$
  select pc.chunk_text, pc.document_id, pc.chunk_index,
         (pc.embedding <=> p_query_embedding)::double precision as similarity
  from policy_chunks pc
  where pc.document_id = p_document_id
  order by pc.embedding <=> p_query_embedding
  limit least(p_limit, 20);
$$;

create or replace function debug_search_policy_chunks_fts_by_document(
  p_document_id uuid,
  p_query text,
  p_limit int default 10
)
returns table (chunk_text text, document_id uuid, chunk_index integer)
language sql stable
as $$
  select pc.chunk_text, pc.document_id, pc.chunk_index
  from policy_chunks pc
  where pc.document_id = p_document_id
    and length(trim(coalesce(p_query, ''))) > 0
    and pc.chunk_tsv @@ websearch_to_tsquery('english', p_query)
  limit least(p_limit, 20);
$$;
