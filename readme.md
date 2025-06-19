# mstack-auth: JWT Authentication Microservice

## Overview

This microservice provides authentication and authorization using JWT (JSON Web Tokens) with Fastify. It supports user signup, login, JWT verification, refresh token rotation, OTP-based login, and logout (refresh token revocation). Passwords are securely hashed using bcrypt.  
**The service is fully database-backed using Drizzle ORM and MySQL, with production-ready modular code structure.**

---

## Capabilities

- **User Registration (`/signup`):**  
  Allows new users to register with a username and password. Passwords are hashed using bcrypt before storage and saved in the database.

- **User Login (`/login`):**  
  Authenticates users and issues a short-lived access token and a long-lived refresh token. The refresh token is stored in the database for revocation support.

- **OTP Login (`/otp-send`, `/otp-verify`):**  
  Allows users to log in or sign up using a one-time password (OTP) sent to their phone number. Handles OTP generation, sending, verification, and user creation if needed. Optimized for high concurrency and minimal DB writes.

- **JWT Verification (`/verify`):**  
  Verifies the validity of an access token and ensures it is of the correct type. Returns user information if valid.

- **Token Refresh (`/refresh`):**  
  Allows clients to obtain a new access token using a valid, non-revoked refresh token.

- **Logout (`/logout`):**  
  Revokes a refresh token by removing it from the database, preventing its further use for obtaining new access tokens.

- **Password & OTP Security:**  
  All passwords are hashed with bcrypt. OTPs are securely generated, stored, and status-tracked with minimal DB writes.

- **Error Handling:**  
  All endpoints log detailed errors server-side and return only generic error messages to clients.

- **CORS Support:**  
  Cross-origin requests are allowed for development. (Restrict in production.)

- **Database-Backed & Indexed:**  
  Users, refresh tokens, and OTP codes are stored in the database using Drizzle ORM. All relevant fields are indexed for high performance under load.

---

## Code Structure

```
auth-server/
│
├── src/
│   ├── db/
│   │   ├── index.ts           # Drizzle DB connection
│   │   └── schemas/           # Table schemas (users, refresh_tokens, otp_codes)
│   ├── controllers.ts # Fastify route handlers (controllers)
│   ├── services.ts    # Database/data logic (services)
│   │── routes.ts      # Route registration
│   └── main.ts                # Fastify app entry point
├── tests/
│   ├── test.js                # Automated test script (password & OTP flows)
│   ├── benchmark.js           # Benchmark script (password & OTP flows)
│   └── demo.html              # Manual test UI
├── .env.example                       # Environment variables
└── ...                        # (Other supporting files)
```

---

## Endpoints

### use `/auth` route prefix

### 1. **POST `/signup`**

Register a new user.

**Request Body:**

```json
{
  "username": "yourname",
  "password": "yourpassword"
}
```

**Response:**

- `200 OK` on success:  
  `{ "success": true, "message": "User registered successfully" }`
- `400 Bad Request` if missing fields.
- `409 Conflict` if user exists.

---

### 2. **POST `/login`**

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "username": "yourname",
  "password": "yourpassword"
}
```

**Response:**

- `200 OK` on success:  
  `{ "token": "<accessToken>", "refreshToken": "<refreshToken>" }`
- `401 Unauthorized` if credentials are invalid.

---

### 3. **POST `/otp-send`**

Request an OTP for login or signup.

**Request Body:**

```json
{
  "phoneNo": "+1234567890"
}
```

**Response:**

- `200 OK` on success:  
  `{ "success": true, "message": "OTP sent" }`
- `400 Bad Request` if invalid phone number or rate limit exceeded.

---

### 4. **POST `/otp-verify`**

Verify an OTP and log in or create user.

**Request Body:**

```json
{
  "phoneNo": "+1234567890",
  "otp": "123456"
}
```

**Response:**

- `200 OK` on success:  
  `{ "success": true, "token": "<accessToken>", "refreshToken": "<refreshToken>", "newUser": true|false }`
- `400 Bad Request` if code is invalid or expired.

---

### 5. **GET `/verify`**

Verify an access token.

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Response:**

- `200 OK` if valid:  
  `{ "valid": true, "user": { "username": "..." } }`
- `401 Unauthorized` if invalid or not an access token.

---

### 6. **POST `/refresh`**

Get a new access token using a refresh token.

**Request Body:**

```json
{
  "refreshToken": "<refreshToken>"
}
```

**Response:**

- `200 OK` on success:  
  `{ "token": "<newAccessToken>" }`
- `401 Unauthorized` if token is revoked, invalid, or not a refresh token.

---

### 7. **POST `/logout`**

Revoke a refresh token (logout).

**Request Body:**

```json
{
  "refreshToken": "<refreshToken>"
}
```

**Response:**

- `200 OK` on success:  
  `{ "success": true, "message": "Logged out" }`

---

## How It Works

- **Signup:**  
  Hashes the password and stores the user in the database.
- **Login:**  
  Verifies credentials, issues JWT access and refresh tokens, and stores the refresh token in the database.
- **OTP Login:**  
  Generates and sends OTP, verifies OTP, creates user if needed, and issues tokens. Optimized to minimize DB writes and ensure robust status tracking.
- **Verify:**  
  Checks the access token and ensures it is of type `"access"`.
- **Refresh:**  
  Checks if the refresh token is valid and not revoked, then issues a new access token.
- **Logout:**  
  Removes the refresh token from the database, revoking it.

---

## Security & Performance Notes

- **Passwords** are hashed with bcrypt before storage.
- **OTPs** are securely generated, status-tracked, and only update DB when needed ("verified"/"user_created").
- **Access tokens** are short-lived (5 minutes).
- **Refresh tokens** are long-lived (7 days) and can be revoked.
- **Error messages** are generic to avoid leaking sensitive info.
- **CORS** is enabled
- **All user, token, and OTP data is stored in the database.**
- **All relevant fields are indexed** for high performance (see schema docs).
- **Blank passwords** are handled for OTP-created users to prevent login errors.

---

## How to Use

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure your `.env` file:**
   ```
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=5m
   PORT=5000
   DATABASE_URL=mysql://user:pass@host:port/dbname
   ```
3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```
4. **Start the server:**
   ```bash
   npm run dev
   ```
5. **Test endpoints:**
   - Use the included `demo.html`, `test.js`, or tools like Postman/curl.
   - Register, login, OTP login, verify, refresh, and logout as described above.

---

## Example: Using with `demo.html`

Open `tests/demo.html` in your browser and use the forms to:

- Register a user
- Login and get tokens
- OTP login (send/verify)
- Verify access tokens
- Refresh tokens
- Logout (revoke refresh token)

---

## Testing & Benchmarking

- **Automated tests** (`tests/test.js`) cover both password and OTP login flows, including edge cases and error handling.
- **Benchmarking** (`tests/benchmark.js`) measures performance of both classic and OTP flows under concurrent and parallel load, with clear output.
- **Dynamic test data** ensures no collisions during OTP tests.

---

## References

- [@fastify/jwt documentation](./docs/fastify-readme.md)
- [fastify-bcrypt documentation](./docs/fastify-bcrypt.md)
- [JWT Best Practices](./docs/jwt-best-practises.md)
- [Drizzle ORM documentation](https://orm.drizzle.team/)
- [Optimization notes](./docs/optimization.md)
- [OTP optimizations](./docs/otp-optimizations.md)

---

**This microservice is a solid foundation for authentication in modern web and mobile apps.  
All user, token, and OTP data is stored in a database with robust indexing. Review security best practices before production deployment.**
