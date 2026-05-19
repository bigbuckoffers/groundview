# GroundView SaaS Starter

A real SaaS starter for boots-on-ground real estate photos, AI/photo edit requests, and repair estimates.

## What works now

- Landing page converted from the original HTML concept
- Photo order form calls `/api/create-photo-order`
- Stripe checkout route exists and runs in demo mode until keys are added
- Repair estimator works immediately with a built-in cost model
- Optional OpenAI repair estimate route if `OPENAI_API_KEY` is added
- Photo edit request queue endpoint
- Customer dashboard page
- Admin dashboard shell
- Supabase SQL schema

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## GitHub setup

```bash
git init
git add .
git commit -m "Build GroundView SaaS starter"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/groundview.git
git push -u origin main
```

## Deployment

Use GitHub as the repo. Deploy the app to Vercel when ready. Add environment variables in Vercel.

## Required env variables for live mode

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY` optional

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor.

## Next production upgrades

1. Add Supabase Auth login/signup.
2. Replace dashboard demo rows with real Supabase queries.
3. Add file uploads to Supabase Storage or Cloudinary.
4. Add admin upload of completed photos.
5. Add Stripe subscription plans.
6. Add real image editing provider for declutter/virtual staging.
