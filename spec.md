# PawMart

## Current State
PawMart is a full-stack animal meds and foods e-commerce app. It has:
- A product storefront with categories (Dogs, Cats, Birds, Fish, Medicines)
- Shopping cart and order placement
- Admin panel for product/order/customer management
- Authorization system with admin/user roles
- The backend has `claimFirstAdmin()`, `forceClaimAdminWithToken()`, and products/orders/users management
- **Bug**: `forceClaimAdminWithToken()` compares the token against the literal string `"CAFFEINE_ADMIN_TOKEN"` instead of the real environment variable, so it never works
- The admin is stuck in an "Admin Access Required" loop with no way to claim admin

## Requested Changes (Diff)

### Add
- `resetAndClaimAdmin()` backend function: resets any existing admin assignment and makes the caller the new admin. No token required. Works whether or not admin was previously assigned.
- Fix `forceClaimAdminWithToken()` to use `Runtime.env("CAFFEINE_ADMIN_TOKEN")` instead of the hardcoded string

### Modify
- Admin page frontend: replace the token form fallback with a simple "Claim Admin" button that calls `resetAndClaimAdmin()` directly
- The auto-claim flow should first try `claimFirstAdmin()`, and if that returns false (already claimed), show a button to call `resetAndClaimAdmin()`

### Remove
- The confusing "where to find your token" instructions since we no longer need them for the primary flow

## Implementation Plan
1. Regenerate backend with fixed `forceClaimAdminWithToken` (uses Runtime.env) and new `resetAndClaimAdmin` function
2. Update AdminPage.tsx to use the simpler `resetAndClaimAdmin()` flow when `claimFirstAdmin()` returns false
