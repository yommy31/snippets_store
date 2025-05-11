import { apiClient } from './index';
import { Tag, Snippet } from '@/types';

interface TagsResponse {
  tags: Tag[];
}

interface TagResponse {
  tag: Tag;
}

interface SnippetsResponse {
  snippets: Snippet[];
}

interface SuccessResponse {
  success: boolean;
}

/**
 * API client for tag-related endpoints
 */
export const tagsApi = {
  /**
   * Get all tags
   */
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<TagsResponse>('/tags');
    return response.tags;
  },

  /**
   * Get a tag by ID
   */
  getById: async (id: string): Promise<Tag> => {
    const response = await apiClient.get<TagResponse>(`/tags/${id}`);
    return response.tag;
  },

  /**
   * Get snippets by tag
   */
  getSnippets: async (id: string): Promise<Snippet[]> => {
    const response = await apiClient.get<SnippetsResponse>(`/tags/${id}/snippets`);
    return response.snippets;
  },

  /**
   * Create a new tag
   */
  create: async (name: string): Promise<Tag> => {
    const response = await apiClient.post<TagResponse>('/tags', { name });
    return response.tag;
  },

  /**
   * Update a tag
   */
  update: async (id: string, name: string): Promise<Tag> => {
    const response = await apiClient.put<TagResponse>(`/tags/${id}`, { name });
    return response.tag;
  },

  /**
   * Delete a tag
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/tags/${id}`);
    return response.success;
  }
};