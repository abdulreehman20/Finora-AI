import { randomUUID } from "crypto";
import { eq, isNull, sql } from "drizzle-orm";
import { db } from "../src/db/db.js";
import { category } from "../src/db/schema/categories.schema.js";
import { transaction } from "../src/db/schema/transaction.schema.js";
import {
	DEFAULT_CATEGORIES,
	seedDefaultCategoriesService,
} from "../src/services/categories.service.js";

/**
 * One-time data migration:
 * - Seeds default categories for users missing them
 * - Maps legacy transaction.category text values to category_id
 * - Drops legacy category column when safe
 */
async function migrateCategoryData() {
	const usersWithLegacyCategory = await db.execute<{ user_id: string }>(sql`
		SELECT DISTINCT user_id
		FROM "transaction"
		WHERE category_id IS NULL
		  AND EXISTS (
		    SELECT 1
		    FROM information_schema.columns
		    WHERE table_name = 'transaction'
		      AND column_name = 'category'
		  )
	`);

	for (const row of usersWithLegacyCategory.rows) {
		const userId = row.user_id;
		const existingCategories = await db
			.select()
			.from(category)
			.where(eq(category.userId, userId));

		if (existingCategories.length === 0) {
			await seedDefaultCategoriesService(userId);
		}

		const userCategories = await db
			.select()
			.from(category)
			.where(eq(category.userId, userId));

		const legacyTransactions = await db.execute<{
			id: string;
			category: string;
			type: string;
		}>(sql`
			SELECT id, category, type
			FROM "transaction"
			WHERE user_id = ${userId}
			  AND category_id IS NULL
			  AND category IS NOT NULL
		`);

		for (const tx of legacyTransactions.rows) {
			const match =
				userCategories.find(
					(c) => c.name.toLowerCase() === tx.category.toLowerCase(),
				) ??
				userCategories.find((c) => c.type === tx.type) ??
				userCategories[0];

			if (!match) {
				const [created] = await db
					.insert(category)
					.values({
						id: randomUUID(),
						userId,
						name: tx.category,
						type: tx.type === "INCOME" ? "INCOME" : "EXPENSE",
						icon: "tag",
						color: "#64748B",
						isDefault: false,
					})
					.returning();
				userCategories.push(created);
				await db
					.update(transaction)
					.set({ categoryId: created.id })
					.where(eq(transaction.id, tx.id));
				continue;
			}

			await db
				.update(transaction)
				.set({ categoryId: match.id })
				.where(eq(transaction.id, tx.id));
		}
	}

	const usersWithoutCategories = await db.execute<{ id: string }>(sql`
		SELECT u.id
		FROM "user" u
		LEFT JOIN "category" c ON c.user_id = u.id
		WHERE c.id IS NULL
	`);

	for (const row of usersWithoutCategories.rows) {
		await seedDefaultCategoriesService(row.id);
	}

	const unresolved = await db
		.select({ id: transaction.id })
		.from(transaction)
		.where(isNull(transaction.categoryId))
		.limit(1);

	if (unresolved.length > 0) {
		throw new Error(
			"Some transactions still lack category_id. Resolve manually before dropping legacy column.",
		);
	}

	await db.execute(sql`
		DO $$ BEGIN
			ALTER TABLE "transaction" DROP COLUMN IF EXISTS "category";
		EXCEPTION
			WHEN others THEN null;
		END $$;
	`);

	await db.execute(sql`
		ALTER TABLE "transaction"
		ALTER COLUMN "category_id" SET NOT NULL;
	`);

	console.log("Category migration completed successfully.");
	console.log(
		`Default category templates available: ${DEFAULT_CATEGORIES.length}`,
	);
}

migrateCategoryData()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Category migration failed:", error);
		process.exit(1);
	});
