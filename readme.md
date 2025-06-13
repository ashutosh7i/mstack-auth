# Fastify JWT Authentication Microservice

## Overview

This microservice provides authentication and authorization using JWT (JSON Web Tokens) with Fastify. It supports user signup, login, JWT verification, refresh token rotation, and logout (refresh token revocation). Passwords are securely hashed using bcrypt. The service is designed for extensibility and can be adapted to use a persistent database instead of in-memory stores.

---

## Capabilities

The code in `server.js` provides the following capabilities:

- **User Registration (`/signup`):**  
  Allows new users to register with a username and password. Passwords are hashed using bcrypt before storage.

- **User Login (`/login`):**  
  Authenticates users and issues a short-lived access token and a long-lived refresh token. The refresh token is stored in memory for revocation support.

- **JWT Verification (`/verify`):**  
  Verifies the validity of an access token and ensures it is of the correct type. Returns user information if valid.

- **Token Refresh (`/refresh`):**  
  Allows clients to obtain a new access token using a valid, non-revoked refresh token.

- **Logout (`/logout`):**  
  Revokes a refresh token, preventing its further use for obtaining new access tokens.

- **Password Security:**  
  All passwords are hashed with bcrypt before being stored.

- **Error Handling:**  
  All endpoints log detailed errors server-side and return only generic error messages to clients.

- **CORS Support:**  
  Cross-origin requests are allowed for development. (Restrict in production.)

- **In-memory Stores:**  
  Users and refresh tokens are stored in arrays for demonstration. Replace with a database for production use.

---

## Code Structure

```
auth-server/
│
├── server.js                # Main Fastify server with all endpoints
├── fastify-bcrypt.md        # Documentation for fastify-bcrypt usage
├── fastify-readme.md        # Documentation for @fastify/jwt usage
├── jwt-best-practises.md    # JWT security and usage best practices
├── test.html                # Simple HTML client for manual endpoint testing
└── ...                      # (Other supporting files)
```

---

## Endpoints

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

### 3. **GET `/verify`**

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

### 4. **POST `/refresh`**

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

### 5. **POST `/logout`**

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
  Hashes the password and stores the user in memory.
- **Login:**  
  Verifies credentials, issues JWT access and refresh tokens, and stores the refresh token in memory.
- **Verify:**  
  Checks the access token and ensures it is of type `"access"`.
- **Refresh:**  
  Checks if the refresh token is valid and not revoked, then issues a new access token.
- **Logout:**  
  Removes the refresh token from the in-memory store, revoking it.

---

## Security Notes

- **Passwords** are hashed with bcrypt before storage.
- **Access tokens** are short-lived (5 minutes, adjust as needed).
- **Refresh tokens** are long-lived (7 days, adjust as needed) and can be revoked.
- **Error messages** are generic to avoid leaking sensitive info.
- **CORS** is open for development; restrict in production.
- **In-memory stores** are for demonstration only.  
  **Use a database for users and refresh tokens in production.**
- **Always use HTTPS** in production.

---

## How to Use

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   node server.js
   ```
3. **Test endpoints:**
   - Use the included `test.html` or tools like Postman/curl.
   - Register, login, verify, refresh, and logout as described above.

---

## Extending for Production

- Replace in-memory `users` and `refreshTokens` arrays with a database (e.g., MongoDB, PostgreSQL).
- Implement user roles/permissions as needed.
- Add rate limiting and brute-force protection.
- Use environment variables for secrets and configuration.
- Restrict CORS and enforce HTTPS.

---

## Example: Using with `test.html`

Open `test.html` in your browser and use the forms to:

- Register a user
- Login and get tokens
- Verify access tokens
- Refresh tokens
- Logout (revoke refresh token)

---

## References

- [@fastify/jwt documentation](./fastify-readme.md)
- [fastify-bcrypt documentation](./fastify-bcrypt.md)
- [JWT Best Practices](./jwt-best-practises.md)

---

**This microservice is a solid foundation for authentication in modern web and mobile apps.  
Replace in-memory stores with a database and review security best practices before production deployment.**
