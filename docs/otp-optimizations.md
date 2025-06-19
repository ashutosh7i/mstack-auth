1. Reduced Unnecessary Writes to the Database
Added a new service function markOtpVerifiedIfNeeded(phoneNo, code) that updates the OTP status to "verified" only if it is not already "verified" or "user_created".
This prevents repeated or redundant updates to the same OTP entry, especially under high concurrency.
2. Separated OTP Status Update from Verification
Refactored verifyOtpCode(phoneNo, code) to only check validity (existence, status, and expiry) and not update the status.
Status updates are now handled explicitly in the controller, based on whether the user is new or existing.
3. Controller Logic Optimization
In the OTP verification controller:
If the user is new, after creation, the OTP status is set to "user_created".
If the user already exists, the OTP status is set to "verified" only if needed (using the new service function).
This ensures the OTP status accurately reflects the user flow and avoids unnecessary DB writes.
4. Performance Impact
These changes reduce write contention and improve performance for the /otp-verify endpoint, especially under parallel load.
Summary Table:

Scenario	Status Update Logic
New user	Set OTP status to "user_created"
Existing user	Set OTP status to "verified" (only if not already set)
Result:

Fewer DB writes.
More accurate OTP status tracking.
Improved performance and scalability for OTP verification.