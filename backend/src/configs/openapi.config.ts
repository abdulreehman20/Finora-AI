// ─── Finora AI – OpenAPI 3.1 Specification ───────────────────────────────────
// Covers: /api/transaction/* and /api/report/* endpoints
// Auth:   Bearer token (session token from Better Auth sign-in)
// ─────────────────────────────────────────────────────────────────────────────

export const openApiSpec = {
	openapi: "3.1.0",
	info: {
		title: "Finora AI – API Reference",
		version: "1.0.0",
		description: `
## Finora AI REST API

This is the OpenAPI reference for the **Finora AI** backend.

### Authentication
All endpoints (except the health check) require a **Bearer token** obtained from  
the [Better Auth](/api/auth/reference) sign-in flow.

Add the header to every request:
\`\`\`
Authorization: Bearer <your-session-token>
\`\`\`

### Base URL
| Environment | URL |
|---|---|
| Local | \`http://localhost:7000\` |

> Auth endpoints live at \`/api/auth/*\` and are documented separately at  
> [/api/auth/reference](/api/auth/reference).
    `,
		contact: {
			name: "Finora AI Support",
		},
	},
	servers: [
		{
			url: "http://localhost:7000",
			description: "Local development server",
		},
	],
	tags: [
		{
			name: "Health",
			description: "Server health check",
		},
		{
			name: "Transactions",
			description: "Create, read, update and delete financial transactions",
		},
		{
			name: "Reports",
			description:
				"Generate AI-powered financial reports and manage report settings",
		},
	],
	components: {
		securitySchemes: {
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				description:
					"Session token returned by Better Auth `/api/auth/sign-in/email`. Paste the token value here.",
			},
		},
		schemas: {
			// ── Enums ──────────────────────────────────────────────────────────────
			TransactionType: {
				type: "string",
				enum: ["INCOME", "EXPENSE"],
				description: "Whether money came in or went out",
			},
			TransactionStatus: {
				type: "string",
				enum: ["PENDING", "COMPLETED", "FAILED"],
				default: "COMPLETED",
			},
			RecurringInterval: {
				type: "string",
				enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
				nullable: true,
			},
			PaymentMethod: {
				type: "string",
				enum: [
					"CARD",
					"BANK_TRANSFER",
					"MOBILE_PAYMENT",
					"AUTO_DEBIT",
					"CASH",
					"OTHER",
				],
				default: "CASH",
			},
			ReportFrequency: {
				type: "string",
				enum: ["MONTHLY"],
				default: "MONTHLY",
			},
			ReportStatus: {
				type: "string",
				enum: ["SENT", "PENDING", "FAILED", "NO_ACTIVITY"],
			},

			// ── Transaction object ─────────────────────────────────────────────────
			Transaction: {
				type: "object",
				properties: {
					id: { type: "string", description: "UUID" },
					userId: { type: "string" },
					type: { $ref: "#/components/schemas/TransactionType" },
					title: { type: "string", example: "Netflix subscription" },
					amount: {
						type: "integer",
						description: "Amount in cents (e.g. 999 = $9.99)",
						example: 999,
					},
					category: { type: "string", example: "Entertainment" },
					description: { type: "string", nullable: true },
					receiptUrl: { type: "string", nullable: true },
					isRecurring: { type: "boolean", default: false },
					recurringInterval: {
						$ref: "#/components/schemas/RecurringInterval",
					},
					nextRecurringDate: {
						type: "string",
						format: "date-time",
						nullable: true,
					},
					lastProcessed: {
						type: "string",
						format: "date-time",
						nullable: true,
					},
					paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
					status: { $ref: "#/components/schemas/TransactionStatus" },
					date: { type: "string", format: "date-time" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},

			// ── Transaction request bodies ─────────────────────────────────────────
			CreateTransactionRequest: {
				type: "object",
				required: ["title", "type", "amount", "category", "date"],
				properties: {
					title: {
						type: "string",
						minLength: 1,
						example: "Grocery shopping",
					},
					description: { type: "string", example: "Weekly groceries" },
					type: { $ref: "#/components/schemas/TransactionType" },
					amount: {
						type: "number",
						minimum: 1,
						description: "Amount in dollars (positive number)",
						example: 85.5,
					},
					category: { type: "string", example: "Food" },
					date: {
						type: "string",
						format: "date-time",
						example: "2026-03-05T10:00:00.000Z",
					},
					isRecurring: { type: "boolean", default: false },
					recurringInterval: {
						$ref: "#/components/schemas/RecurringInterval",
					},
					receiptUrl: { type: "string", example: "https://..." },
					paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
				},
			},

			UpdateTransactionRequest: {
				type: "object",
				description:
					"All fields are optional – only send what you want to change",
				properties: {
					title: { type: "string" },
					description: { type: "string" },
					type: { $ref: "#/components/schemas/TransactionType" },
					amount: { type: "number", minimum: 1 },
					category: { type: "string" },
					date: { type: "string", format: "date-time" },
					isRecurring: { type: "boolean" },
					recurringInterval: {
						$ref: "#/components/schemas/RecurringInterval",
					},
					receiptUrl: { type: "string" },
					paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
				},
			},

			BulkTransactionRequest: {
				type: "object",
				required: ["transactions"],
				properties: {
					transactions: {
						type: "array",
						minItems: 1,
						maxItems: 300,
						items: { $ref: "#/components/schemas/CreateTransactionRequest" },
						description: "Between 1 and 300 transactions",
					},
				},
			},

			BulkDeleteTransactionRequest: {
				type: "object",
				required: ["transactionIds"],
				properties: {
					transactionIds: {
						type: "array",
						minItems: 1,
						items: { type: "string", format: "uuid" },
						example: [
							"550e8400-e29b-41d4-a716-446655440000",
							"550e8400-e29b-41d4-a716-446655440001",
						],
					},
				},
			},

			// ── Pagination ─────────────────────────────────────────────────────────
			Pagination: {
				type: "object",
				properties: {
					pageSize: { type: "integer", example: 20 },
					pageNumber: { type: "integer", example: 1 },
					totalCount: { type: "integer", example: 142 },
					totalPages: { type: "integer", example: 8 },
					skip: { type: "integer", example: 0 },
				},
			},

			// ── Report objects ─────────────────────────────────────────────────────
			Report: {
				type: "object",
				properties: {
					id: { type: "string" },
					userId: { type: "string" },
					period: { type: "string", example: "March 1 - 31, 2026" },
					sentDate: { type: "string", format: "date-time" },
					status: { $ref: "#/components/schemas/ReportStatus" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},

			GeneratedReport: {
				type: "object",
				description:
					"On-demand report generated from transactions in the given date range. " +
					"The report is automatically **emailed** to the authenticated user and **persisted** " +
					"in the report history table.",
				properties: {
					period: { type: "string", example: "March 1 - 31, 2026" },
					summary: {
						type: "object",
						properties: {
							income: { type: "number", example: 5000.0 },
							expenses: { type: "number", example: 3200.55 },
							balance: { type: "number", example: 1799.45 },
							savingsRate: { type: "number", example: 36.0 },
							topCategories: {
								type: "array",
								items: {
									type: "object",
									properties: {
										name: { type: "string", example: "Food" },
										amount: { type: "number", example: 850.0 },
										percent: { type: "integer", example: 26 },
									},
								},
							},
						},
					},
					insights: {
						type: "array",
						items: { type: "string" },
						description: "AI-generated actionable insights for the period",
						example: [
							"Your food spending is 26% of expenses — consider meal prepping to cut costs.",
							"Housing costs are your largest expense category at 37%.",
						],
					},
				},
			},

			ReportSetting: {
				type: "object",
				properties: {
					id: { type: "string" },
					userId: { type: "string" },
					frequency: { $ref: "#/components/schemas/ReportFrequency" },
					isEnabled: { type: "boolean", example: true },
					dayOfMonth: {
						type: "integer",
						minimum: 1,
						maximum: 28,
						default: 1,
						example: 1,
						description:
							"Day of the month (1–28) on which the monthly report is generated and emailed.",
					},
					nextReportDate: {
						type: "string",
						format: "date-time",
						nullable: true,
					},
					lastSentDate: {
						type: "string",
						format: "date-time",
						nullable: true,
					},
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},

			UpdateReportSettingRequest: {
				type: "object",
				description:
					"All fields are optional — only send what you want to change.",
				properties: {
					isEnabled: {
						type: "boolean",
						example: true,
						description:
							"Enable (`true`) or disable (`false`) automated monthly email reports.",
					},
					dayOfMonth: {
						type: "integer",
						minimum: 1,
						maximum: 28,
						default: 1,
						example: 1,
						description:
							"Day of the month (1–28) on which to send the monthly report. " +
							"Capped at 28 so the date exists in every calendar month.",
					},
				},
			},

			// ── Common responses ───────────────────────────────────────────────────
			SuccessMessage: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
			},
			ErrorResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: false },
					message: { type: "string", example: "Something went wrong" },
					errors: {
						type: "array",
						items: {},
					},
				},
			},
			UnauthorizedError: {
				type: "object",
				properties: {
					message: { type: "string", example: "User not authenticated" },
				},
			},
		},

		// ── Reusable responses ─────────────────────────────────────────────────
		responses: {
			Unauthorized: {
				description: "Authentication token is missing or invalid",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/UnauthorizedError" },
					},
				},
			},
			NotFound: {
				description: "Resource not found",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
					},
				},
			},
			ValidationError: {
				description: "Request body / query params failed validation",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
					},
				},
			},
			InternalError: {
				description: "Unexpected server error",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ErrorResponse" },
					},
				},
			},
		},

		// ── Reusable parameters ────────────────────────────────────────────────
		parameters: {
			TransactionId: {
				name: "id",
				in: "path",
				required: true,
				schema: { type: "string" },
				description: "Transaction ID",
				example: "550e8400-e29b-41d4-a716-446655440000",
			},
			PageSize: {
				name: "pageSize",
				in: "query",
				schema: { type: "integer", default: 20 },
				description: "Number of items per page",
			},
			PageNumber: {
				name: "pageNumber",
				in: "query",
				schema: { type: "integer", default: 1 },
				description: "Page number (1-indexed)",
			},
		},
	},

	// ── Global security (all routes require bearer unless overridden) ──────────
	security: [{ BearerAuth: [] }],

	// ══════════════════════════════════════════════════════════════════════════
	// PATHS
	// ══════════════════════════════════════════════════════════════════════════
	paths: {
		// ── Health ───────────────────────────────────────────────────────────
		"/api/health": {
			get: {
				tags: ["Health"],
				operationId: "healthCheck",
				summary: "Health check",
				description: "Returns 200 when the server is up and running.",
				security: [],
				responses: {
					"200": {
						description: "Server is healthy",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										message: {
											type: "string",
											example: "API is working!",
										},
									},
								},
							},
						},
					},
				},
			},
		},

		// ══════════════════════════════════════════════════════════════════════
		// TRANSACTIONS
		// ══════════════════════════════════════════════════════════════════════

		"/api/transaction/all": {
			get: {
				tags: ["Transactions"],
				operationId: "getAllTransactions",
				summary: "Get all transactions",
				description:
					"Returns a paginated list of the authenticated user's transactions. Supports filtering by keyword, type, and recurring status.",
				parameters: [
					{ $ref: "#/components/parameters/PageSize" },
					{ $ref: "#/components/parameters/PageNumber" },
					{
						name: "keyword",
						in: "query",
						schema: { type: "string" },
						description: "Search by title or description",
						example: "netflix",
					},
					{
						name: "type",
						in: "query",
						schema: { $ref: "#/components/schemas/TransactionType" },
						description: "Filter by transaction type",
					},
					{
						name: "recurringStatus",
						in: "query",
						schema: {
							type: "string",
							enum: ["RECURRING", "NON_RECURRING"],
						},
						description: "Filter recurring vs one-off transactions",
					},
				],
				responses: {
					"200": {
						description: "Transactions fetched successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												transactions: {
													type: "array",
													items: {
														$ref: "#/components/schemas/Transaction",
													},
												},
												pagination: {
													$ref: "#/components/schemas/Pagination",
												},
											},
										},
									],
								},
								example: {
									message: "Transaction fetched successfully",
									transactions: [
										{
											id: "550e8400-e29b-41d4-a716-446655440000",
											userId: "user_abc123",
											type: "EXPENSE",
											title: "Netflix",
											amount: 1500,
											category: "Entertainment",
											isRecurring: true,
											recurringInterval: "MONTHLY",
											paymentMethod: "CARD",
											status: "COMPLETED",
											date: "2026-03-01T00:00:00.000Z",
										},
									],
									pagination: {
										pageSize: 20,
										pageNumber: 1,
										totalCount: 1,
										totalPages: 1,
										skip: 0,
									},
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/{id}": {
			get: {
				tags: ["Transactions"],
				operationId: "getTransactionById",
				summary: "Get a single transaction",
				description: "Fetch a specific transaction by its ID.",
				parameters: [{ $ref: "#/components/parameters/TransactionId" }],
				responses: {
					"200": {
						description: "Transaction fetched successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												transaction: {
													$ref: "#/components/schemas/Transaction",
												},
											},
										},
									],
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/create": {
			post: {
				tags: ["Transactions"],
				operationId: "createTransaction",
				summary: "Create a transaction",
				description:
					"Creates a new income or expense transaction for the authenticated user.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/CreateTransactionRequest",
							},
							examples: {
								expense: {
									summary: "One-time expense",
									value: {
										title: "Lunch",
										type: "EXPENSE",
										amount: 12.5,
										category: "Food",
										date: "2026-03-05T12:00:00.000Z",
										isRecurring: false,
										paymentMethod: "CASH",
									},
								},
								recurringIncome: {
									summary: "Recurring monthly income",
									value: {
										title: "Salary",
										type: "INCOME",
										amount: 5000,
										category: "Employment",
										date: "2026-03-01T00:00:00.000Z",
										isRecurring: true,
										recurringInterval: "MONTHLY",
										paymentMethod: "BANK_TRANSFER",
									},
								},
							},
						},
					},
				},
				responses: {
					"201": {
						description: "Transaction created successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												transaction: {
													$ref: "#/components/schemas/Transaction",
												},
											},
										},
									],
								},
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/update/{id}": {
			put: {
				tags: ["Transactions"],
				operationId: "updateTransaction",
				summary: "Update a transaction",
				description:
					"Partially update any field on an existing transaction. Only the fields you include will be changed.",
				parameters: [{ $ref: "#/components/parameters/TransactionId" }],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/UpdateTransactionRequest",
							},
							example: {
								title: "Updated title",
								amount: 99.99,
								category: "Shopping",
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Transaction updated successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessMessage" },
								example: { message: "Transaction updated successfully" },
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/duplicate/{id}": {
			put: {
				tags: ["Transactions"],
				operationId: "duplicateTransaction",
				summary: "Duplicate a transaction",
				description:
					"Creates an exact copy of an existing transaction and returns the new duplicate.",
				parameters: [{ $ref: "#/components/parameters/TransactionId" }],
				responses: {
					"200": {
						description: "Transaction duplicated successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												data: {
													$ref: "#/components/schemas/Transaction",
												},
											},
										},
									],
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/delete/{id}": {
			delete: {
				tags: ["Transactions"],
				operationId: "deleteTransaction",
				summary: "Delete a transaction",
				description: "Permanently deletes a single transaction.",
				parameters: [{ $ref: "#/components/parameters/TransactionId" }],
				responses: {
					"200": {
						description: "Transaction deleted successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessMessage" },
								example: { message: "Transaction deleted successfully" },
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"404": { $ref: "#/components/responses/NotFound" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/scan-receipt": {
			post: {
				tags: ["Transactions"],
				operationId: "scanReceipt",
				summary: "Scan a receipt (AI)",
				description:
					"Upload a receipt image. The AI will extract the amount, category, date, and other fields automatically. Use the returned data to pre-fill a Create Transaction form.",
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["receipt"],
								properties: {
									receipt: {
										type: "string",
										format: "binary",
										description: "Receipt image file (jpg/png/webp)",
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Receipt scanned successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												data: {
													type: "object",
													description: "AI-extracted receipt fields",
													properties: {
														title: { type: "string" },
														amount: { type: "number" },
														category: { type: "string" },
														date: {
															type: "string",
															format: "date-time",
														},
														description: { type: "string" },
													},
												},
											},
										},
									],
								},
								example: {
									message: "Reciept scanned successfully",
									data: {
										title: "Starbucks",
										amount: 5.75,
										category: "Food & Drink",
										date: "2026-03-05T08:30:00.000Z",
										description: "Caramel Macchiato",
									},
								},
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/bulk-transaction": {
			post: {
				tags: ["Transactions"],
				operationId: "bulkCreateTransactions",
				summary: "Bulk create transactions",
				description:
					"Insert up to **300** transactions in a single request. Useful for importing data from a CSV or external source.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/BulkTransactionRequest",
							},
							example: {
								transactions: [
									{
										title: "Rent",
										type: "EXPENSE",
										amount: 1200,
										category: "Housing",
										date: "2026-03-01T00:00:00.000Z",
										isRecurring: true,
										recurringInterval: "MONTHLY",
										paymentMethod: "BANK_TRANSFER",
									},
									{
										title: "Freelance payment",
										type: "INCOME",
										amount: 800,
										category: "Freelance",
										date: "2026-03-03T00:00:00.000Z",
										isRecurring: false,
										paymentMethod: "BANK_TRANSFER",
									},
								],
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Bulk transaction inserted successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												inserted: {
													type: "integer",
													description: "Number of transactions created",
													example: 2,
												},
											},
										},
									],
								},
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/transaction/bulk-delete": {
			delete: {
				tags: ["Transactions"],
				operationId: "bulkDeleteTransactions",
				summary: "Bulk delete transactions",
				description: "Permanently delete multiple transactions by their IDs.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/BulkDeleteTransactionRequest",
							},
							example: {
								transactionIds: [
									"550e8400-e29b-41d4-a716-446655440000",
									"550e8400-e29b-41d4-a716-446655440001",
								],
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Transactions deleted successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												deleted: {
													type: "integer",
													description: "Number of transactions deleted",
													example: 2,
												},
											},
										},
									],
								},
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		// ══════════════════════════════════════════════════════════════════════
		// REPORTS
		// ══════════════════════════════════════════════════════════════════════

		"/api/report/all": {
			get: {
				tags: ["Reports"],
				operationId: "getAllReports",
				summary: "Get report history",
				description:
					"Returns a paginated list of all generated/scheduled reports for the authenticated user.",
				parameters: [
					{ $ref: "#/components/parameters/PageSize" },
					{ $ref: "#/components/parameters/PageNumber" },
				],
				responses: {
					"200": {
						description: "Reports fetched successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{
											type: "object",
											properties: {
												reports: {
													type: "array",
													items: {
														$ref: "#/components/schemas/Report",
													},
												},
												pagination: {
													$ref: "#/components/schemas/Pagination",
												},
											},
										},
									],
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/report/generate": {
			get: {
				tags: ["Reports"],
				operationId: "generateReport",
				summary: "Generate an on-demand report (AI)",
				description:
					"Generates an AI-powered financial summary for the given date range.\n\n" +
					"**Side-effects (automatic):**\n" +
					"- The report is **emailed** to the authenticated user's registered email address.\n" +
					"- A record is **saved** to the report history table with status `SENT` or `FAILED`.\n\n" +
					"The full report payload is also returned in the response body for immediate use.",
				parameters: [
					{
						name: "from",
						in: "query",
						required: true,
						schema: { type: "string", format: "date-time" },
						example: "2026-03-01T00:00:00.000Z",
						description: "Start of the reporting period (ISO 8601)",
					},
					{
						name: "to",
						in: "query",
						required: true,
						schema: { type: "string", format: "date-time" },
						example: "2026-03-31T23:59:59.000Z",
						description: "End of the reporting period (ISO 8601)",
					},
				],
				responses: {
					"200": {
						description: "Report generated successfully",
						content: {
							"application/json": {
								schema: {
									allOf: [
										{ $ref: "#/components/schemas/SuccessMessage" },
										{ $ref: "#/components/schemas/GeneratedReport" },
									],
								},
								example: {
									message: "Report generated successfully",
									period: "March 1 - 31, 2026",
									summary: {
										income: 5000,
										expenses: 3200.55,
										balance: 1799.45,
										savingsRate: 36.0,
										topCategories: [
											{ name: "Food", amount: 850, percent: 26 },
											{ name: "Housing", amount: 1200, percent: 37 },
										],
									},
									insights:
										"Your housing costs represent 37% of total expenses. Consider reviewing subscriptions to free up cash.",
								},
							},
						},
					},
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},

		"/api/report/update-setting": {
			put: {
				tags: ["Reports"],
				operationId: "updateReportSetting",
				summary: "Update report settings",
				description:
					"Updates the authenticated user's recurring report preferences.\n\n" +
					"**First call behaviour:** If no setting row exists yet it is created automatically (upsert).\n\n" +
					"| Field | Description |\n" +
					"|---|---|\n" +
					"| `isEnabled` | Enable (`true`) or disable (`false`) automated monthly reports |\n" +
					"| `dayOfMonth` | Day of the month (1–28) on which the report is sent each month |\n\n" +
					"**Scheduling logic:**\n" +
					"- When `isEnabled` is `true`, `nextReportDate` is recalculated based on `dayOfMonth`.\n" +
					"- When `isEnabled` is `false`, `nextReportDate` is cleared and no report will be dispatched.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/UpdateReportSettingRequest",
							},
							examples: {
								enableDefault: {
									summary: "Enable monthly reports on the 1st",
									value: { isEnabled: true, dayOfMonth: 1 },
								},
								enableCustomDay: {
									summary: "Enable monthly reports on the 15th",
									value: { isEnabled: true, dayOfMonth: 15 },
								},
								disable: {
									summary: "Disable monthly reports",
									value: { isEnabled: false },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Report setting updated successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessMessage" },
								example: {
									message: "Reports setting updated successfully",
								},
							},
						},
					},
					"400": { $ref: "#/components/responses/ValidationError" },
					"401": { $ref: "#/components/responses/Unauthorized" },
					"500": { $ref: "#/components/responses/InternalError" },
				},
			},
		},
	},
} as const;
