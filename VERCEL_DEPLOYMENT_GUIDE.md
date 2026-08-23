# Vercel CLI Deployment Guide

This repo is a monorepo. The Next.js app lives in `frontend/` and the Express API lives in `backend/`. They are two Vercel projects, both linked to [`abdulreehman20/Finora-AI`](https://github.com/abdulreehman20/Finora-AI), with **Root Directory** set to `frontend` and `backend`.

| App | Vercel project | Production URL |
| --- | --- | --- |
| Next.js | `finora-ai` | https://finora-ai-nine.vercel.app |
| Express | `finora-ai-backend` | https://finora-ai-backend.vercel.app |

Team: `plurasaasproduction`. Production branch: `main`.

`finora-ai.vercel.app` was already taken, so the frontend uses the `finora-ai-nine.vercel.app` alias.

---

## 1. Install and authenticate the CLI

```bash
npm install -g vercel
vercel login
vercel whoami
```

Confirm the scope is the team that owns these projects:

```bash
vercel teams ls
```

Use `--scope plurasaasproduction` on commands when you are not already linked.

---

## 2. Link a local folder to a Vercel project

From each app directory (creates a gitignored `.vercel/` folder):

```bash
vercel link --yes --scope plurasaasproduction --project finora-ai --cwd frontend
vercel link --yes --scope plurasaasproduction --project finora-ai-backend --cwd backend
```

Connect GitHub (already done for these projects):

```bash
vercel git connect https://github.com/abdulreehman20/Finora-AI --cwd frontend --yes --scope plurasaasproduction
vercel git connect https://github.com/abdulreehman20/Finora-AI --cwd backend --yes --scope plurasaasproduction
```

Set **Root Directory** in Project Settings → General:

- `finora-ai` → `frontend`
- `finora-ai-backend` → `backend`

---

## 3. Deploy with the CLI

Because Root Directory is `frontend` / `backend`, run production deploys from the **repository root** with the project IDs (running `vercel --cwd frontend` would look for `frontend/frontend`).

```bash
# Backend
set VERCEL_ORG_ID=team_5e5JwGVh6iWwQHIzqFhWiu3I
set VERCEL_PROJECT_ID=prj_lJzCXaP0Ot6MT4eWTX0IQ5U2MdYA
vercel --prod --yes --scope plurasaasproduction

# Frontend
set VERCEL_PROJECT_ID=prj_rfp5CYnu2TuNj88wUHuTBZBXUmNv
vercel --prod --yes --scope plurasaasproduction
```

On PowerShell, assign `$env:VERCEL_ORG_ID` and `$env:VERCEL_PROJECT_ID` instead of `set`.

Force a clean rebuild:

```bash
vercel --prod --yes --force --scope plurasaasproduction
```

Preview deploy (omit `--prod`):

```bash
vercel --yes --scope plurasaasproduction
```

### Git-triggered deploys

A push to `main` on GitHub creates a **production** deployment for both projects. Other branches create **preview** deployments.

---

## 4. Environment variables

### Frontend (`finora-ai`)

| Name | Production value |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://finora-ai-nine.vercel.app` |
| `NEXT_PUBLIC_BACKEND_URL` | `https://finora-ai-backend.vercel.app` |

### Backend (`finora-ai-backend`)

Required (copied from local `backend/.env`, never commit that file):

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_APP_NAME`
- `MAILER_SENDER`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_APP_URL` — CORS + Better Auth trusted origin (`https://finora-ai-nine.vercel.app`)
- `NEXT_PUBLIC_BACKEND_URL` — Better Auth `baseURL` (`https://finora-ai-backend.vercel.app`)
- `FRONTEND_URL` — extra CORS origin (same as the frontend URL)

Do **not** set `INNGEST_DEV=1` in production.

Add or overwrite a variable:

```bash
vercel env add DATABASE_URL production --yes --force --sensitive --cwd backend --scope plurasaasproduction --value "postgresql://..."
```

Public URL example:

```bash
vercel env add NEXT_PUBLIC_BACKEND_URL production --yes --force --cwd frontend --scope plurasaasproduction --value "https://finora-ai-backend.vercel.app"
```

For Preview, newer CLI versions may ask for a Git branch. Add `--value` immediately after the environment name, or pass a branch as the third argument.

List names only (values stay encrypted):

```bash
vercel env ls --cwd frontend --scope plurasaasproduction
vercel env ls --cwd backend --scope plurasaasproduction
```

Pull into a local file (do not commit it):

```bash
vercel env pull .env.local --cwd frontend --scope plurasaasproduction
```

Remove:

```bash
vercel env rm VARIABLE_NAME production --yes --cwd backend --scope plurasaasproduction
```

`NEXT_PUBLIC_*` values are inlined at **build** time. After changing them, create a new production deployment.

---

## 5. Manual redeploy

```bash
vercel --prod --yes --force --scope plurasaasproduction
```

Or redeploy an existing deployment URL:

```bash
vercel redeploy https://finora-ai-nine.vercel.app --yes --scope plurasaasproduction
```

Promote a previous deployment from the dashboard: Deployments → ⋮ → Promote to Production. CLI:

```bash
vercel rollback --scope plurasaasproduction
```

---

## 6. Logs and debugging

Inspect a deployment (replace with the URL printed by `vercel`):

```bash
vercel inspect https://finora-ai-backend.vercel.app --scope plurasaasproduction
vercel inspect https://finora-ai-backend.vercel.app --logs --scope plurasaasproduction
```

Runtime logs:

```bash
vercel logs https://finora-ai-backend.vercel.app --scope plurasaasproduction
```

Dashboard:

- Frontend: https://vercel.com/plurasaasproduction/finora-ai
- Backend: https://vercel.com/plurasaasproduction/finora-ai-backend

### Common issues

| Symptom | Likely cause |
| --- | --- |
| `The provided path “.../backend/backend” does not exist` | CLI was run from `backend/` while Root Directory is already `backend`. Deploy from the repo root with `VERCEL_PROJECT_ID`. |
| `FUNCTION_INVOCATION_FAILED` / missing module | Relative imports must use `.js` extensions (Node ESM). |
| CORS 500 on API | `NEXT_PUBLIC_APP_URL` / `FRONTEND_URL` must match the exact frontend origin (scheme + host, no trailing slash). Redeploy the backend after changing them. |
| Auth / cookies fail | Same origin mismatch; also update Better Auth trusted origins via those env vars. |
| `husky` / `.git can't be found` | Harmless if install still succeeds. `backend/vercel.json` sets `HUSKY=0 bun install`. |
| Stripe webhooks fail | Point Stripe at `https://finora-ai-backend.vercel.app/api/auth/stripe/webhook` and use the matching `STRIPE_WEBHOOK_SECRET`. |

Smoke tests:

```bash
curl https://finora-ai-backend.vercel.app/
curl https://finora-ai-backend.vercel.app/api/health
curl -I https://finora-ai-nine.vercel.app
```

---

## 7. GitHub integration

Both projects are connected to `https://github.com/abdulreehman20/Finora-AI`.

- Push / merge to `main` → production deploy for **both** apps
- Push another branch → preview deploy
- Disconnect: `vercel git disconnect --cwd frontend` (and the same for `backend`)

After changing `vercel.json` or serverless entry files, commit and push so Git deploys stay in sync with CLI deploys.

### Backend serverless entry

Local dev still uses `backend/src/server.ts` (`app.listen`). Production uses `backend/api/index.ts`, which re-exports the Express `app`. `backend/vercel.json` rewrites all routes to that function.

---

## 8. Post-deploy checklist

- [ ] `GET /` and `GET /api/health` on the backend return JSON
- [ ] Frontend homepage loads
- [ ] CORS allows `https://finora-ai-nine.vercel.app`
- [ ] Stripe webhook URL updated for production
- [ ] Google OAuth redirect URIs include the production frontend URL (if you enable Google sign-in)
- [ ] Inngest production keys set if background jobs should run on Vercel (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`)
