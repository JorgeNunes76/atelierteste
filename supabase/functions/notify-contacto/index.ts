// Supabase Edge Function — triggered by DB webhook on new contacto insert
// Deploy: npx supabase functions deploy notify-contacto
// Set secrets: npx supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_EMAIL=atelier.anaalexandre@gmail.com

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ContactoPayload {
  type: "INSERT";
  record: {
    id: string;
    created_at: string;
    nome: string;
    email: string;
    telefone: string | null;
    assunto: string | null;
    mensagem: string;
  };
}

serve(async (req) => {
  try {
    const payload: ContactoPayload = await req.json();
    const { nome, email, telefone, assunto, mensagem, created_at } = payload.record;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL") ?? "atelier.anaalexandre@gmail.com";

    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response("Missing RESEND_API_KEY", { status: 500 });
    }

    const data = (key: string, value: string | null) =>
      value ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:120px">${key}</td><td style="padding:6px 0;color:#1a1a1a;font-size:13px">${value}</td></tr>` : "";

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:24px 28px">
          <p style="color:#C4956A;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px">Ana Alexandre · Atelier</p>
          <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0">Nova mensagem de contacto</h1>
        </div>
        <div style="padding:28px">
          <table style="width:100%;border-collapse:collapse">
            ${data("Nome", nome)}
            ${data("Email", email)}
            ${data("Telefone", telefone)}
            ${data("Assunto", assunto)}
            ${data("Data", new Date(created_at).toLocaleString("pt-PT"))}
          </table>
          <div style="margin-top:20px;padding:16px;background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A">
            <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Mensagem</p>
            <p style="color:#1a1a1a;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap">${mensagem}</p>
          </div>
          <div style="margin-top:20px">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(assunto ?? "Contacto")}"
              style="display:inline-block;padding:10px 22px;background:#C4956A;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
              Responder a ${nome}
            </a>
          </div>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
        to: [notifyEmail],
        subject: `Nova mensagem de ${nome} — ${assunto ?? "Contacto"}`,
        html,
        reply_to: email,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response("Email send failed", { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
