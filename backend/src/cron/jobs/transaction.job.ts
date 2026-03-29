import { db } from "../../db";
import { and, eq, lte } from "drizzle-orm";
import { calculateNextOccurrence } from "../../lib/helper";
import { transaction } from "../../db/schema/transaction.schema";

export const processRecurringTransactions = async () => {
	const now = new Date();
	let processedCount = 0;
	let failedCount = 0;

	try {
		// Fetch all due recurring transactions directly from DB
		const dueTransactions = await db
			.select()
			.from(transaction)
			.where(
				and(
					eq(transaction.isRecurring, true),
					lte(transaction.nextRecurringDate, now),
				),
			);

		console.log(
			`Starting recurring process — ${dueTransactions.length} transaction(s) due`,
		);

		for (const tx of dueTransactions) {
			const nextDate = calculateNextOccurrence(
				tx.nextRecurringDate!,
				tx.recurringInterval!,
			);

			try {
				// Insert a new non-recurring copy of this transaction
				await db.insert(transaction).values({
					id: crypto.randomUUID(),
					userId: tx.userId,
					type: tx.type,
					title: `Recurring - ${tx.title}`,
					amount: tx.amount,
					category: tx.category,
					receiptUrl: tx.receiptUrl,
					description: tx.description,
					date: tx.nextRecurringDate!,
					status: tx.status,
					paymentMethod: tx.paymentMethod,
					isRecurring: false,
					recurringInterval: null,
					nextRecurringDate: null,
					lastProcessed: null,
				});

				// Update the original transaction's next scheduled date
				await db
					.update(transaction)
					.set({ nextRecurringDate: nextDate, lastProcessed: now })
					.where(eq(transaction.id, tx.id));
				processedCount++;
			} catch (error) {
				failedCount++;
				console.error(`❌ Failed recurring tx: ${tx.id}`, error);
			}
		}

		console.log(`✅ Processed: ${processedCount} transaction(s)`);
		console.log(`❌ Failed: ${failedCount} transaction(s)`);

		return { success: true, processedCount, failedCount };
	} catch (error: any) {
		console.error("Error processing recurring transactions:", error);

		return { success: false, error: error?.message };
	}
};
