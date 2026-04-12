# Implementation Notes

## Key decisions
- Kept all banking API calls inside `AccountsService` to centralize data-access concerns.
- Adopted standalone route definitions for Accounts feature (`accounts.routes.ts`) to align with modern Angular architecture.
- Added typed models for account/user/auth/session and transaction query filters.
- Added functional `CanDeactivateFn` guard to protect from navigation with unsaved transaction filters.
- Standardized loading and error feedback with reusable `<app-loader>` and `<app-error-message>` components.
- Normalized HTTP errors into safe user-facing messages in `httpErrorInterceptor`.

## Tradeoffs
- `jspdf` + related PDF stack still emits CommonJS build warnings, but retained for required statement download behavior.
- JSON-server backend lacks total-count metadata handling for robust server-driven pagination; current UI uses page-size heuristic.

## Future hardening
- Add endpoint contract tests and API adapter layer for production backend.
- Add route-resolver prefetch for account detail/statements.
- Add e2e coverage for timeout/error scenarios and unsaved-filter navigation.
