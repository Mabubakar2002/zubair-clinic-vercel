const CLINIC_EMAIL = "taimoorabdullahbrw2732@gmail.com";
const FORM_SUBMIT_URL = `https://formsubmit.co/ajax/${CLINIC_EMAIL}`;

function field(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

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

    const result = await response.json();
    if (!response.ok || !(result.success === true || result.success === "true")) {
      console.error("Booking email provider rejected the request:", result);
      return res.status(502).json({
        ok: false,
        error: "The email service did not accept this booking. Please try again or use WhatsApp.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Booking email request failed:", error);
    return res.status(502).json({
      ok: false,
      error: "The clinic email could not be reached. Please try again or use WhatsApp.",
    });
  }
};
