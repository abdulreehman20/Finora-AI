import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./user.schema.js";

export const categoryTypeEnum = pgEnum("category_type", ["INCOME", "EXPENSE"]);

export const CategoryTypeEnum = {
	INCOME: "INCOME",
	EXPENSE: "EXPENSE",
} as const;

export type CategoryType = (typeof categoryTypeEnum.enumValues)[number];

export const category = pgTable(
	"category",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: categoryTypeEnum("type").notNull(),
		icon: text("icon").notNull(),
		color: text("color").notNull(),
		isDefault: boolean("is_default").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("category_user_id_idx").on(table.userId),
		index("category_user_id_type_idx").on(table.userId, table.type),
	],
);

export const categoryRelations = relations(category, ({ one }) => ({
	user: one(user, {
		fields: [category.userId],
		references: [user.id],
	}),
}));
