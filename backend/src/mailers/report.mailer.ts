import type { ReportType } from "../@types/report.type";
import { formatCurrency } from "../lib/format.currency";
import { sendEmail } from "./mailer";
import { getReportEmailTemplate } from "./templates/report.template";

type ReportEmailParams = {
	email: string;
	username: string;
	report: ReportType;
	/** "MONTHLY" or "ONE_TIME" — controls the email subject/title */
	frequency: string;
};

/**
 * Sends a financial report email to the given recipient.
 *
 * @param params - Recipient details and report payload.
 * @returns The result from the transactional email provider (Resend).
 */
export const sendReportEmail = async (params: ReportEmailParams) => {
	const { email, username, report, frequency } = params;

	// Build the HTML body from the shared template
	const html = getReportEmailTemplate({ username, ...report }, frequency);

	// Plain-text fallback for email clients that do not render HTML
	const text = `Your ${frequency} Financial Report (${report.period})

    Income:        ${formatCurrency(report.totalIncome)}
    Expenses:      ${formatCurrency(report.totalExpenses)}
    Balance:       ${formatCurrency(report.availableBalance)}
    Savings Rate:  ${report.savingsRate.toFixed(2)}%

    AI Insights:
    ${report.insights.join("\n  ")}
    `;

	return sendEmail({
		to: email,
		subject: `${frequency} Financial Report – ${report.period}`,
		text,
		html,
	});
};
