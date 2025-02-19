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
          Name: "MyAppName",
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
