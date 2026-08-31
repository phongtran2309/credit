/**
 * Utility bảo mật và xác thực Master Passcode / PIN Access Gate
 * Tương thích Web Crypto API (chạy được trên cả Edge Middleware & Node.js Serverless)
 */

export const COOKIE_NAME = "site_session";
export const MAX_ATTEMPTS = 5;

// In-memory lockout store cho serverless / runtime instances
// Lưu trữ failed attempts và trạng thái khóa vĩnh viễn theo IP/Identifier
interface LockoutEntry {
  attempts: number;
  isPermanentlyLocked: boolean;
  lockedAt?: number;
  lastAttemptAt: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp.trim();
  if (realIp) return realIp.trim();
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

export function getAuthConfig() {
  const sitePassword = process.env.SITE_PASSWORD || (process.env.NODE_ENV === "development" ? "admin123" : "");
  const authSecret = process.env.AUTH_SECRET || "default-anti-gravity-credit-tracker-secret-key-2026";
  const unlockKey = process.env.AUTH_UNLOCK_KEY || sitePassword || "unlock-secret";

  return { sitePassword, authSecret, unlockKey };
}

/**
 * Kiểm tra trạng thái khóa của IP
 */
export function checkLockoutStatus(identifier: string): {
  isLocked: boolean;
  attemptsLeft: number;
  attempts: number;
} {
  const entry = lockoutStore.get(identifier);
  if (!entry) {
    return { isLocked: false, attemptsLeft: MAX_ATTEMPTS, attempts: 0 };
  }

  if (entry.isPermanentlyLocked || entry.attempts >= MAX_ATTEMPTS) {
    return { isLocked: true, attemptsLeft: 0, attempts: entry.attempts };
  }

  return {
    isLocked: false,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
    attempts: entry.attempts,
  };
}

/**
 * Ghi nhận một lần nhập sai. Nếu chạm mốc MAX_ATTEMPTS -> Khóa vĩnh viễn
 */
export function recordFailedAttempt(identifier: string): {
  isPermanentlyLocked: boolean;
  attemptsLeft: number;
  attempts: number;
} {
  const entry = lockoutStore.get(identifier) || {
    attempts: 0,
    isPermanentlyLocked: false,
    lastAttemptAt: Date.now(),
  };

  entry.attempts += 1;
  entry.lastAttemptAt = Date.now();

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.isPermanentlyLocked = true;
    entry.lockedAt = Date.now();
  }

  lockoutStore.set(identifier, entry);

  return {
    isPermanentlyLocked: entry.isPermanentlyLocked,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
    attempts: entry.attempts,
  };
}

/**
 * Reset bộ đếm khi đăng nhập đúng
 */
export function resetAttempts(identifier: string): void {
  lockoutStore.delete(identifier);
}

/**
 * Mở khóa hệ thống bằng Master Recovery Key
 */
export function unlockSystem(identifier: string, recoveryKey: string): boolean {
  const { unlockKey } = getAuthConfig();
  if (recoveryKey === unlockKey || recoveryKey === process.env.SITE_PASSWORD) {
    lockoutStore.delete(identifier);
    return true;
  }
  return false;
}

/**
 * Tạo chữ ký HMAC SHA-256 an toàn bằng Web Crypto API
 */
async function createHmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Tạo Session Token mã hóa có chữ ký HMAC và timestamp
 */
export async function createSessionToken(): Promise<string> {
  const { authSecret, sitePassword } = getAuthConfig();
  const timestamp = Date.now().toString();
  const payload = `${timestamp}:${sitePassword}`;
  const signature = await createHmacSha256(authSecret, payload);
  return `${timestamp}.${signature}`;
}

/**
 * Kiểm tra tính hợp lệ của Session Token (Chữ ký HMAC + Thời hạn 30 ngày)
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Hết hạn sau 30 ngày
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_AGE_MS) {
    return false;
  }

  const { authSecret, sitePassword } = getAuthConfig();
  const expectedPayload = `${timestampStr}:${sitePassword}`;
  const expectedSignature = await createHmacSha256(authSecret, expectedPayload);

  return signature === expectedSignature;
}
