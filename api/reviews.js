const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function redis(cmd) {
  const x = await fetch(U, { method: "POST", headers: { Authorization: "Bearer " + T, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await x.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!U || !T) return res.status(200).json({ ok: false, reviews: [], reason: "storage not connected" });
  try {
    if (req.method === "GET") {
      const a = await redis(["LRANGE", "reviews", 0, 23]);
      return res.status(200).json({ ok: true, reviews: a.map((s) => JSON.parse(s)) });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const n = String(b.n || "").trim().slice(0, 40), w = String(b.w || "").trim().slice(0, 40), t = String(b.t || "").trim().slice(0, 400);
      const s = Math.min(5, Math.max(1, parseInt(b.s) || 5));
      if (!n || t.length < 10) return res.status(400).json({ ok: false });
      const ip = String(req.headers["x-forwarded-for"] || "x").split(",")[0], k = "rl:" + ip;
      const c = await redis(["INCR", k]);
      if (c === 1) await redis(["EXPIRE", k, 3600]);
      if (c > 3) return res.status(429).json({ ok: false });
      await redis(["LPUSH", "reviews", JSON.stringify({ n, w, s, t, at: Date.now() })]);
      await redis(["LTRIM", "reviews", 0, 99]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    return res.status(200).json({ ok: false, reviews: [] });
  }
};
