// Twilio SMS Verification Utility
// Uses Twilio API directly from frontend for phone verification

const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const messagingServiceSid = import.meta.env.VITE_TWILIO_MESSAGING_SERVICE_SID;
const CODE_TTL_MS = 5 * 60 * 1000;

type PendingCode = { code: string; expiresAt: number };
const pendingCodes = new Map<string, PendingCode>();

function authHeader() {
    return "Basic " + btoa(`${accountSid}:${authToken}`);
}

function normalisePhone(to: string) {
    let digits = to.trim().replace(/[\s-]/g, "");
    if (digits.startsWith("+")) {
        return "+" + digits.slice(1).replace(/\D/g, "");
    }
    digits = digits.replace(/\D/g, "");
    if (digits.startsWith("0")) return `+61${digits.slice(1)}`;
    if (digits.startsWith("61")) return `+61${digits.slice(2)}`;
    // Handle 9 digit numbers (missing leading 0, e.g. 412345678)
    if (digits.length === 9 && digits.startsWith("4")) return `+61${digits}`;
    return `+${digits}`;
}

export async function sendVerification(to: string) {
    if (!messagingServiceSid) {
        throw new Error("Twilio messaging service not configured");
    }

    const normalised = normalisePhone(to);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const messageBody = `Your GEE verification code is ${code}`;

    const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: authHeader(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                To: normalised,
                MessagingServiceSid: messagingServiceSid,
                Body: messageBody,
            }),
        }
    );

    if (!res.ok) {
        throw new Error("Failed to send verification code");
    }

    pendingCodes.set(normalised, { code, expiresAt: Date.now() + CODE_TTL_MS });
}

export async function checkVerification(
    to: string,
    code: string
): Promise<boolean> {
    const normalised = normalisePhone(to);
    const pending = pendingCodes.get(normalised);
    if (!pending) return false;
    if (pending.expiresAt < Date.now()) {
        pendingCodes.delete(normalised);
        return false;
    }
    const ok = pending.code === code.trim();
    if (ok) {
        pendingCodes.delete(normalised);
    }
    return ok;
}
