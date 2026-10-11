import nodemailer, { type Transporter } from "nodemailer";
import { siteConfig } from "@/config/site";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type MailDriver = "resend" | "smtp" | "console";

/** Resend tiene prioridad, luego SMTP; sin credenciales se imprime en consola. */
export function getMailDriver(): MailDriver {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "console";
}

function getFrom() {
  return process.env.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`;
}

const globalForMail = globalThis as unknown as { smtpTransporter: Transporter | undefined };

function getSmtpTransporter() {
  if (!globalForMail.smtpTransporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    globalForMail.smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return globalForMail.smtpTransporter;
}

async function sendWithResend(message: MailMessage) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFrom(),
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend respondió ${response.status}: ${await response.text()}`);
  }
}

export async function sendMail(message: MailMessage) {
  const driver = getMailDriver();

  if (driver === "resend") return sendWithResend(message);

  if (driver === "smtp") {
    await getSmtpTransporter().sendMail({ from: getFrom(), ...message });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    console.warn("[mail] Sin RESEND_API_KEY ni SMTP_HOST: el correo solo se imprime en el log.");
  }
  console.info(
    [
      "",
      "──────── [mail] correo de desarrollo ────────",
      `Para:   ${message.to}`,
      `Asunto: ${message.subject}`,
      "",
      message.text,
      "─────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}
