import { Resend } from "resend";
import { requireEnv } from "../lib/env.js";

type Params = {
	to: string | string[];
	subject: string;
	text: string;
	html: string;
	from?: string;
};

const resend = new Resend(requireEnv("RESEND_API_KEY"));
const mailerSender = `Finora <${requireEnv("MAILER_SENDER")}>`;

export const sendEmail = async ({
	to,
	from = mailerSender,
	subject,
	text,
	html,
}: Params) => {
	return await resend.emails.send({
		from,
		to: Array.isArray(to) ? to : [to],
		text,
		subject,
		html,
	});
};
