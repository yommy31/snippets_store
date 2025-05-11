/**
 * Export all API clients
 */

import { apiClient } from './index';
import { snippetsApi } from './snippets';
import { categoriesApi } from './categories';
import { tagsApi } from './tags';
import { collectionsApi } from './collections';

export const api = {
  snippets: snippetsApi,
  categories: categoriesApi,
  tags: tagsApi,
  collections: collectionsApi,
};

export default api;