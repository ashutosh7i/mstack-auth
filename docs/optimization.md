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