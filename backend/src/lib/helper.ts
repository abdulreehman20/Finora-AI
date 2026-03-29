import { addDays, addMonths, addWeeks, addYears, startOfMonth } from "date-fns";
import { RecurringIntervalEnum } from "../db/schema/transaction.schema";

export function calculateNextOccurrence(
	date: Date,
	recurringInterval: keyof typeof RecurringIntervalEnum,
) {
	const base = new Date(date);
	base.setHours(0, 0, 0, 0);

	switch (recurringInterval) {
		case RecurringIntervalEnum.DAILY:
			return addDays(base, 1);
		case RecurringIntervalEnum.WEEKLY:
			return addWeeks(base, 1);
		case RecurringIntervalEnum.MONTHLY:
			return addMonths(base, 1);
		case RecurringIntervalEnum.YEARLY:
			return addYears(base, 1);
		default:
			return base;
	}
}

/**
 * Calculates the next report dispatch date.
 *
 * @param lastSentDate - When the last report was sent (defaults to now).
 * @param dayOfMonth   - Day of month to target (1–28, defaults to 1).
 * @returns The start of the target day in the following month at UTC midnight.
 */
export function calulateNextReportDate(
	lastSentDate?: Date,
	dayOfMonth = 1,
): Date {
	const base = lastSentDate ?? new Date();

	// Move to the 1st of next month first, then set the target day
	const next = addMonths(startOfMonth(base), 1);

	// Clamp dayOfMonth to the number of days in that month
	const daysInMonth = new Date(
		next.getFullYear(),
		next.getMonth() + 1,
		0,
	).getDate();
	next.setDate(Math.min(dayOfMonth, daysInMonth));
	next.setHours(0, 0, 0, 0);

	return next;
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
