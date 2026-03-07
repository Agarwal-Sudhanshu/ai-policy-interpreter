-- Enable pgvector for RAG (policy chunks + embeddings).
create extension if not exists vector;

-- policy_chunks: store chunked policy text and embeddings for vector search.
-- Example:
--   create table policy_chunks (
--     id uuid primary key default gen_random_uuid(),
--     policy_id uuid references policies(id),
--     chunk_text text,
--     embedding vector(1536)
--   );
create table if not exists policy_chunks (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references policies(id) on delete cascade,
  chunk_text text not null,
  embedding vector(1536) not null
);

create index if not exists policy_chunks_embedding_idx
  on policy_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists policy_chunks_policy_id_idx
  on policy_chunks (policy_id);

-- RPC for similarity search: returns chunk_text and policy_id for top match_count chunks.
-- Strict policy filtering: WHERE policy_id = p_policy_id guarantees only chunks belonging
-- to the requested policy are returned (no cross-policy retrieval).
create or replace function match_policy_chunks(
  p_policy_id uuid,
  p_query_embedding vector(1536),
  p_match_count int default 10
)
returns table (chunk_text text, policy_id uuid)
language sql stable
as $$
  select pc.chunk_text, pc.policy_id
  from policy_chunks pc
  where pc.policy_id = p_policy_id
  order by pc.embedding <=> p_query_embedding
  limit least(p_match_count, 20);
$$;
