# Postman collection

`RBAC-System.postman_collection.json` covers auth, users, roles, health and an
edge case. The OpenAPI document at `http://localhost:5000/api/docs` describes
every endpoint in full and is the reference; this collection is for quick
manual checks.

## Use

1. Start the API (`npm run dev:api` from the repository root).
2. In Postman: **Import** → select the collection file.
3. Set the `baseUrl` collection variable if the API is not on `http://localhost:5000`
   (on macOS it is often `http://localhost:5001`, since 5000 is used by AirPlay).

## Variables

| Variable  | Set by                                |
| --------- | ------------------------------------- |
| `baseUrl` | you (default `http://localhost:5000`) |
| `token`   | **Auth → Login as Admin**             |
| `userId`  | **Users → Create User**               |
| `roleId`  | **Roles → Create Role** (default `1`) |

## Run order

1. **Auth → Login as Admin** (demo account `admin@test.com` / `test123`).
2. **Users → Create User**, then the other user requests. They act on the
   created user, so the seeded accounts stay untouched.
3. **Roles → Create Role**, then update and delete it.

**Auth → Register User** creates an employee account. Logging in as that
account returns 403 on the users and roles endpoints, which is expected.

## Notes

- Passwords must be at least 8 characters with a letter and a digit.
- `GET /api/users` is paginated: the users are in `data`, paging in `meta`.
- Deleting or deactivating yourself, or the last administrator, is refused.
