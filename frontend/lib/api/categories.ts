import { apiClient } from './index';
import { Category, Snippet } from '@/types';

interface CategoriesResponse {
  categories: Category[];
}

interface CategoryResponse {
  category: Category;
}

interface SnippetsResponse {
  snippets: Snippet[];
}

interface SuccessResponse {
  success: boolean;
}

/**
 * API client for category-related endpoints
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoriesResponse>('/categories');
    return response.categories;
  },

  /**
   * Get a category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return response.category;
  },

  /**
   * Get snippets by category
   */
  getSnippets: async (id: string): Promise<Snippet[]> => {
    const response = await apiClient.get<SnippetsResponse>(`/categories/${id}/snippets`);
    return response.snippets;
  },

  /**
   * Create a new category
   */
  create: async (name: string, description?: string, parentId?: string): Promise<Category> => {
    const response = await apiClient.post<CategoryResponse>('/categories', {
      name,
      description,
      parentId
    });
    return response.category;
  },

  /**
   * Update a category
   */
  update: async (id: string, name?: string, description?: string, parentId?: string): Promise<Category> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, {
      name,
      description,
      parentId
    });
    return response.category;
  },

  /**
   * Delete a category
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/categories/${id}`);
    return response.success;
  }
};