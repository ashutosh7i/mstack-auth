import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const API = "http://localhost:5000/auth";

async function sendOtp(phoneNo) {
    const res = await fetch(`${API}/otp-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo }),
    });
    return res.json();
}

async function verifyOtp(phoneNo, otp) {
    const res = await fetch(`${API}/otp-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo, otp }),
    });
    return res.json();
}

async function main() {
    const rl = readline.createInterface({ input, output });

    // 1. Ask for phone number
    const phoneNo = await rl.question("Enter phone number: ");

    // 2. Send OTP
    const sendRes = await sendOtp(phoneNo);
    console.log("Send OTP response:", sendRes);

    if (!sendRes.success) {
        console.error("Failed to send OTP:", sendRes.error || sendRes.message);
        rl.close();
        return;
    }

    // 3. Ask user to enter OTP
    const otp = await rl.question("Enter the OTP you received: ");

    // 4. Verify OTP
    const verifyRes = await verifyOtp(phoneNo, otp);
    console.log("Verify OTP response:", verifyRes);

    rl.close();
}
main()