import { apiClient } from './index';
import { Snippet, Collection } from '@/types';

interface CollectionsResponse {
  collections: Collection[];
}

interface CollectionResponse {
  collection: Collection;
}

interface SnippetsResponse {
  snippets: Snippet[];
}

interface SuccessResponse {
  success: boolean;
}

/**
 * API client for collection-related endpoints
 */
export const collectionsApi = {
  /**
   * Get all collections
   */
  getAll: async (): Promise<Collection[]> => {
    const response = await apiClient.get<CollectionsResponse>('/collections');
    return response.collections;
  },

  /**
   * Get a collection by ID
   */
  getById: async (id: string): Promise<Collection> => {
    const response = await apiClient.get<CollectionResponse>(`/collections/${id}`);
    return response.collection;
  },

  /**
   * Get snippets in a collection
   */
  getSnippets: async (id: string): Promise<Snippet[]> => {
    const response = await apiClient.get<SnippetsResponse>(`/collections/${id}/snippets`);
    return response.snippets;
  },

  /**
   * Create a new collection
   */
  create: async (name: string, description?: string): Promise<Collection> => {
    const response = await apiClient.post<CollectionResponse>('/collections', {
      name,
      description
    });
    return response.collection;
  },

  /**
   * Update a collection
   */
  update: async (id: string, name?: string, description?: string): Promise<Collection> => {
    const response = await apiClient.put<CollectionResponse>(`/collections/${id}`, {
      name,
      description
    });
    return response.collection;
  },

  /**
   * Delete a collection
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/collections/${id}`);
    return response.success;
  },

  /**
   * Add a snippet to a collection
   */
  addSnippet: async (collectionId: string, snippetId: string): Promise<boolean> => {
    const response = await apiClient.post<SuccessResponse>(`/collections/${collectionId}/snippets/${snippetId}`);
    return response.success;
  },

  /**
   * Remove a snippet from a collection
   */
  removeSnippet: async (collectionId: string, snippetId: string): Promise<boolean> => {
    const response = await apiClient.delete<SuccessResponse>(`/collections/${collectionId}/snippets/${snippetId}`);
    return response.success;
  }
};