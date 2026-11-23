const { createHash, randomUUID, timingSafeEqual } = require("node:crypto");

const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REVIEWS_KEY = "reviews";

async function redis(cmd) {
  const response = await fetch(U, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${T}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error || `Redis request failed with status ${response.status}`);
  }
  return result.result;
}

function parseBody(body) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}

function normalizeReview(value) {
  const review = JSON.parse(value);
  if (!review.id) {
    review.id = createHash("sha256").update(value).digest("hex");
  }
  return review;
}

function reviewAdminRateLimitKey(req) {
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  return `review-admin-rl:${ip || "unknown"}`;
}

async function authenticateAdmin(req, res, password) {
  const expected = process.env.REVIEW_ADMIN_PASSWORD;
  if (!expected || expected.length < 16) {
    res.status(503).json({
      ok: false,
      error: "Set a private REVIEW_ADMIN_PASSWORD of at least 16 characters in Vercel.",
    });
    return false;
  }

  const attempts = Number(await redis(["INCR", reviewAdminRateLimitKey(req)]));
  if (attempts === 1) {
    await redis(["EXPIRE", reviewAdminRateLimitKey(req), 3600]);
  }
  if (attempts > 10) {
    res.status(429).json({ ok: false, error: "Too many admin attempts. Try again later." });
    return false;
  }

  const suppliedHash = createHash("sha256").update(String(password || "")).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(suppliedHash, expectedHash)) {
    res.status(401).json({ ok: false, error: "Incorrect admin passcode." });
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!U || !T) {
    return res.status(503).json({
      ok: false,
      error: "Review storage is not connected. Connect Upstash Redis in Vercel.",
    });
  }

  try {
    if (req.method === "GET") {
      const entries = await redis(["LRANGE", REVIEWS_KEY, 0, -1]);
      return res.status(200).json({ ok: true, reviews: entries.map(normalizeReview) });
    }

    if (req.method === "POST") {
      const body = parseBody(req.body);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ ok: false, error: "Invalid review data." });
      }

      const n = String(body.n || "").trim().slice(0, 40);
      const w = String(body.w || "").trim().slice(0, 40);
      const t = String(body.t || "").trim().slice(0, 400);
      const s = Math.min(5, Math.max(1, parseInt(body.s, 10) || 5));
      if (!n || t.length < 10) {
        return res.status(400).json({ ok: false, error: "Enter your name and a review of at least 10 characters." });
      }

      const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
      const rateLimitKey = `review-submit-rl:${ip || "unknown"}`;
      const count = Number(await redis(["INCR", rateLimitKey]));
      if (count === 1) await redis(["EXPIRE", rateLimitKey, 3600]);
      if (count > 3) {
        return res.status(429).json({ ok: false, error: "Review limit reached. Try again later." });
      }

      const review = { id: randomUUID(), n, w, s, t, at: Date.now() };
      await redis(["LPUSH", REVIEWS_KEY, JSON.stringify(review)]);
      return res.status(201).json({ ok: true, review });
    }

    if (req.method === "DELETE") {
      const body = parseBody(req.body);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ ok: false, error: "Invalid admin request." });
      }
      if (!await authenticateAdmin(req, res, body.password)) return;

      if (body.action === "verify") {
        return res.status(200).json({ ok: true });
      }

      const id = String(body.id || "");
      if (!/^[a-f\d-]{36}$|^[a-f\d]{64}$/i.test(id)) {
        return res.status(400).json({ ok: false, error: "Invalid review ID." });
      }

      const entries = await redis(["LRANGE", REVIEWS_KEY, 0, -1]);
      const entry = entries.find((value) => normalizeReview(value).id === id);
      if (!entry) {
        return res.status(404).json({ ok: false, error: "Review not found." });
      }

      const removed = Number(await redis(["LREM", REVIEWS_KEY, 1, entry]));
      if (removed !== 1) {
        return res.status(404).json({ ok: false, error: "Review was already removed." });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error("Review API failed:", error);
    return res.status(503).json({
      ok: false,
      error: "Reviews could not be saved or loaded. Check the Upstash connection and try again.",
    });
  }
};
