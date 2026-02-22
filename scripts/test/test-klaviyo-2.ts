import "dotenv/config";

const KLAVIYO_PUBLIC_KEY = "TgdCQw"; // your public site ID
const EVENT_NAME = "GLOBAL_LANDING_SUBMITTED"; // <-- correct metric name

const payload = {
  token: "TgdCQw",
  event: "test-event",
  customer_properties: { $email: "test@test.com" },
  properties: { $event_id: `${Date.now()}` },
};

fetch("https://a.klaviyo.com/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((r) => r.text())
  .then(console.log);
