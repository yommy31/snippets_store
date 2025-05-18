import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Snippet,
  Category,
  Tag,
  ViewType,
  EditorMode,
  SnippetCreate,
  SnippetUpdate
} from '@/types';
import { api } from '../api/api';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface AppState {
  // Data states
  snippets: Snippet[];
  categories: Category[];
  tags: Tag[];
  
  // UI states
  currentView: ViewType;
  currentViewId?: string;
  searchQuery: string;
  selectedSnippetId?: string;
  editorMode: EditorMode;
  sidebarExpanded: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  setCurrentView: (view: ViewType, id?: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSnippetId: (id?: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  toggleSidebar: () => void;
  startCreateSnippet: () => void;
  
  // Data fetching
  fetchSnippets: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  
  // Snippet actions
  createSnippet: (snippet: SnippetCreate) => Promise<void>;
  updateSnippet: (id: string, snippet: SnippetUpdate) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  restoreSnippet: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  
  // Category actions
  createCategory: (name: string, description?: string, parentId?: string) => Promise<void>;
  updateCategory: (id: string, name: string, description?: string, parentId?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Tag actions
  createTag: (name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      snippets: [],
      categories: [],
      tags: [],
      
      currentView: 'all',
      currentViewId: undefined,
      searchQuery: '',
      selectedSnippetId: undefined,
      editorMode: 'view',
      sidebarExpanded: true,
      
      isLoading: false,
      error: null,
      
      // UI actions
      setCurrentView: (view, id) => set({ currentView: view, currentViewId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedSnippetId: (id) => set({ selectedSnippetId: id }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      startCreateSnippet: () => set({
        selectedSnippetId: undefined,
        editorMode: 'create'
      }),
      
      // Data fetching
      fetchSnippets: async (params) => {
        set({ isLoading: true, error: null });
        try {
          // 抽取搜索参数构建逻辑
          const buildSearchParams = (params: any) => {
            const searchParams: any = {};
            
            // 确保params存在
            if (!params) {
              return searchParams;
            }
            
            // 添加视图上下文
            if (params.view) {
              // 添加特定视图过滤器
              if (params.view === 'favorites') {
                searchParams.favorite = true;
              } else if (params.view === 'recycleBin') {
                searchParams.deleted = true;
              } else if (params.view === 'category' && params.id) {
                searchParams.categoryId = params.id;
              } else if (params.view === 'tag' && params.id) {
                searchParams.tagId = params.id;
              }
            }
            
            // 处理搜索查询
            if (params.search) {
              searchParams.q = params.search;
            } else if (params.tag) {
              searchParams.tag = params.tag;
            }
            
            return searchParams;
          };
          
          // 使用策略模式处理不同类型的搜索
          const searchStrategies = {
            // 普通搜索
            search: async (params: any) => {
              // 确保params存在
              if (!params) {
                return await api.snippets.getAll();
              }
              const searchParams = buildSearchParams(params);
              return await api.snippets.search(searchParams);
            },
            
            // 标签搜索
            tag: async (params: any) => {
              // 确保params存在
              if (!params) {
                return await api.snippets.getAll();
              }
              const searchParams = buildSearchParams(params);
              return await api.snippets.getAll(searchParams);
            },
            
            // 视图特定搜索
            view: async (params: any) => {
              // 确保params存在
              if (!params) {
                return await api.snippets.getAll();
              }
              
              if (params.view === 'favorites') {
                return await api.snippets.getFavorites();
              } else if (params.view === 'recycleBin') {
                return await api.snippets.getRecycleBin();
              } else if (params.view === 'category' && params.id) {
                return await api.categories.getSnippets(params.id);
              } else if (params.view === 'tag' && params.id) {
                return await api.tags.getSnippets(params.id);
              } else {
                return await api.snippets.getAll();
              }
            }
          };
          
          let snippets: Snippet[] = [];
          
          // 确定使用哪种搜索策略
          if (!params) {
            // 如果params为undefined或null，使用默认视图策略
            snippets = await searchStrategies.view(params);
          } else if (params.search) {
            snippets = await searchStrategies.search(params);
          } else if (params.tag) {
            snippets = await searchStrategies.tag(params);
          } else {
            snippets = await searchStrategies.view(params);
          }
          
          set({ snippets, isLoading: false });
        } catch (error) {
          logger.error('Error fetching snippets:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch snippets',
            isLoading: false
          });
          toast.error('Failed to fetch snippets');
        }
      },
      
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const categories = await api.categories.getAll();
          set({ categories, isLoading: false });
        } catch (error) {
          logger.error('Error fetching categories:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch categories', 
            isLoading: false 
          });
          toast.error('Failed to fetch categories');
        }
      },
      
      fetchTags: async () => {
        set({ isLoading: true, error: null });
        try {
          const tags = await api.tags.getAll();
          set({ tags, isLoading: false });
        } catch (error) {
          logger.error('Error fetching tags:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tags', 
            isLoading: false 
          });
          toast.error('Failed to fetch tags');
        }
      },
      
      // Snippet actions
      createSnippet: async (snippet) => {
        set({ isLoading: true, error: null });
        try {
          const newSnippet = await api.snippets.create(snippet);
          set((state) => ({ 
            snippets: [...state.snippets, newSnippet],
            selectedSnippetId: newSnippet.id,
            editorMode: 'view',
            isLoading: false
          }));
          toast.success('Snippet created successfully');
        } catch (error) {
          logger.error('Error creating snippet:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create snippet', 
            isLoading: false 
          });
          toast.error('Failed to create snippet');
        }
      },
      
      updateSnippet: async (id, snippet) => {
        set({ isLoading: true, error: null });
        try {
          const updatedSnippet = await api.snippets.update(id, snippet);
          set((state) => ({
            snippets: state.snippets.map((s) =>
              s.id === id ? updatedSnippet : s
            ),
            editorMode: 'view',
            isLoading: false
          }));
          toast.success('Snippet updated successfully');
        } catch (error) {
          logger.error('Error updating snippet:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update snippet', 
            isLoading: false 
          });
          toast.error('Failed to update snippet');
        }
      },
      
      deleteSnippet: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.snippets.delete(id);
          set((state) => {
            // If in recycle bin view, remove from list, otherwise mark as deleted
            if (state.currentView === 'recycleBin') {
              return {
                snippets: state.snippets.filter((s) => s.id !== id),
                selectedSnippetId: state.selectedSnippetId === id ? undefined : state.selectedSnippetId,
                isLoading: false
              };
            } else {
              return {
                snippets: state.snippets.map((s) =>
                  s.id === id ? { ...s, isDeleted: true } : s
                ),
                selectedSnippetId: state.selectedSnippetId === id ? undefined : state.selectedSnippetId,
                isLoading: false
              };
            }
          });
          toast.success('Snippet moved to recycle bin');
        } catch (error) {
          logger.error('Error deleting snippet:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete snippet', 
            isLoading: false 
          });
          toast.error('Failed to delete snippet');
        }
      },
      
      restoreSnippet: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const restoredSnippet = await api.snippets.restore(id);
          set((state) => ({
            snippets: state.snippets.map((s) =>
              s.id === id ? restoredSnippet : s
            ),
            isLoading: false
          }));
          toast.success('Snippet restored successfully');
        } catch (error) {
          logger.error('Error restoring snippet:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to restore snippet', 
            isLoading: false 
          });
          toast.error('Failed to restore snippet');
        }
      },
      
      toggleFavorite: async (id) => {
        const { snippets } = get();
        const snippet = snippets.find((s) => s.id === id);
        
        if (!snippet) return;
        
        const newFavoriteStatus = !snippet.isFavorite;
        
        // Optimistic update
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, isFavorite: newFavoriteStatus } : s
          )
        }));
        
        try {
          await api.snippets.toggleFavorite(id, newFavoriteStatus);
        } catch (error) {
          logger.error('Error toggling favorite:', error);
          
          // Revert on error
          set((state) => ({
            snippets: state.snippets.map((s) =>
              s.id === id ? { ...s, isFavorite: !newFavoriteStatus } : s
            )
          }));
          
          toast.error('Failed to update favorite status');
        }
      },
      
      // Category actions
      createCategory: async (name, description, parentId) => {
        set({ isLoading: true, error: null });
        try {
          const newCategory = await api.categories.create(name, description, parentId);
          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false
          }));
          toast.success('Category created successfully');
        } catch (error) {
          logger.error('Error creating category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create category', 
            isLoading: false 
          });
          toast.error('Failed to create category');
        }
      },
      
      updateCategory: async (id, name, description, parentId) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCategory = await api.categories.update(id, name, description, parentId);
          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? updatedCategory : c
            ),
            isLoading: false
          }));
          toast.success('Category updated successfully');
        } catch (error) {
          logger.error('Error updating category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category', 
            isLoading: false 
          });
          toast.error('Failed to update category');
        }
      },
      
      deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.categories.delete(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            // Reset snippets' categoryId if their category is deleted
            snippets: state.snippets.map((s) =>
              s.categoryId === id ? { ...s, categoryId: undefined } : s
            ),
            isLoading: false
          }));
          toast.success('Category deleted successfully');
        } catch (error) {
          logger.error('Error deleting category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete category', 
            isLoading: false 
          });
          toast.error('Failed to delete category');
        }
      },
      
      // Tag actions
      createTag: async (name) => {
        // Check if tag already exists
        const { tags } = get();
        if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const newTag = await api.tags.create(name);
          set((state) => ({
            tags: [...state.tags, newTag],
            isLoading: false
          }));
        } catch (error) {
          logger.error('Error creating tag:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create tag', 
            isLoading: false 
          });
          toast.error('Failed to create tag');
        }
      },
      
      deleteTag: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.tags.delete(id);
          
          const { tags, snippets } = get();
          const tagName = tags.find((t) => t.id === id)?.name;
          
          set({
            tags: tags.filter((t) => t.id !== id),
            // Remove tag from snippets
            snippets: tagName
              ? snippets.map((s) => ({
                  ...s,
                  tags: s.tags.filter((t) => t !== tagName),
                }))
              : snippets,
            isLoading: false
          });
          
          toast.success('Tag deleted successfully');
        } catch (error) {
          logger.error('Error deleting tag:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete tag', 
            isLoading: false 
          });
          toast.error('Failed to delete tag');
        }
      },
    })
  )
);