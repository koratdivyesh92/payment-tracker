-- Run once in Supabase (SQL Editor) if your database was created before the Comment field existed.
alter table entries add column if not exists comment text not null default '';
