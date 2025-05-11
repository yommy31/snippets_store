/**
 * Type definitions for the code snippet manager
 */

// Snippet types
export interface Snippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  categoryId?: string;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type SnippetCreate = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite' | 'isDeleted'>;
export type SnippetUpdate = Partial<SnippetCreate>;

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
}

export type CategoryCreate = Omit<Category, 'id' | 'createdAt'>;
export type CategoryUpdate = Partial<CategoryCreate>;

// Tag types
export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export type TagCreate = Omit<Tag, 'id' | 'createdAt'>;
export type TagUpdate = Partial<TagCreate>;

// Collection types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export type CollectionCreate = Omit<Collection, 'id' | 'createdAt'>;
export type CollectionUpdate = Partial<CollectionCreate>;

// UI state types
export type ViewType = 'all' | 'category' | 'tag' | 'favorites' | 'recycleBin';
export type EditorMode = 'view' | 'edit' | 'create';

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },  // 1
  { value: 'java', label: 'Java' },  // 1
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },  // 1
  { value: 'yaml', label: 'Yaml' },  // 1
  { value: 'shell', label: 'Shell' },  // 1
  { value: 'toml', label: 'Toml' },  // 1
  { value: 'go', label: 'Go' },  // 1
  { value: 'rust', label: 'Rust' },  // 1
  { value: 'xml', label: 'Xml' },  // 1
  { value: 'plaintext', label: 'Plain Text' },
] as const;

export type LanguageOption = typeof LANGUAGE_OPTIONS[number]['value'];