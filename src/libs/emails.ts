import { siteConfig } from "@/config/site";
import type { MailMessage } from "@/libs/mail";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function resetPasswordEmail({
  name,
  url,
  minutes,
}: {
  name?: string | null;
  url: string;
  minutes: number;
}): Omit<MailMessage, "to"> {
  const greeting = name ? `Hola ${name},` : "Hola,";
  const subject = `Restablece tu contraseña de ${siteConfig.name}`;

  const text = [
    greeting,
    "",
    "Recibimos una solicitud para restablecer tu contraseña.",
    `Abre este enlace (caduca en ${minutes} minutos):`,
    url,
    "",
    "Si no fuiste tú, ignora este correo: tu contraseña no cambiará.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <tr><td>
        <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(siteConfig.name)}</h1>
        <p style="margin:0 0 12px">${escapeHtml(greeting)}</p>
        <p style="margin:0 0 24px">Recibimos una solicitud para restablecer tu contraseña. El enlace caduca en ${minutes} minutos.</p>
        <p style="margin:0 0 24px">
          <a href="${escapeHtml(url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Restablecer contraseña</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#71717a">Si el botón no funciona, copia este enlace:</p>
        <p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
        <p style="margin:0;font-size:13px;color:#71717a">Si no fuiste tú, ignora este correo: tu contraseña no cambiará.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
