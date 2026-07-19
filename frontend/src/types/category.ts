export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryBody {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export interface CategoryListResponse {
  message: string;
  categories: Category[];
}
