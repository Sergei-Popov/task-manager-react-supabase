import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { Router } from "express";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import rateLimit from "express-rate-limit";
import { query } from "./db.js";
import { validateBody } from "./validate.js";

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = "tm_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней
const SCRYPT_N = 16384;

// ---------------------------------------------------------------------------
// Пароли: scrypt с солью, формат "scrypt$N$salt$hash" (hex)
// ---------------------------------------------------------------------------
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [algo, n, saltHex, hashHex] = String(stored).split("$");
  if (algo !== "scrypt") return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), 64, {
    N: Number(n),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ---------------------------------------------------------------------------
// Сессии: в cookie лежит случайный токен, в БД — его sha256
// ---------------------------------------------------------------------------
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await query(
    "insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)",
    [userId, hashToken(token), expiresAt],
  );
  return { token, expiresAt };
}

function setSessionCookie(req, res, token, expiresAt) {
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.secure,
      path: "/",
      expires: expiresAt,
    }),
  );
}

function clearSessionCookie(req, res) {
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: req.secure,
      path: "/",
      maxAge: 0,
    }),
  );
}

const publicUser = (row) => ({
  id: row.id,
  email: row.email,
  created_at: row.created_at,
});

// Middleware: находит пользователя по cookie и кладёт в req.user (или null)
export async function attachUser(req, res, next) {
  req.user = null;
  req.sessionToken = null;
  const cookies = parseCookie(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE];
  if (token) {
    const { rows } = await query(
      `select u.id, u.email, u.created_at
         from sessions s
         join users u on u.id = s.user_id
        where s.token_hash = $1 and s.expires_at > now()`,
      [hashToken(token)],
    );
    if (rows[0]) {
      req.user = publicUser(rows[0]);
      req.sessionToken = token;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Требуется вход в систему" });
  }
  next();
}

// ---------------------------------------------------------------------------
// Роуты /api/auth/*
// ---------------------------------------------------------------------------
const credentialsSchema = {
  email: {
    type: "email",
    normalize: true,
    max: 254,
    messages: { email: "Введите корректный email" },
  },
  password: {
    type: "string",
    min: 6,
    max: 72,
    messages: {
      stringMin: "Пароль должен содержать минимум 6 символов",
      stringMax: "Пароль слишком длинный",
    },
  },
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Слишком много попыток, попробуйте позже" },
});

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validateBody(credentialsSchema),
  async (req, res) => {
    const email = req.body.email.toLowerCase();
    const passwordHash = await hashPassword(req.body.password);

    const { rows } = await query(
      `insert into users (email, password_hash)
       values ($1, $2)
       on conflict (email) do nothing
       returning id, email, created_at`,
      [email, passwordHash],
    );
    if (!rows[0]) {
      return res
        .status(409)
        .json({ error: "Пользователь с таким email уже зарегистрирован" });
    }

    const { token, expiresAt } = await createSession(rows[0].id);
    setSessionCookie(req, res, token, expiresAt);
    res.status(201).json({ user: publicUser(rows[0]) });
  },
);

// При входе длину пароля не проверяем, чтобы не подсказывать, что не так
const loginSchema = {
  email: credentialsSchema.email,
  password: { type: "string", min: 1, max: 72 },
};

authRouter.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  async (req, res) => {
    const email = req.body.email.toLowerCase();
    const { rows } = await query(
      "select id, email, created_at, password_hash from users where email = $1",
      [email],
    );
    const user = rows[0];
    const ok =
      user && (await verifyPassword(req.body.password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(req, res, token, expiresAt);
    res.json({ user: publicUser(user) });
  },
);

authRouter.post("/logout", async (req, res) => {
  if (req.sessionToken) {
    await query("delete from sessions where token_hash = $1", [
      hashToken(req.sessionToken),
    ]);
  }
  clearSessionCookie(req, res);
  res.status(204).end();
});

authRouter.get("/me", (req, res) => {
  res.json({ user: req.user });
});
