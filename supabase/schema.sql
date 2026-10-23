-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  ref text not null,
  from_num int not null,
  to_num int not null,
  missing text not null default '',
  undelivered text not null default '',
  created_at timestamptz not null default now()
);

create table paid_periods (start date primary key);

create table settings (
  id int primary key default 1 check (id = 1),
  rate numeric not null default 1,
  anchor date not null default '2026-01-05'
);
insert into settings (id) values (1);

-- Only signed-in users can read or write anything.
alter table entries enable row level security;
alter table paid_periods enable row level security;
alter table settings enable row level security;

create policy "auth all" on entries for all to authenticated using (true) with check (true);
create policy "auth all" on paid_periods for all to authenticated using (true) with check (true);
create policy "auth all" on settings for all to authenticated using (true) with check (true);
