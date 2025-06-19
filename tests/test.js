const API = 'http://localhost:5000/auth';

const results = {
    signup: false,
    login: false,
    verify: false,
    refresh: false,
    verifyRefreshed: false,
    logout: false,
    refreshAfterLogout: false
};

async function signup(username, password) {
    const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    results.signup = data.success === true;
    console.log('Signup:', data);
    return data;
}

async function login(username, password) {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    results.login = !!(data.token && data.refreshToken);
    console.log('Login:', data);
    return data;
}

async function verify(token) {
    const res = await fetch(`${API}/verify`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    results.verify = data.valid === true;
    console.log('Verify:', data);
    return data;
}

async function verifyRefreshed(token) {
    const res = await fetch(`${API}/verify`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    results.verifyRefreshed = data.valid === true;
    console.log('Verify (refreshed):', data);
    return data;
}

async function refresh(refreshToken) {
    const res = await fetch(`${API}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    results.refresh = !!data.token;
    console.log('Refresh:', data);
    return data;
}

async function logout(refreshToken) {
    const res = await fetch(`${API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    results.logout = data.success === true;
    console.log('Logout:', data);
    return data;
}

async function refreshAfterLogout(refreshToken) {
    const res = await fetch(`${API}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    results.refreshAfterLogout = data.error ? true : false;
    console.log('Refresh after logout (should fail):', data);
    return data;
}

// OTP-based login tests
async function otpSend(phoneNo) {
    const res = await fetch(`${API}/otp-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo })
    });
    return res.json();
}

async function otpVerify(phoneNo, otp) {
    const res = await fetch(`${API}/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo, otp })
    });
    return res.json();
}

async function runOtpTests() {
    // Use a dynamic phone number for each test run
    const phoneNew = '1' + Math.floor(1000000000 + Math.random() * 9000000000);
    let res = await otpSend(phoneNew);
    let verifyRes = await otpVerify(phoneNew, res.otp);
    results.otpNewUser = res.success && res.otp && verifyRes.success && verifyRes.newUser === true;

    // Existing user OTP login (same phone number)
    res = await otpSend(phoneNew);
    verifyRes = await otpVerify(phoneNew, res.otp);
    results.otpExistingUser = res.success && res.otp && verifyRes.success && verifyRes.newUser === false;

    // Invalid OTP
    const phoneInvalid = '1' + Math.floor(1000000000 + Math.random() * 9000000000);
    res = await otpSend(phoneInvalid);
    verifyRes = await otpVerify(phoneInvalid, '000000');
    results.otpInvalid = verifyRes && verifyRes.success === false;

    // Missing phone number
    const resMissing = await fetch(`${API}/otp-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(r => r.json());
    results.otpMissingPhone = resMissing && resMissing.success === false;

    // Missing OTP in verify
    const phoneMissingOtp = '1' + Math.floor(1000000000 + Math.random() * 9000000000);
    const resMissingOtp = await fetch(`${API}/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNo: phoneMissingOtp })
    }).then(r => r.json());
    results.otpMissingOtp = resMissingOtp && resMissingOtp.success === false;
    // 6. Expired OTP test is not included (requires DB or time manipulation)
}

function printSummary() {
    console.log('\n=== Test Summary ===');
    console.log(`Signup:              ${results.signup ? '✅' : '❌'}`);
    console.log(`Login:               ${results.login ? '✅' : '❌'}`);
    console.log(`Verify:              ${results.verify ? '✅' : '❌'}`);
    console.log(`Refresh:             ${results.refresh ? '✅' : '❌'}`);
    console.log(`Verify (refreshed):  ${results.verifyRefreshed ? '✅' : '❌'}`);
    console.log(`Logout:              ${results.logout ? '✅' : '❌'}`);
    console.log(`Refresh after logout:${results.refreshAfterLogout ? '✅ (fail expected)' : '❌'}`);
    // OTP tests summary
    console.log('\n--- OTP Login Tests ---');
    console.log(`OTP new user:        ${results.otpNewUser ? '✅' : '❌'}`);
    console.log(`OTP existing user:   ${results.otpExistingUser ? '✅' : '❌'}`);
    console.log(`OTP invalid:         ${results.otpInvalid ? '❌' : '✅ (fail expected)'}`);
    console.log(`OTP missing phone:   ${results.otpMissingPhone ? '❌' : '✅ (fail expected)'}`);
    console.log(`OTP missing OTP:     ${results.otpMissingOtp ? '❌' : '✅ (fail expected)'}`);
}

async function runTests() {
    const username = 'testuser_' + Math.floor(Math.random() * 10000);
    const password = 'testpass';

    await signup(username, password);
    const loginRes = await login(username, password);

    if (loginRes.token && loginRes.refreshToken) {
        await verify(loginRes.token);
        const refreshRes = await refresh(loginRes.refreshToken);
        if (refreshRes.token) {
            await verifyRefreshed(refreshRes.token);
        }
        await logout(loginRes.refreshToken);
        // Try to refresh again after logout (should fail)
        await refreshAfterLogout(loginRes.refreshToken);
    } else {
        console.log('Login failed, skipping further tests.');
    }

    await runOtpTests();
    printSummary();
}

runTests();