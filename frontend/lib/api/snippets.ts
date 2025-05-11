import { apiClient } from './index';
import { Snippet, SnippetCreate, SnippetUpdate } from '@/types';

interface SnippetsResponse {
  snippets: Snippet[];
}

interface SnippetResponse {
  snippet: Snippet;
}

interface SuccessResponse {
  success: boolean;
}

interface BatchResponse {
  success: boolean;
  count: number;
}

/**
 * API client for snippet-related endpoints
 */
export const snippetsApi = {
  /**
   * Get all snippets with optional filters
   */
  getAll: async (params?: {
    deleted?: boolean;
    favorite?: boolean;
    search?: string;
    language?: string;
    categoryId?: string;
    tag?: string;
  }): Promise<Snippet[]> => {
    // Convert boolean values to strings for URL parameters
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams[key] = String(value);
        }
      });
    }
    const response = await apiClient.get<SnippetsResponse>('/snippets', queryParams);
    return response.snippets;
  },

  /**
   * Get a snippet by ID
   */
  getById: async (id: string): Promise<Snippet> => {
    const response = await apiClient.get<SnippetResponse>(`/snippets/${id}`);
    return response.snippet;
  },

  /**
   * Create a new snippet
   */
  create: async (snippet: SnippetCreate): Promise<Snippet> => {
    const response = await apiClient.post<SnippetResponse>('/snippets', snippet);
    return response.snippet;
  },

  /**
   * Update a snippet
   */
  update: async (id: string, snippet: SnippetUpdate): Promise<Snippet> => {
    const response = await apiClient.put<SnippetResponse>(`/snippets/${id}`, snippet);
    return response.snippet;
  },

  /**
   * Delete a snippet (move to recycle bin)
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/snippets/${id}`);
    return response.success;
  },

  /**
   * Restore a snippet from recycle bin
   */
  restore: async (id: string): Promise<Snippet> => {
    const response = await apiClient.post<SnippetResponse>(`/snippets/${id}/restore`);
    return response.snippet;
  },

  /**
   * Permanently delete a snippet
   */
  permanentDelete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/snippets/${id}/permanent`);
    return response.success;
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<Snippet> => {
    const response = await apiClient.post<SnippetResponse>(`/snippets/${id}/favorite`, { isFavorite });
    return response.snippet;
  },

  /**
   * Search snippets
   */
  search: async (params: {
    q: string;
    deleted?: boolean;
    favorite?: boolean;
    language?: string;
    categoryId?: string;
    tag?: string;
  }): Promise<Snippet[]> => {
    // Convert boolean values to strings for URL parameters
    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
    const response = await apiClient.get<SnippetsResponse>('/snippets/search', queryParams);
    return response.snippets;
  },

  /**
   * Get favorite snippets
   */
  getFavorites: async (): Promise<Snippet[]> => {
    const response = await apiClient.get<SnippetsResponse>('/snippets/favorites');
    return response.snippets;
  },

  /**
   * Get recycle bin snippets
   */
  getRecycleBin: async (): Promise<Snippet[]> => {
    const response = await apiClient.get<SnippetsResponse>('/snippets/recycle-bin');
    return response.snippets;
  },

  /**
   * Batch operations
   */
  batchOperation: async (operation: 'delete' | 'restore' | 'favorite' | 'unfavorite' | 'permanent-delete', snippetIds: string[]): Promise<BatchResponse> => {
    return apiClient.post<BatchResponse>('/snippets/batch', {
      operation,
      snippetIds
    });
  }
};