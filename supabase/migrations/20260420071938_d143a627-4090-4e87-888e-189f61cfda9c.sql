
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_client_id_idx on public.conversations(client_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "open read conversations" on public.conversations for select using (true);
create policy "open insert conversations" on public.conversations for insert with check (true);
create policy "open update conversations" on public.conversations for update using (true);
create policy "open delete conversations" on public.conversations for delete using (true);

create policy "open read messages" on public.messages for select using (true);
create policy "open insert messages" on public.messages for insert with check (true);
create policy "open update messages" on public.messages for update using (true);
create policy "open delete messages" on public.messages for delete using (true);
