export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido." });
  }

  const webhookSecret = request.headers["x-webhook-secret"];
  if (!process.env.WEBHOOK_SECRET || webhookSecret !== process.env.WEBHOOK_SECRET) {
    return response.status(401).json({ error: "Webhook não autorizado." });
  }

  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) {
    return response.status(500).json({ error: "Notificação não configurada." });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Pesquisa Multi Controle <onboarding@resend.dev>",
      to: [process.env.NOTIFICATION_EMAIL],
      subject: "Novo preenchimento — Controle Multi",
      text: "Um novo preenchimento foi realizado no aplicativo."
    })
  });

  const result = await emailResponse.json().catch(() => ({}));
  if (!emailResponse.ok) {
    return response.status(502).json({
      error: result.message || "Não foi possível enviar a notificação."
    });
  }

  return response.status(200).json({ success: true });
}
