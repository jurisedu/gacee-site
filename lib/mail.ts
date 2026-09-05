/* Confirmation email via Resend's HTTP API. No-op when RESEND_API_KEY is absent, so the flow never blocks on email. */
export async function sendMail(to: string, subject: string, html: string): Promise<"sent" | "skipped" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "skipped";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM ?? "GACEE <events@gacee.org>", to, subject, html }),
    });
    return r.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
