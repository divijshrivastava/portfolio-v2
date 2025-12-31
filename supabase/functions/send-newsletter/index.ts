import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

type Audience =
  | { type: "all" }
  | { type: "source"; source: string }
  | { type: "manual"; emails: string[] };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function getSiteUrl(): string {
  return Deno.env.get("SITE_URL") || Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://divij.tech";
}

function getResendConfig() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Divij <onboarding@resend.dev>";
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return { apiKey, from };
}

function renderNewsletterEmail(input: {
  subject: string;
  previewText?: string | null;
  bodyHtml: string;
  attachments: any[];
}) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  const linksHtml = (input.attachments || [])
    .map((a) => {
      if (!a || typeof a !== "object") return null;
      if (a.type === "blog" && a.slug) {
        const url = `${siteUrl}/blog/${a.slug}`;
        return `<li><a href="${url}">${a.title || url}</a></li>`;
      }
      if (a.type === "project" && a.slug) {
        const url = `${siteUrl}/projects/${a.slug}`;
        return `<li><a href="${url}">${a.title || url}</a></li>`;
      }
      if (a.type === "link" && a.url) {
        const safeUrl = String(a.url);
        return `<li><a href="${safeUrl}">${a.title || safeUrl}</a></li>`;
      }
      return null;
    })
    .filter(Boolean)
    .join("");

  const attachmentsBlock = linksHtml
    ? `
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
      <h3 style="margin:0 0 8px 0;">Links</h3>
      <ul style="margin:0;padding-left:18px;">
        ${linksHtml}
      </ul>
    `
    : "";

  const preview = input.previewText ? `<p style="color:#666;margin:0 0 16px 0;">${input.previewText}</p>` : "";

  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5; color:#111;">
      <div style="max-width: 680px; margin: 0 auto; padding: 24px;">
        <h1 style="margin:0 0 8px 0;">${input.subject}</h1>
        ${preview}
        <div>
          ${input.bodyHtml}
        </div>
        ${attachmentsBlock}
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#666;font-size:12px;margin:0;">
          You’re receiving this because you subscribed on ${siteUrl}.
        </p>
      </div>
    </div>
  `;
}

async function sendResendEmail(input: { to: string; subject: string; html: string }) {
  const { apiKey, from } = getResendConfig();

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    throw new Error(err || `Resend failed: ${emailRes.status}`);
  }

  const json = (await emailRes.json().catch(() => null)) as any;
  return { id: json?.id as string | undefined };
}

serve(async (req) => {
  try {
    const secretHeader = req.headers.get("x-newsletter-secret") || "";
    const expectedSecret = Deno.env.get("NEWSLETTER_WEBHOOK_SECRET") || "";
    if (expectedSecret && secretHeader !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json().catch(() => null) as any;
    const sendId = String(payload?.send_id || "").trim();
    if (!sendId) return new Response("send_id is required", { status: 400 });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) {
      return new Response("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    const { data: sendRow, error: sendErr } = await supabase
      .from("newsletter_sends")
      .select("id, status, audience, newsletter_id, total_recipients, sent_count, failed_count, newsletters(subject, preview_text, body_html, attachments, status)")
      .eq("id", sendId)
      .single();

    if (sendErr || !sendRow) return new Response(sendErr?.message || "Send not found", { status: 404 });
    if (sendRow.status !== "sending") return new Response("Send is not in sending state", { status: 200 });

    const newsletter = (sendRow as any).newsletters;
    if (!newsletter) return new Response("Newsletter not found", { status: 404 });
    if (newsletter.status !== "published") return new Response("Newsletter must be published", { status: 400 });

    const audience = sendRow.audience as Audience;

    let recipients: { subscriber_id: string | null; email: string }[] = [];
    if (audience?.type === "all") {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email")
        .order("created_at", { ascending: true });
      if (error) throw error;
      recipients = (data || []).map((r: any) => ({ subscriber_id: r.id, email: r.email }));
    } else if (audience?.type === "source") {
      const source = String((audience as any).source || "").trim();
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email")
        .eq("source", source)
        .order("created_at", { ascending: true });
      if (error) throw error;
      recipients = (data || []).map((r: any) => ({ subscriber_id: r.id, email: r.email }));
    } else if (audience?.type === "manual") {
      const rawEmails = Array.isArray((audience as any).emails) ? (audience as any).emails : [];
      const cleaned = uniq(rawEmails.map(normalizeEmail)).filter((e) => e && isValidEmail(e));
      recipients = cleaned.map((email) => ({ subscriber_id: null, email }));
    } else {
      return new Response("Unsupported audience type", { status: 400 });
    }

    // Dedupe + validate
    const byEmail = new Map<string, { subscriber_id: string | null; email: string }>();
    for (const r of recipients) {
      const e = normalizeEmail(r.email);
      if (!e || !isValidEmail(e)) continue;
      if (!byEmail.has(e)) byEmail.set(e, { subscriber_id: r.subscriber_id, email: e });
    }
    recipients = Array.from(byEmail.values());

    // Seed deliveries (upsert-ish via insert + ignore conflicts)
    if (recipients.length > 0) {
      const seed = recipients.map((r) => ({
        send_id: sendId,
        subscriber_id: r.subscriber_id,
        email: r.email,
        status: "pending",
      }));

      // Use upsert with ignoreDuplicates so reruns don't error on (send_id, email) uniqueness.
      // Note: Supabase query builders are Promise-like but don't always implement `.catch()`.
      const { error: seedErr } = await supabase
        .from("newsletter_deliveries")
        .upsert(seed, { onConflict: "send_id,email", ignoreDuplicates: true });
      if (seedErr) {
        // Best-effort: continue anyway and just process existing pending rows.
        console.warn("Failed to seed deliveries (continuing):", seedErr);
      }
    }

    // Fetch pending deliveries
    const { data: pending, error: pendingErr } = await supabase
      .from("newsletter_deliveries")
      .select("id, email")
      .eq("send_id", sendId)
      .eq("status", "pending")
      .order("email", { ascending: true })
      .limit(5000);
    if (pendingErr) throw pendingErr;

    const html = renderNewsletterEmail({
      subject: newsletter.subject,
      previewText: newsletter.preview_text,
      bodyHtml: newsletter.body_html,
      attachments: newsletter.attachments || [],
    });

    let sentCount = 0;
    let failedCount = 0;
    const concurrency = 5;
    let idx = 0;

    async function worker() {
      while (idx < (pending?.length || 0)) {
        const i = idx++;
        const d = (pending as any[])[i];
        try {
          const resp = await sendResendEmail({ to: d.email, subject: newsletter.subject, html });
          sentCount++;
          await supabase
            .from("newsletter_deliveries")
            .update({
              status: "sent",
              provider: "resend",
              provider_message_id: resp.id ?? null,
              sent_at: new Date().toISOString(),
              error: null,
            })
            .eq("id", d.id);
        } catch (e: any) {
          failedCount++;
          await supabase
            .from("newsletter_deliveries")
            .update({
              status: "failed",
              provider: "resend",
              error: String(e?.message || e),
            })
            .eq("id", d.id);
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, pending?.length || 0) }, () => worker()));

    // Update send summary based on current DB state
    const [{ count: total }, { count: sent }, { count: failed }] = await Promise.all([
      supabase.from("newsletter_deliveries").select("*", { count: "exact", head: true }).eq("send_id", sendId),
      supabase.from("newsletter_deliveries").select("*", { count: "exact", head: true }).eq("send_id", sendId).eq("status", "sent"),
      supabase.from("newsletter_deliveries").select("*", { count: "exact", head: true }).eq("send_id", sendId).eq("status", "failed"),
    ]);

    const remaining = (total || 0) - (sent || 0) - (failed || 0);
    const finalStatus = remaining === 0 ? ((failed || 0) > 0 ? "failed" : "sent") : "sending";

    await supabase
      .from("newsletter_sends")
      .update({
        status: finalStatus,
        completed_at: remaining === 0 ? new Date().toISOString() : null,
        total_recipients: total || 0,
        sent_count: sent || 0,
        failed_count: failed || 0,
      })
      .eq("id", sendId);

    return new Response(JSON.stringify({ sendId, processed: (pending?.length || 0), sent: sentCount, failed: failedCount, status: finalStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});


