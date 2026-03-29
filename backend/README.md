Act as a senior Full Stack Developer.

Add Stripe to my backend using Better Auth by following the official documentation strictly:
https://better-auth.com/docs/plugins/stripe

Your task is to implement Stripe subscription support in my existing backend and frontend without breaking any current Better Auth features.

Backend Requirements
- Add Stripe integration using Better Auth.
- Make sure all existing schemas, APIs, and Better Auth routes continue to work properly without errors.
- Update the subscription schema so it matches my backend structure.
- Remove or replace any old payment/subscription logic if needed.
- Add proper Stripe webhook handling and subscription status updates.
- Make sure a user can upgrade to Pro by clicking Upgrade to Pro, then redirect them to the Stripe Checkout page and charge $10 USD.
- After payment, update the user plan so they get access to all premium features.
- Create seed data according to all existing schemas and add it to the database.

Frontend Requirements
- On the home/dashboard page, if the user is on the free plan, show only the last 7 days analytics data.
- If the free user tries to view more analytics like monthly, 3 months, all time, or other ranges, show a message on the chart telling them to upgrade their plan to see more analytics.
- After upgrading to Pro, show all analytics data normally.
- On the transaction page, add proper pagination in the data table so the user can browse all transactions across multiple pages. Make sure pagination works correctly.
- On the dashboard page, the Recent Transactions section must show the latest real transactions from the database, not dummy data.
     - If no recent transaction exists, show: No transaction available
    - If recent transactions exist, show the latest ones
- On the reports page, show real report data from the database in the data table.
    - If no reports exist, show: No reports available

Stripe Setup Guide

After implementation, create a guide that explains:
-  How to configure Stripe in the Stripe dashboard
-  Which credentials and environment variables are needed
-  How to test Stripe checkout and subscription flow
-  How to verify the user plan updates correctly after payment

Testing Requirements
- Test all API routes
- Test subscription routes
- Test Stripe checkout flow
- Test webhook and plan update flow
- Make sure everything works properly without errors

Rules
- Follow the official Better Auth Stripe documentation only
- Keep the code clean, production-ready, and aligned with my backend structure
- Do not add unrelated features
- Make sure the full subscription system works end-to-end

Now implement this carefully and make sure everything works properly.