# Payment Tracker (Next.js + Supabase)

Dashboard, Reports and Settings pages with email + password login.
Only people you create in Supabase can sign in.

## What you need installed
- Node.js (LTS version) from https://nodejs.org  (check with: node -v)
- A free Supabase account: https://supabase.com
- A free GitHub and Vercel account (only for putting it online)

## 1. Set up Supabase (once)
1. Create a new project in Supabase.
2. SQL Editor -> New query -> paste everything from supabase/schema.sql -> Run.
3. Authentication -> Providers -> Email -> turn OFF "Allow new users to sign up".
4. Authentication -> Users -> Add user -> Create new user. Enter email + password and tick
   "Auto Confirm User". Do this for every person who should have access.
5. Project Settings -> API. Copy:
   - Project URL  (looks like https://PROJECT_ID.supabase.co  - nothing after .supabase.co)
   - anon public key (long text starting with eyJ)

## 2. Run it on your computer
1. Unzip this folder and open a terminal inside it (the folder that contains package.json).
2. Create the settings file:
   - Mac/Linux:  cp .env.local.example .env.local
   - Windows:    copy .env.local.example .env.local
3. Open .env.local in any editor and fill in (no quotes, no spaces around =):
   NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
4. Install and start:
   npm install
   npm run dev
5. Open http://localhost:3000 and sign in with a user you created.
   Stop the server with Ctrl+C. Start it again any time with: npm run dev
   (If you edit .env.local, stop and restart the server.)

## 3. Put it online (Vercel) so you can open it from anywhere
1. Create an empty repository on GitHub, then in this folder run:
   git init
   git add .
   git commit -m "payment tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
   git push -u origin main
   (.env.local is ignored by git on purpose, so your keys are not uploaded.)
2. Go to https://vercel.com -> Add New -> Project -> import that repository.
3. Before clicking Deploy, open Environment Variables and add the same two variables
   (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). Then Deploy.
4. Open the .vercel.app link Vercel gives you. Done.
5. Later changes: edit files, then git add . / git commit -m "update" / git push.
   Vercel redeploys automatically. If you change environment variables, click Redeploy.

## Troubleshooting
- "Invalid path specified in request URL": your URL has extra text. Use only
  https://PROJECT_ID.supabase.co
- Login fails: confirm the user exists in Authentication -> Users and is confirmed.
- Vercel asks you to log in to view the site: Settings -> Deployment Protection -> turn off.
- Data is shared by all signed-in users. Usernames are email addresses.

## Uploading data from Excel (Reports page -> Upload Excel)
Use an .xlsx file. The first sheet must have this header row (column order can change):

| Date       | ID   | From | To | Missing  | Undelivered | Comment |
|------------|------|------|----|----------|-------------|---------|
| 2026-11-02 | A101 | 2    | 50 | 2, 3, 15 | 23, 45      | Checked |
| 2026-11-03 | A102 | 51   | 90 |          |             |         |

- Date: a real Excel date, or text like 2026-11-02 (required)
- ID: any label (required)
- From / To: whole numbers, To not less than From (required)
- Comment: optional text
- Missing / Undelivered: numbers separated by commas, ranges like 10-12 allowed; leave blank if none
- The upload form has a "Download template" button that creates an empty file with only the header row (no files needed on the server). You can also upload any .xlsx from your computer.
- After updating the project, run `npm install` once to add the Excel packages.

## Updating an existing database (Comment field)
Run supabase/add-comment.sql once in the Supabase SQL Editor.
