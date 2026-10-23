# Payment Tracker (Next.js + Supabase)

Dashboard, Reports and Settings pages, with email + password login.
Only people you create in Supabase can sign in.

## 1. Create the Supabase project
1. Sign up at https://supabase.com and create a new project.
2. Open **SQL Editor -> New query**, paste the contents of `supabase/schema.sql`, click **Run**.
3. Open **Authentication -> Providers -> Email** and turn OFF "Allow new users to sign up".
4. Open **Authentication -> Users -> Add user -> Create new user**. Enter an email and password
   for each person who should have access (tick "Auto Confirm User").
5. Open **Project Settings -> API** and copy the Project URL and the `anon` public key.

Project URL: https://ifskqzsckviscshnxmgz.supabase.co/rest/v1/
anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc2txenNja3Zpc2NzaG54bWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODk5NjksImV4cCI6MjEwODI2NTk2OX0.BXvNW3T0HsU09J9WEqG8uqXORFY9lZqI7XHBetfgfgc

## 2. Run it locally
```
cp .env.local.example .env.local     # then paste the two values in
npm install
npm run dev                          # http://localhost:3000
```

## 3. Put it online (Vercel)
Push this folder to GitHub, import it at https://vercel.com, and add the same two
variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under
**Settings -> Environment Variables**, then deploy.

## Notes
- Data is protected by Supabase row-level security: only signed-in users can read or write.
  All signed-in users share the same data.
- The login uses email addresses as usernames (that is how Supabase Auth works).
- To move your old data from the Claude artifact version, re-enter it on the Reports page.
