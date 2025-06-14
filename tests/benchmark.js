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

async function runBenchmark() {
    console.log(`Running benchmark with ${ITERATIONS} iterations...`);
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
        const signupRes = await signup(username, password);
        let t1 = performance.now();
        metrics.signup.push(t1 - t0);

        // Login
        t0 = performance.now();
        const loginRes = await login(username, password);
        t1 = performance.now();
        metrics.login.push(t1 - t0);

        if (!loginRes.token || !loginRes.refreshToken) {
            console.log(`Iteration ${i + 1}: Login failed, skipping rest.`);
            continue;
        }

        // Verify
        t0 = performance.now();
        const verifyRes = await verify(loginRes.token);
        t1 = performance.now();
        metrics.verify.push(t1 - t0);

        // Refresh
        t0 = performance.now();
        const refreshRes = await refresh(loginRes.refreshToken);
        t1 = performance.now();
        metrics.refresh.push(t1 - t0);

        // Logout
        t0 = performance.now();
        await logout(loginRes.refreshToken);
        t1 = performance.now();
        metrics.logout.push(t1 - t0);
    }

    function avg(arr) {
        return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'n/a';
    }

    console.log('\n=== Benchmark Results ===');
    console.log(`Iterations: ${ITERATIONS}`);
    console.log(`Signup   - avg: ${avg(metrics.signup)} ms`);
    console.log(`Login    - avg: ${avg(metrics.login)} ms`);
    console.log(`Verify   - avg: ${avg(metrics.verify)} ms`);
    console.log(`Refresh  - avg: ${avg(metrics.refresh)} ms`);
    console.log(`Logout   - avg: ${avg(metrics.logout)} ms`);
}

runBenchmark();