const CLINIC_EMAIL = "taimoorabdullahbrw2732@gmail.com";
const FORM_SUBMIT_URL = `https://formsubmit.co/ajax/${CLINIC_EMAIL}`;

function field(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid booking data." });
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: "Invalid booking data." });
  }

  let origin;
  try {
    origin = new URL(req.headers.origin);
  } catch {
    return res.status(400).json({
      ok: false,
      error: "Open the live clinic website in a browser to send a booking.",
    });
  }

  if (!["http:", "https:"].includes(origin.protocol) || origin.host !== req.headers.host) {
    return res.status(403).json({ ok: false, error: "Booking request origin is not allowed." });
  }

  const name = field(body.name, 80);
  const phone = field(body.phone, 40);
  const animal = field(body.animal, 60);
  const service = field(body.service, 80);
  const date = field(body.date, 20);
  const place = field(body.place, 100);
  const message = field(body.message, 1000);
  const distance = Number(body.distance);

  if (!name || !phone || !animal || (body.distance !== "" && (!Number.isFinite(distance) || distance < 0))) {
    return res.status(400).json({ ok: false, error: "Please check the required booking details." });
  }

  const visitCharges = distance > 0
    ? `Rs ${distance <= 5 ? 500 : Math.round(distance * 100)}`
    : "Rs 500 (up to 5 km)";

  try {
    const response = await fetch(FORM_SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin.origin,
        Referer: `${origin.origin}/`,
      },
      body: JSON.stringify({
        _subject: `Booking request - ${animal} - ${name}`,
        _template: "table",
        _captcha: "false",
        name,
        phone,
        animal,
        service: service || "-",
        date: date || "-",
        place: place || "-",
        distance: distance > 0 ? `${distance} km` : "-",
        visit_charges: visitCharges,
        message: message || "-",
      }),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("Booking email provider returned a non-JSON response:", response.status, responseText.slice(0, 500));
      return res.status(502).json({
        ok: false,
        error: "The email service returned an unexpected response. Please check the server logs and try again.",
      });
    }

    if (!response.ok || !(result.success === true || result.success === "true")) {
      console.error("Booking email provider rejected the request:", response.status, result);
      return res.status(502).json({
        ok: false,
        error: typeof result.message === "string"
          ? `The email service rejected this booking: ${result.message}`
          : "The email service did not accept this booking. Check that the clinic email is activated, then try again.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Booking email request failed:", error);
    return res.status(502).json({
      ok: false,
      error: "The booking server could not connect to the email service. Please try again later or use WhatsApp.",
    });
  }
};
