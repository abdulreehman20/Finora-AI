# Further Steps:

@frontend/src/app/dashboard/(routes)/settings/_components/account-tab.tsx:29 @frontend/src/app/dashboard/_components/navbar-dashboard.tsx:133-136 @frontend/src/app/dashboard/_components/navbar-dashboard.tsx:137-145 @frontend/src/app/dashboard/_components/navbar-dashboard.tsx:210-219 

Fix the sign-out functionality for the two existing sign-out entry points — do not add any new sign-out button anywhere in the application.

**Fix 1 — User Button Sign-Out**
Ensure the sign-out option in the existing user button menu works correctly. On click, it must destroy the user's session, clear all session data, and redirect the user to the landing page.

**Fix 2 — Sessions Card Sign-Out**
Ensure the sign-out button inside the existing Sessions Card works correctly. On click, it must remove the specific session, clear all related session data, and redirect the user to the landing page.

**Constraints:**
- Do not add any new sign-out button or component anywhere in the application
- Both existing sign-out entry points must work identically — session destroyed, data cleared, redirect to landing page
- Test both sign-out flows after fixing and confirm they work correctly end-to-end