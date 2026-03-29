import axios from "axios";
import { db } from "../db";
import { randomUUID } from "crypto";
import { APIError } from "../lib/apiError";
import { HTTPSTATUS } from "../configs/http.config";
import { receiptPrompt } from "../ai-prompt/prompt";
import { calculateNextOccurrence } from "../lib/helper";
import { genAI, genAIModel } from "../ai-prompt/ai.config";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { TransactionTypeEnum, transaction } from "../db/schema/transaction.schema";
import type { CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validator";

// Get All Transaction Service 
export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  },
) => {
  const { keyword, type, recurringStatus } = filters;
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  // Build WHERE conditions
  const conditions = [
    eq(transaction.userId, userId),
    ...(keyword
      ? [
          or(
            ilike(transaction.title, `%${keyword}%`),
            ilike(transaction.category, `%${keyword}%`),
          ),
        ]
      : []),
    ...(type ? [eq(transaction.type, TransactionTypeEnum[type])] : []),
    ...(recurringStatus === "RECURRING"
      ? [eq(transaction.isRecurring, true)]
      : recurringStatus === "NON_RECURRING"
        ? [eq(transaction.isRecurring, false)]
        : []),
  ];

  const whereClause = and(...conditions);

  const [transactions, countResult] = await Promise.all([
    db
      .select()
      .from(transaction)
      .where(whereClause)
      .orderBy(desc(transaction.createdAt))
      .limit(pageSize)
      .offset(skip),
    db.select({ totalCount: count() }).from(transaction).where(whereClause),
  ]);

  const totalCount = countResult[0]?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: { pageSize, pageNumber, totalCount, totalPages, skip },
  };
};

// Get Transaction By Id Service
export const getTransactionByIdService = async (
  userId: string,
  transactionId: string,
) => {
  const [found] = await db
    .select()
    .from(transaction)
    .where(
      and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
    )
    .limit(1);

  if (!found) throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

  return found;
};

// Create Transaction Service
export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string,
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calulatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval,
    );

    nextRecurringDate =
      calulatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calulatedDate;
  }

  const [created] = await db
    .insert(transaction)
    .values({
      id: randomUUID(),
      userId,
      title: body.title,
      description: body.description,
      type: body.type,
      // if you want cents in DB, multiply here:
      amount: Number(body.amount),
      category: body.category,
      date: body.date,
      isRecurring: body.isRecurring ?? false,
      recurringInterval: body.recurringInterval ?? null,
      nextRecurringDate,
      lastProcessed: null,
      paymentMethod: body.paymentMethod,
      status: "COMPLETED", // or whatever you want as default
    })
    .returning();

  return created;
};

// Update Transaction Service
export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType,
) => {
  // Fetch the existing transaction (belongs to this user)
  const [existingTransaction] = await db
    .select()
    .from(transaction)
    .where(
      and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
    )
    .limit(1);

  if (!existingTransaction)
    throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

  const now = new Date();
  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;
  const date =
    body.date !== undefined ? new Date(body.date) : existingTransaction.date;
  const recurringInterval =
    body.recurringInterval ?? existingTransaction.recurringInterval;

  let nextRecurringDate: Date | null = null;

  if (isRecurring && recurringInterval) {
    const calculatedDate = calculateNextOccurrence(date, recurringInterval);
    nextRecurringDate =
      calculatedDate < now
        ? calculateNextOccurrence(now, recurringInterval)
        : calculatedDate;
  }

  await db
    .update(transaction)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.paymentMethod !== undefined && {
        paymentMethod: body.paymentMethod,
      }),
      ...(body.amount !== undefined && { amount: Number(body.amount) }),
      date,
      isRecurring,
      recurringInterval: recurringInterval ?? null,
      nextRecurringDate,
    })
    .where(
      and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
    );

  return;
};

// Duplicate Transaction Service
export const duplicateTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  // Fetch the original transaction
  const [existing] = await db
    .select()
    .from(transaction)
    .where(
      and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
    )
    .limit(1);

  if (!existing)
    throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

  // Insert the duplicate (new id, reset recurring fields)
  const [duplicated] = await db
    .insert(transaction)
    .values({
      ...existing,
      id: randomUUID(),
      title: `Duplicate - ${existing.title}`,
      description: existing.description
        ? `${existing.description} (Duplicate)`
        : "Duplicated transaction",
      isRecurring: false,
      recurringInterval: null,
      nextRecurringDate: null,
      lastProcessed: null,
    })
    .returning();

  return duplicated;
};

// Delete Transaction Service
export const deleteTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  // Attempt delete and get back the deleted row
  const [deleted] = await db
    .delete(transaction)
    .where(
      and(eq(transaction.id, transactionId), eq(transaction.userId, userId)),
    )
    .returning();

  if (!deleted)
    throw new APIError(HTTPSTATUS.NOT_FOUND, "Transaction not found");

  return;
};

// Scan Receipt Service
export const scanReceiptService = async (
  file: Express.Multer.File | undefined,
) => {
  if (!file) throw new APIError(HTTPSTATUS.BAD_REQUEST, "No file uploaded");

  try {
    if (!file.path)
      throw new APIError(HTTPSTATUS.BAD_REQUEST, "Failed to upload file");

    // Download the Cloudinary image and convert to base64
    const responseData = await axios.get(file.path, {
      responseType: "arraybuffer",
    });
    const base64String = Buffer.from(responseData.data).toString("base64");

    if (!base64String)
      throw new APIError(HTTPSTATUS.BAD_REQUEST, "Could not process file");

    // Use the @google/genai v2 content format with inlineData
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [
        {
          role: "user",
          parts: [
            { text: receiptPrompt },
            { inlineData: { mimeType: file.mimetype, data: base64String } },
          ],
        },
      ],
      config: { temperature: 0, topP: 1, responseMimeType: "application/json" },
    });

    const response = result.text;

    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
    if (!cleanedText) return { error: "Could not read receipt content" };

    const data = JSON.parse(cleanedText);
    if (!data.amount || !data.date)
      return { error: "Receipt missing required information" };

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      receiptUrl: file.path,
    };
  } catch (error) {
    if (error instanceof APIError) throw error;
    return { error: "Receipt scanning service unavailable" };
  }
};

// Bulk Transaction Service
export const bulkTransactionService = async (
  userId: string,
  txList: CreateTransactionType[],
) => {
  const now = new Date();

  const rows = txList.map((tx) => {
    let nextRecurringDate: Date | null = null;

    if (tx.isRecurring && tx.recurringInterval) {
      const calculated = calculateNextOccurrence(tx.date, tx.recurringInterval);
      nextRecurringDate =
        calculated < now
          ? calculateNextOccurrence(now, tx.recurringInterval)
          : calculated;
    }

    return {
      id: randomUUID(),
      userId,
      title: tx.title,
      description: tx.description ?? null,
      type: tx.type,
      amount: Number(tx.amount),
      category: tx.category,
      date: tx.date,
      isRecurring: tx.isRecurring ?? false,
      recurringInterval: tx.recurringInterval ?? null,
      nextRecurringDate,
      lastProcessed: null,
      paymentMethod: tx.paymentMethod,
      status: "COMPLETED" as const,
    };
  });

  const inserted = await db.insert(transaction).values(rows).returning();

  return { insertedCount: inserted.length, success: true };
};

// Bulk Delete Transaction Service
export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[],
) => {
  const deleted = await db
    .delete(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        inArray(transaction.id, transactionIds),
      ),
    )
    .returning();

  if (deleted.length === 0)
    throw new APIError(HTTPSTATUS.NOT_FOUND, "No transactions found");

  return { success: true, deletedCount: deleted.length };
};
