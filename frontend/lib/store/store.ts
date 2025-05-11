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
      
      // Data fetching
      fetchSnippets: async (params) => {
        set({ isLoading: true, error: null });
        try {
          let snippets: Snippet[] = [];
          
          // Fetch snippets based on current view
          if (params?.view === 'favorites') {
            snippets = await api.snippets.getFavorites();
          } else if (params?.view === 'recycleBin') {
            snippets = await api.snippets.getRecycleBin();
          } else if (params?.view === 'category' && params.id) {
            snippets = await api.categories.getSnippets(params.id);
          } else if (params?.view === 'tag' && params.id) {
            snippets = await api.tags.getSnippets(params.id);
          } else {
            // Use search if query is provided, otherwise get all
            if (params?.search) {
              snippets = await api.snippets.search({ q: params.search });
            } else {
              snippets = await api.snippets.getAll();
            }
          }
          
          set({ snippets, isLoading: false });
        } catch (error) {
          console.error('Error fetching snippets:', error);
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
          console.error('Error fetching categories:', error);
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
          console.error('Error fetching tags:', error);
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
          console.error('Error creating snippet:', error);
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
          console.error('Error updating snippet:', error);
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
          console.error('Error deleting snippet:', error);
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
          console.error('Error restoring snippet:', error);
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
          console.error('Error toggling favorite:', error);
          
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
          console.error('Error creating category:', error);
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
          console.error('Error updating category:', error);
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
          console.error('Error deleting category:', error);
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
          console.error('Error creating tag:', error);
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
          console.error('Error deleting tag:', error);
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