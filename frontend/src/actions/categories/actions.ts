"use server";

import axios from "axios";
import { cookies } from "next/headers";
import type {
  Category,
  CategoryListResponse,
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@/types/category";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:7000";
const BASE = `${BACKEND_URL}/api/categories`;

async function getAxios() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
}

export async function getAllCategoriesAction(): Promise<CategoryListResponse> {
  const api = await getAxios();
  const { data } = await api.get(BASE);
  return data;
}

export async function createCategoryAction(body: CreateCategoryBody) {
  const api = await getAxios();
  const { data } = await api.post(BASE, body);
  return data as { message: string; category: Category };
}

export async function updateCategoryAction(
  id: string,
  body: UpdateCategoryBody,
) {
  const api = await getAxios();
  const { data } = await api.put(`${BASE}/${id}`, body);
  return data as { message: string; category: Category };
}

export async function deleteCategoryAction(id: string) {
  const api = await getAxios();
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
}
