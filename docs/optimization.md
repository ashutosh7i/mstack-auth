## Benchmark with bcrypt- 

=== Concurrent Benchmark Results ===
Signup   - avg: 306.64 ms
Login    - avg: 306.03 ms
Verify   - avg: 1.23 ms
Refresh  - avg: 3.45 ms
Logout   - avg: 8.45 ms

=== Parallel Benchmark Results ===
Signup   - avg: 29557.51 ms
Login    - avg: 27571.28 ms
Verify   - avg: 921.23 ms
Refresh  - avg: 432.00 ms
Logout   - avg: 227.37 ms

## Benchmark without no hashing

=== Concurrent Benchmark Results ===
Signup   - avg: 11.05 ms
Login    - avg: 9.40 ms
Verify   - avg: 1.31 ms
Refresh  - avg: 3.50 ms
Logout   - avg: 7.37 ms

=== Parallel Benchmark Results ===
Signup   - avg: 324.52 ms
Login    - avg: 284.29 ms
Verify   - avg: 10.87 ms
Refresh  - avg: 181.24 ms
Logout   - avg: 230.88 ms

## Benchmark with argon2id

=== Concurrent Benchmark Results ===
Signup   - avg: 16.30 ms
Login    - avg: 15.84 ms
Verify   - avg: 1.37 ms
Refresh  - avg: 3.30 ms
Logout   - avg: 7.23 ms

=== Parallel Benchmark Results ===
Signup   - avg: 447.02 ms
Login    - avg: 368.02 ms
Verify   - avg: 8.51 ms
Refresh  - avg: 148.99 ms
Logout   - avg: 193.09 ms

## Benchmark after otp login

--- OTP Benchmark Results (Concurrent) ---
Send OTP   - avg: 10.45 ms
Verify OTP - avg: 40.52 ms

--- OTP Benchmark Results (Parallel) ---
Send OTP   - avg: 188.81 ms
Verify OTP - avg: 1301.29 ms

=== Concurrent Benchmark Results ===
Signup   - avg: 23.43 ms
Login    - avg: 27.77 ms
Verify   - avg: 2.05 ms
Refresh  - avg: 7.16 ms
Logout   - avg: 14.13 ms

=== Parallel Benchmark Results ===
Signup   - avg: 311.36 ms
Login    - avg: 624.47 ms
Verify   - avg: 3.32 ms
Refresh  - avg: 335.34 ms
Logout   - avg: 377.05 ms

## Benchmark after otp login optimization

--- OTP Benchmark Results (Concurrent) ---
Send OTP   - avg: 10.38 ms
Verify OTP - avg: 26.03 ms

--- OTP Benchmark Results (Parallel) ---
Send OTP   - avg: 220.05 ms
Verify OTP - avg: 471.48 ms

=== Concurrent Benchmark Results ===
Signup   - avg: 22.39 ms
Login    - avg: 22.00 ms
Verify   - avg: 1.88 ms
Refresh  - avg: 6.45 ms
Logout   - avg: 11.70 ms

=== Parallel Benchmark Results ===
Signup   - avg: 467.16 ms
Login    - avg: 567.64 ms
Verify   - avg: 3.41 ms
Refresh  - avg: 217.13 ms
Logout   - avg: 343.20 ms

## Benchmark after indexing 

--- OTP Benchmark Results (Concurrent) ---
Send OTP   - avg: 11.28 ms
Verify OTP - avg: 24.79 ms

--- OTP Benchmark Results (Parallel) ---
Send OTP   - avg: 204.91 ms
Verify OTP - avg: 461.13 ms

=== Concurrent Benchmark Results ===
Signup   - avg: 22.50 ms
Login    - avg: 22.41 ms
Verify   - avg: 1.52 ms
Refresh  - avg: 5.25 ms
Logout   - avg: 11.74 ms

=== Parallel Benchmark Results ===
Signup   - avg: 423.11 ms
Login    - avg: 319.77 ms
Verify   - avg: 8.10 ms
Refresh  - avg: 96.40 ms
Logout   - avg: 102.94 ms