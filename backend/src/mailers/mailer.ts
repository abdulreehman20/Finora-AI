import { resend } from "../configs/resend.config";

type Params = {
	to: string | string[];
	subject: string;
	text: string;
	html: string;
	from?: string;
};

const mailer_sender = `Finora <${process.env.MAILER_SENDER}>`;

export const sendEmail = async ({
	to,
	from = mailer_sender,
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
