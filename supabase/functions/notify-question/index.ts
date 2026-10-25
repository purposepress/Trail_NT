// Emails the author when a reader sends a question from the app.
//
// Called by a database trigger on public.author_questions (see migration 0003).
// It takes no input: it finds questions that haven't been emailed yet, claims each
// one, and sends it. Calling it again does nothing new, so it is safe to leave public.
//
// Needs one secret, set in Supabase → Edge Functions → Secrets:
//   RESEND_API_KEY   from resend.com
// Optional secrets:
//   NOTIFY_EMAIL     where notifications go (default below)
//   NOTIFY_FROM      sender (default: The Trail <questions@purpose-press.com>; purpose-press.com is verified in Resend)

import { createClient } from "npm:@supabase/supabase-js@2";

const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "frank.shirvinski@purpose-press.com";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "The Trail <questions@purpose-press.com>";
const ADMIN_URL = "https://trail-admin-purposepress.netlify.app/";

function secretKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const parsed = JSON.parse(keys);
      if (parsed.default) return parsed.default;
    } catch { /* fall through */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async () => {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ sent: 0, note: "RESEND_API_KEY is not set yet" });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, secretKey(), {
    auth: { persistSession: false },
  });

  const { data: pending, error } = await db
    .from("author_questions")
    .select("id")
    .is("notified_at", null)
    .order("created_at")
    .limit(20);
  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  for (const { id } of pending ?? []) {
    // Claim the question so two calls can't email it twice.
    const { data: claimed } = await db
      .from("author_questions")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", id)
      .is("notified_at", null)
      .select("id, day_number, question, reader_name, reader_email, created_at")
      .maybeSingle();
    if (!claimed) continue;

    const { data: day } = claimed.day_number
      ? await db.from("days").select("title, reference").eq("day_number", claimed.day_number).maybeSingle()
      : { data: null };

    const dayLabel = [
      claimed.day_number ? `Day ${claimed.day_number}` : null,
      day?.reference || day?.title || null,
    ].filter(Boolean).join(" · ");
    const who = claimed.reader_name?.trim() || "A reader";
    const email = claimed.reader_email?.trim() || "";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const text = [
      `${who} sent a question from The Trail${dayLabel ? ` (${dayLabel})` : ""}:`,
      "",
      claimed.question,
      "",
      validEmail ? `Reply to this email to answer ${who}.` : "The reader didn't leave an email address, so you can't reply directly.",
      "",
      `See all questions: ${ADMIN_URL}`,
    ].join("\n");

    const html = `
      <div style="font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#1f2a24;max-width:560px">
        <p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#5d6a62;margin:0 0 6px">
          The Trail: New Testament${dayLabel ? ` · ${esc(dayLabel)}` : ""}
        </p>
        <p style="margin:0 0 14px"><strong>${esc(who)}</strong> sent a question:</p>
        <blockquote style="margin:0 0 18px;padding:12px 16px;border-left:3px solid #c98a1b;background:#f3f1ec;white-space:pre-wrap">${esc(claimed.question)}</blockquote>
        <p style="margin:0 0 14px;color:#5d6a62;font-size:14px">
          ${validEmail ? `Reply to this email to answer ${esc(who)} at ${esc(email)}.` : "The reader didn’t leave an email address, so you can’t reply directly."}
        </p>
        <p style="margin:0"><a href="${ADMIN_URL}" style="color:#2f5a45">Open the admin page</a> to see all questions.</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_EMAIL],
        subject: `New question from The Trail${dayLabel ? `: ${dayLabel}` : ""}`,
        text,
        html,
        ...(validEmail ? { reply_to: email } : {}),
      }),
    });

    if (res.ok) sent++;
    else {
      // Release the claim so it's retried with the next question.
      console.error("Resend error", res.status, await res.text());
      await db.from("author_questions").update({ notified_at: null }).eq("id", id);
    }
  }

  return json({ sent });
});
