// src/lib/sendSmtpMail.ts
import "server-only";
import fs from "fs";
import path from "path";
import transporter from "./smtp";

type Replacements = Record<string, string | number>;

type EmailPayload = {
  to: string;
  subject: string;
  template: string;
  replacements: Replacements;
  replyTo?: string;
};

const loadTemplate = (templateName: string) => {
  const filePath = path.join(
    process.cwd(),
    "email-templates",
    `${templateName}.html`
  );
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return `
      <h2>{{subject}}</h2>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Company:</strong> {{company}}</p>
      <p><strong>Message:</strong><br/>{{message}}</p>
      <p style="color:#888;font-size:12px;">© {{year}}</p>
    `;
  }
};

const applyVars = (template: string, vars: Replacements) =>
  Object.keys(vars).reduce(
    (html, k) =>
      html.replace(new RegExp(`{{${k}}}`, "g"), String(vars[k] ?? "")),
    template
  );

export default async function sendEmail({
  to,
  subject,
  template,
  replacements,
  replyTo,
}: EmailPayload) {
  if (!to || !to.includes("@")) throw new Error("Invalid recipient email");

  const prettyFrom =
    process.env.MAIL_FROM ||
    `Equatoria <${
      process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@diboruwa.com"
    }>`;
  const bounce = process.env.ZEPTOMAIL_BOUNCE_ADDRESS || undefined;

  const html = applyVars(loadTemplate(template), {
    subject,
    year: new Date().getFullYear(),
    ...replacements,
  });

  const info = await transporter.sendMail({
    from: prettyFrom,
    to,
    subject,
    html,
    replyTo, // <-- pass along
    envelope: bounce ? { from: bounce, to } : undefined,
  });

  return info;
}

// Add a template named "verify-email" in your email-templates folder
// and handle it in your sendEmail function.
