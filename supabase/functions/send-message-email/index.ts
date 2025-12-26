import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response("No record found", { status: 400 });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Supabase <onboarding@resend.dev>",
        to: ["you@example.com"],
        subject: "📩 New message received",
        html: `
          <h3>New Message</h3>
          <p><strong>Message:</strong> ${record.content}</p>
          <p><strong>From:</strong> ${record.sender_id ?? "Unknown"}</p>
          <p><strong>Created:</strong> ${record.created_at}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      return new Response(err, { status: 500 });
    }

    return new Response("Email sent", { status: 200 });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
