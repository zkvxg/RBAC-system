# Postman Collection – RBAC Backend

This folder contains a ready-to-import Postman collection for quick manual API checks

## Files

- `RBAC-System.postman_collection.json` – main collection for auth, roles, users, and edge-case requests

## How to use

1. Open Postman
2. Click **Import**
3. Select `RBAC-System.postman_collection.json` from this folder
4. Make sure backend is running on `http://localhost:5000`

## Collection variables

The collection uses these variables:

- `baseUrl` (default: `http://localhost:5000`)
- `token` (filled automatically after login)
- `userId` (default: `1`)
- `roleId` (default: `1`, updated automatically after creating a role)

## Recommended run order

1. `Auth -> Register User`
2. `Auth -> Login (Save Token)`
3. Protected endpoints (Profile, Roles, Users)

## Auto scripts included

- **Login (Save Token)** saves JWT token to collection variable `token`
- **Create Role** saves returned role id to collection variable `roleId`

## Notes

- This collection is for quick manual smoke/debug checks
- Automated regression tests are already covered separately by Playwright tests
