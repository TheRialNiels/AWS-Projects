import type { Category } from "./getCategories.type";

export interface CreateCategoryResponse {
    message:      string;
    responseData: Category;
    success:      boolean;
}
