# Finora AI Backend — Deployment Guide

This guide explains how to deploy the Finora Express backend to **Vercel** production. It covers prerequisites, pre-deployment checks, deployment steps, and common pitfalls based on this project's setup.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Project Requirements](#project-requirements)
4. [Environment Variables](#environment-variables)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Local Testing Before Deploy](#local-testing-before-deploy)
7. [Deploy to Production](#deploy-to-production)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Things to Take Care Of](#things-to-take-care-of)
10. [Common Issues & Fixes](#common-issues--fixes)
11. [Rollback & Monitoring](#rollback--monitoring)

---

## Architecture Overview

On Vercel, this Express app runs as a **single serverless function** (not a long-running Node server).

| Environment | Entry file | How it runs |
|-------------|------------|-------------|
| **Local dev** | `src/server.ts` | Calls `app.listen()` on port `7000` |
| **Vercel production** | `src/app.ts` | Exports `default app` — Vercel handles HTTP |

```
Local:   server.ts → app.ts → routes/middleware
Vercel:  app.ts (default export) → routes/middleware
```

**Production URL:** https://finora-ai-backend.vercel.app

---

## Prerequisites

Before deploying, ensure you have:

| Requirement | Purpose |
|-------------|---------|
| [Vercel CLI](https://vercel.com/docs/cli) (`vercel`) | Deploy from terminal |
| [Git](https://git-scm.com/) | Version control & GitHub integration |
| GitHub repository linked | Auto-deploy on push (optional) |
| Vercel account & project | `finora-ai-backend` under `plurasaasproduction` |
| Node.js 24.x (matches Vercel) | Local build & testing |
| Bun or npm | Install dependencies & run scripts |

**First-time setup (already done for this project):**

```bash
vercel
# Follow prompts: link project, connect GitHub repo
```

This creates a `.vercel/` folder — do not delete it.

---

## Project Requirements

### 1. ESM configuration

This project uses native ES modules. `package.json` must include:

```json
"type": "module"
```

`tsconfig.json` must use Node-compatible ESM settings:

```json
"module": "NodeNext",
"moduleResolution": "NodeNext"
```

> Do **not** use `"moduleResolution": "bundler"` for Vercel/Node deployments. It works with `tsx` locally but breaks in production.

### 2. Import paths with `.js` extensions

All **relative imports** must include the `.js` extension (even in `.ts` files):

```ts
// Correct
import { errorHandler } from "./middlewares/error.middleware.js";
import app from "./app.js";

// Wrong — will crash on Vercel
import { errorHandler } from "./middlewares/error.middleware";
```

### 3. Express app export

`src/app.ts` must export the Express instance as the **default export**:

```ts
export default app;
```

Do **not** call `app.listen()` in `app.ts`. Keep that in `src/server.ts` for local development only.

### 4. `vercel.json`

Minimal config is sufficient:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2
}
```

Vercel auto-detects Express and uses `src/app.ts` as the entry point.

### 5. Build script

```json
"build": "tsc",
"start": "node dist/src/server.js"
```

Vercel runs `build` during deployment. The `start` script is for local production testing only.

---

## Environment Variables

Set these in the [Vercel Project Settings → Environment Variables](https://vercel.com/plurasaasproduction/finora-ai-backend/settings/environment-variables).

**Never commit `.env` to Git.** Use Vercel dashboard or CLI to manage secrets.

### Required for core API

| Variable | Description | Example (production) |
|----------|-------------|----------------------|
| `NEXT_PUBLIC_APP_URL` | Frontend URL (CORS origin) | `https://your-frontend.vercel.app` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend public URL | `https://finora-ai-backend.vercel.app` |

### Database

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |

### Authentication (Better Auth)

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_APP_NAME` | App display name |
| `BETTER_AUTH_SECRET` | Random secret for session signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Email (Resend)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key |
| `MAILER_SENDER` | Verified sender email |

### AI & Storage

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Stripe (subscriptions)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRO_PRICE_ID` | Pro plan price ID |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |

### Sync env vars via CLI

```bash
# Pull production env vars to local .env
vercel env pull .env.local

# Add a new variable
vercel env add DATABASE_URL production
```

---

## Pre-Deployment Checklist

Run through this list before every production deploy:

- [ ] All relative imports use `.js` extensions
- [ ] `src/app.ts` exports `default app` (no `app.listen()`)
- [ ] `bun run build` completes with zero TypeScript errors
- [ ] Local production test passes (`bun run start` or `node dist/src/server.js`)
- [ ] Environment variables are set on Vercel for **Production**
- [ ] `NEXT_PUBLIC_APP_URL` points to the real frontend URL (not `localhost`)
- [ ] `NEXT_PUBLIC_BACKEND_URL` points to the Vercel backend URL
- [ ] Database migrations are applied (`bun run db:migrate` or `db:push`)
- [ ] Stripe webhook URL is updated to production endpoint
- [ ] No secrets or `.env` files are staged in Git
- [ ] Changes are committed and pushed to `main`

---

## Local Testing Before Deploy

### 1. TypeScript build

```bash
bun run build
```

### 2. Run production build locally

```bash
bun run start
# Server starts on http://localhost:7000
```

### 3. Test endpoints

```bash
curl http://localhost:7000/
curl http://localhost:7000/api/health
```

Expected responses:

```json
{ "message": "Welcome to Finora Finance AI SaaS API!" }
{ "message": "API is working!" }
```

### 4. Optional — simulate Vercel locally

```bash
vercel dev
```

Requires Vercel CLI 47.0.5+.

---

## Deploy to Production

### Option A — Vercel CLI (manual)

```bash
# From project root
git add .
git commit -m "Your change description"
git push

vercel --prod
```

### Option B — Git push (automatic)

If GitHub is connected to the Vercel project, pushing to `main` triggers a production deployment automatically.

### Deployment output

After a successful deploy you will see:

```
Production: https://finora-ai-backend.vercel.app
Inspect:    https://vercel.com/plurasaasproduction/finora-ai-backend/...
```

---

## Post-Deployment Verification

### 1. Hit health endpoints

```bash
curl https://finora-ai-backend.vercel.app/
curl https://finora-ai-backend.vercel.app/api/health
```

Both should return `200` with JSON responses.

### 2. Check runtime logs

```bash
vercel logs --environment production --source serverless --since 5m
```

Or view logs in the [Vercel Dashboard](https://vercel.com/plurasaasproduction/finora-ai-backend).

### 3. Verify CORS

Test API calls from your frontend. If blocked, confirm `NEXT_PUBLIC_APP_URL` matches the exact frontend origin (protocol + domain, no trailing slash mismatch).

### 4. Verify webhooks (Stripe)

Stripe webhooks must point to your production URL:

```
https://finora-ai-backend.vercel.app/api/auth/stripe/webhook
```

(Update path if your Better Auth route differs.)

---

## Things to Take Care Of

### Do

| Practice | Why |
|----------|-----|
| Use `.js` extensions in relative imports | Required for Node ESM on Vercel |
| Export `default app` from `app.ts` | Vercel Express entry point |
| Set all env vars in Vercel dashboard | `.env` is not deployed |
| Run `bun run build` before deploying | Catch TypeScript errors early |
| Use `vercel --prod` for production | Preview deploys use preview env vars |
| Keep error middleware last in `app.ts` | Proper error handling in serverless |
| Apply DB migrations before deploy | Schema must match code |

### Don't

| Anti-pattern | Why |
|--------------|-----|
| Call `app.listen()` in `app.ts` | Breaks serverless execution |
| Use `express.static()` for assets | Use `public/` directory on Vercel instead |
| Commit `.env` or secrets | Security risk |
| Use `moduleResolution: "bundler"` | Breaks Node ESM resolution in production |
| Rely on `node-cron` on Vercel | Serverless functions are not always-on; use Vercel Cron Jobs |
| Assume `PORT` env var on Vercel | Vercel manages the port internally |
| Skip production env var updates | `localhost` URLs in production break CORS and auth |

### Vercel-specific limitations

- **Bundle size:** Max ~250 MB per function
- **Execution time:** Default timeout applies (configurable in `vercel.json`)
- **Cold starts:** First request after idle may be slower
- **No persistent filesystem:** Use external storage (Cloudinary, Neon, etc.)
- **Stateless:** No in-memory sessions across requests — use DB/Redis for sessions

---

## Common Issues & Fixes

### `FUNCTION_INVOCATION_FAILED` / 500 error

**Symptom:** Vercel shows "This Serverless Function has crashed."

**Common causes:**

| Error in logs | Fix |
|---------------|-----|
| `ERR_MODULE_NOT_FOUND` for `./middlewares/...` | Add `.js` to relative imports |
| Missing env var | Add variable in Vercel project settings |
| `app.listen()` in entry file | Move `listen()` to `server.ts` only |

**Debug:**

```bash
vercel logs --environment production --level error --since 1h
```

### CORS errors from frontend

- Set `NEXT_PUBLIC_APP_URL` to the exact frontend origin
- Ensure `credentials: true` matches frontend `fetch` config
- Redeploy after changing env vars

### Build passes locally but fails on Vercel

- Check Node version matches (`24.x` in project settings)
- Ensure `husky` prepare script does not block CI (Vercel runs `prepare` on install)
- Review build logs: `vercel inspect <deployment-url> --logs`

### Auth / Stripe webhooks fail in production

- Update redirect URLs in Google Console and Stripe Dashboard
- Use production `STRIPE_WEBHOOK_SECRET` from the live webhook endpoint
- Confirm `BETTER_AUTH_SECRET` is set on Vercel

---

## Rollback & Monitoring

### Instant rollback

In the Vercel dashboard → **Deployments** → select a previous successful deployment → **Promote to Production**.

Or via CLI:

```bash
vercel rollback
```

### Useful commands

```bash
vercel status                          # Project overview
vercel ls                              # List deployments
vercel inspect <deployment-url>        # Deployment details
vercel logs --environment production   # Runtime logs
vercel env ls                          # List env vars (names only)
```

### Monitoring checklist

- Watch error rate in Vercel **Observability**
- Monitor Neon database connections and query performance
- Check Stripe webhook delivery logs after deploys
- Verify Better Auth session flow end-to-end from the frontend

---

## Quick Reference

```bash
# Full deploy workflow
bun run build
bun run start                    # local smoke test
git add . && git commit -m "..." && git push
vercel --prod

# Verify
curl https://finora-ai-backend.vercel.app/api/health
```

| Resource | URL |
|----------|-----|
| Production API | https://finora-ai-backend.vercel.app |
| Vercel Dashboard | https://vercel.com/plurasaasproduction/finora-ai-backend |
| GitHub Repo | https://github.com/abdulreehman20/FinoraAI-Backend |
| Express on Vercel Docs | https://vercel.com/docs/frameworks/backend/express |

---

*Last updated: June 2026 — Finora AI Backend v1.0.0*
