# PawMart

## Current State
Full e-commerce app for animal meds and food. Has products, cart, orders, admin panel. Admin access uses a two-stage system: `claimFirstAdmin` (works only if no admin assigned) and `resetAndClaimAdmin` (only works if no admin assigned OR caller is already admin). This creates a deadlock: if a previous deployment set `adminAssigned = true` with a different principal, the current user cannot claim admin.

## Requested Changes (Diff)

### Add
- New backend function `forceResetAdmin()` that unconditionally resets `adminAssigned` to false and assigns the caller as admin, with no authorization check (any authenticated non-anonymous caller can invoke it). This breaks the deadlock.

### Modify
- `resetAndClaimAdmin` backend function: remove the block that prevents non-admins from resetting when admin is already assigned -- replace with the unconditional force-reset logic.
- Frontend `ClaimAdminPanel`: the "Claim Admin Access" button should call `resetAndClaimAdmin` (already does), which now works unconditionally for any logged-in user.

### Remove
- The conditional guard in `resetAndClaimAdmin` that blocks non-admins when `adminAssigned == true`.

## Implementation Plan
1. Regenerate Motoko backend with updated `resetAndClaimAdmin` that force-resets admin unconditionally for any non-anonymous caller.
2. Keep all existing product, order, user management functions intact.
3. No frontend changes needed -- `ClaimAdminPanel` already calls `resetAndClaimAdmin`.
