import Mailjet from "node-mailjet";

interface SendEmailOptions {
  to: string;
  subject: string;
  textPart: string;
  htmlPart: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY ?? "",
    process.env.MAILJET_API_SECRET ?? ""
  );

  await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_SENDER_EMAIL ?? "",
          Name: "DentalConnect",
        },
        To: [
          {
            Email: options.to,
          },
        ],
        Subject: options.subject,
        TextPart: options.textPart,
        HTMLPart: options.htmlPart,
      },
    ],
  });
}

export async function sendInviteEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/signin/invited?token=${token}`;

  await sendEmail({
    to: email,
    subject: "You have been invited to join a practice",
    textPart: `You've been invited. Complete your sign-up: ${inviteLink}`,
    htmlPart: `<p>You've been invited. Complete your sign-up here:</p><a href="${inviteLink}">${inviteLink}</a>`,
  });
}