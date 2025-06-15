const API = 'http://localhost:5000/auth';
const ITERATIONS = 100;

function randomUser() {
    const id = Math.floor(Math.random() * 1000000);
    return {
        username: `benchuser_${id}_${Date.now()}`,
        password: 'benchpass'
    };
}

async function signup(username, password) {
    const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

async function login(username, password) {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

async function verify(token) {
    const res = await fetch(`${API}/verify`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    return res.json();
}

async function refresh(refreshToken) {
    const res = await fetch(`${API}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    return res.json();
}

async function logout(refreshToken) {
    const res = await fetch(`${API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    return res.json();
}

// --- Concurrent Benchmark (sequential, one after another) ---
async function runConcurrentBenchmark() {
    const metrics = {
        signup: [],
        login: [],
        verify: [],
        refresh: [],
        logout: []
    };

    for (let i = 0; i < ITERATIONS; i++) {
        const { username, password } = randomUser();

        // Signup
        let t0 = performance.now();
        await signup(username, password);
        let t1 = performance.now();
        metrics.signup.push(t1 - t0);

        // Login
        t0 = performance.now();
        const loginRes = await login(username, password);
        t1 = performance.now();
        metrics.login.push(t1 - t0);

        if (!loginRes.token || !loginRes.refreshToken) {
            continue;
        }

        // Verify
        t0 = performance.now();
        await verify(loginRes.token);
        t1 = performance.now();
        metrics.verify.push(t1 - t0);

        // Refresh
        t0 = performance.now();
        await refresh(loginRes.refreshToken);
        t1 = performance.now();
        metrics.refresh.push(t1 - t0);

        // Logout
        t0 = performance.now();
        await logout(loginRes.refreshToken);
        t1 = performance.now();
        metrics.logout.push(t1 - t0);
    }

    function avg(arr) {
        return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    }

    return {
        signup: avg(metrics.signup),
        login: avg(metrics.login),
        verify: avg(metrics.verify),
        refresh: avg(metrics.refresh),
        logout: avg(metrics.logout)
    };
}

// --- Parallel Benchmark (all in parallel) ---
async function runSingleBenchmark(i) {
    const { username, password } = randomUser();
    const metrics = {};

    // Signup
    let t0 = performance.now();
    await signup(username, password);
    let t1 = performance.now();
    metrics.signup = t1 - t0;

    // Login
    t0 = performance.now();
    const loginRes = await login(username, password);
    t1 = performance.now();
    metrics.login = t1 - t0;

    if (!loginRes.token || !loginRes.refreshToken) {
        metrics.verify = metrics.refresh = metrics.logout = null;
        return metrics;
    }

    // Verify
    t0 = performance.now();
    await verify(loginRes.token);
    t1 = performance.now();
    metrics.verify = t1 - t0;

    // Refresh
    t0 = performance.now();
    await refresh(loginRes.refreshToken);
    t1 = performance.now();
    metrics.refresh = t1 - t0;

    // Logout
    t0 = performance.now();
    await logout(loginRes.refreshToken);
    t1 = performance.now();
    metrics.logout = t1 - t0;

    return metrics;
}

async function runParallelBenchmark() {
    const results = await Promise.all(
        Array.from({ length: ITERATIONS }, (_, i) => runSingleBenchmark(i))
    );

    function avg(arr) {
        const filtered = arr.filter(x => typeof x === 'number');
        return filtered.length ? (filtered.reduce((a, b) => a + b, 0) / filtered.length) : 0;
    }

    return {
        signup: avg(results.map(r => r.signup)),
        login: avg(results.map(r => r.login)),
        verify: avg(results.map(r => r.verify)),
        refresh: avg(results.map(r => r.refresh)),
        logout: avg(results.map(r => r.logout))
    };
}

async function main() {
    console.log('Running concurrent benchmark...');
    const concurrent = await runConcurrentBenchmark();
    console.log('\n=== Concurrent Benchmark Results ===');
    console.log(`Signup   - avg: ${concurrent.signup.toFixed(2)} ms`);
    console.log(`Login    - avg: ${concurrent.login.toFixed(2)} ms`);
    console.log(`Verify   - avg: ${concurrent.verify.toFixed(2)} ms`);
    console.log(`Refresh  - avg: ${concurrent.refresh.toFixed(2)} ms`);
    console.log(`Logout   - avg: ${concurrent.logout.toFixed(2)} ms`);

    console.log('\nRunning parallel benchmark...');
    const parallel = await runParallelBenchmark();
    console.log('\n=== Parallel Benchmark Results ===');
    console.log(`Signup   - avg: ${parallel.signup.toFixed(2)} ms`);
    console.log(`Login    - avg: ${parallel.login.toFixed(2)} ms`);
    console.log(`Verify   - avg: ${parallel.verify.toFixed(2)} ms`);
    console.log(`Refresh  - avg: ${parallel.refresh.toFixed(2)} ms`);
    console.log(`Logout   - avg: ${parallel.logout.toFixed(2)} ms`);
}

main();