
JWT has two problems:

lousy standardization

it is hard to revoke (when used for authentication)

The first can be solved by using your own JWT implementation: put in JSON whatever you want, encrypt it with AES - voila - use it for authentication (also for authorization if needed: put roles inside JSON).

Super minimalistic JWT {"id" : "<id>"}

The second problem requires clarification. With regular sessions which are stored on the server side, there is no revocation problem: the session can be invalidated by the server anytime. But regular sessions have problems with scalability and performance, hence JWT.

A common solution to the revocation problem is to use a refresh-token.

Here is how it can be done:

The refresh token can be the exactly same JWT as the access-token: custom JSON encrypted and base64 encoded. The result string can be just duplicated. If the access-token contains a lot of data (for example roles), the refresh token may be different as it needs only the user id. Both access and refresh tokens don't have any expiry hardcoded inside.
They are both stored in https_only cookies but the expiration time for the access-token cookie is 2 min and for the refresh-token cookie is 30 min.
Refresh-token stored in DB (User table) and can be easily revoked/invalidated by deleting from DB.
Server looks for access-token in request: if presents and valid (can be decrypted) - OK process request;
if the access-token does not present (cookie expired), the server looks for a refresh-token: if presents - validate by comparing it to one stored in DB and generate a new access-token (based on information from the refresh-token and DB) and process the request.
If the refresh-token is not there, then the server looks for one of the following: username-password pair, third-party identity provider token (Google, Facebook, etc.), third-party identity management system token (Cognito, Okta, JumpCloud). If any are found: process the request and generate new access and refresh tokens.
If nothing is found, then the server sends an authentication error and forces the client to relogin the user.


Refresh token flow-

```
  +--------+                                           +---------------+
  |        |--(A)------- Authorization Grant --------->|               |
  |        |                                           |               |
  |        |<-(B)----------- Access Token -------------|               |
  |        |               & Refresh Token             |               |
  |        |                                           |               |
  |        |                            +----------+   |               |
  |        |--(C)---- Access Token ---->|          |   |               |
  |        |                            |          |   |               |
  |        |<-(D)- Protected Resource --| Resource |   | Authorization |
  | Client |                            |  Server  |   |     Server    |
  |        |--(E)---- Access Token ---->|          |   |               |
  |        |                            |          |   |               |
  |        |<-(F)- Invalid Token Error -|          |   |               |
  |        |                            +----------+   |               |
  |        |                                           |               |
  |        |--(G)----------- Refresh Token ----------->|               |
  |        |                                           |               |
  |        |<-(H)----------- Access Token -------------|               |
  +--------+           & Optional Refresh Token        +---------------+
  
  
  (A)  The client requests an access token by authenticating with the
       authorization server and presenting an authorization grant.
  
  (B)  The authorization server authenticates the client and validates
       the authorization grant, and if valid, issues an access token
       and a refresh token.
  
  (C)  The client makes a protected resource request to the resource
       server by presenting the access token.
  
  (D)  The resource server validates the access token, and if valid,
       serves the request.
  
  (E)  Steps (C) and (D) repeat until the access token expires.  If the
       client knows the access token expired, it skips to step (G);
       otherwise, it makes another protected resource request.
  
  (F)  Since the access token is invalid, the resource server returns
       an invalid token error.
  
  (G)  The client requests a new access token by authenticating with
       the authorization server and presenting the refresh token.  The
       client authentication requirements are based on the client type
       and on the authorization server policies.
  
  (H)  The authorization server authenticates the client and validates
       the refresh token, and if valid, issues a new access token (and,
       optionally, a new refresh token).
```



Below are the steps to do revoke your JWT access token:

When you do log in, send 2 tokens (Access token, Refresh token) in response to the client.
The access token will have less expiry time and Refresh will have long expiry time.
The client (Front end) will store refresh token in an httponly cookie and access token in local storage.
The client will use an access token for calling APIs. But when it expires, you call auth server API to get the new token (refresh token is automatically added to http request since it's stored in cookies).
Your auth server will have an API exposed which will accept refresh token and checks for its validity and return a new access token.
Once the refresh token is expired, the User will be logged out.