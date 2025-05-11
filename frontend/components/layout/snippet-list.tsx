"use client";

import { useAppStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon, ArrowLeftIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Import a simplified version of SnippetDetail for mobile view
import { SimplifiedSnippetDetail } from "./simplified-snippet-detail";

export function SnippetList() {
  const {
    snippets,
    categories,
    tags,
    searchQuery,
    setSearchQuery,
    currentView,
    currentViewId,
    selectedSnippetId,
    setSelectedSnippetId,
    fetchSnippets,
    isLoading,
    error
  } = useAppStore();
  
  // State to track if detail view is shown on mobile
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  // State to store formatted dates (client-side only)
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  
  // Format dates on client-side only to avoid hydration mismatch
  useEffect(() => {
    // Import date-fns dynamically to avoid SSR issues
    import('date-fns').then(({ formatDistanceToNow }) => {
      const dates: Record<string, string> = {};
      snippets.forEach(snippet => {
        dates[snippet.id] = formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true });
      });
      setFormattedDates(dates);
    });
  }, [snippets]);
  
  // Fetch snippets when view or search changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchSnippets({
        view: currentView,
        id: currentViewId,
        search: searchQuery
      });
    };
    
    fetchData();
  }, [fetchSnippets, currentView, currentViewId, searchQuery]);
  
  // Filter snippets based on current view and search query
  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      // Filter by view type
      if (currentView === 'favorites' && !snippet.isFavorite) return false;
      if (currentView === 'recycleBin' && !snippet.isDeleted) return false;
      if (currentView === 'category' && snippet.categoryId !== currentViewId) return false;
      if (currentView === 'tag' && !snippet.tags.includes(tags.find(t => t.id === currentViewId)?.name || '')) return false;
      if (currentView !== 'recycleBin' && snippet.isDeleted) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          snippet.title.toLowerCase().includes(query) ||
          snippet.description?.toLowerCase().includes(query) ||
          snippet.code.toLowerCase().includes(query) ||
          snippet.language.toLowerCase().includes(query) ||
          snippet.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [snippets, currentView, currentViewId, searchQuery, tags]);
  
  // Get view title
  const getViewTitle = () => {
    switch (currentView) {
      case 'all':
        return 'All Snippets';
      case 'favorites':
        return 'Favorites';
      case 'recycleBin':
        return 'Recycle Bin';
      case 'category':
        return categories.find(c => c.id === currentViewId)?.name || 'Category';
      case 'tag':
        return `#${tags.find(t => t.id === currentViewId)?.name || 'Tag'}`;
      default:
        return 'Snippets';
    }
  };
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle snippet selection
  const handleSnippetSelect = (id: string) => {
    setSelectedSnippetId(id);
    // Only show detail on mobile if we're on a small screen
    if (window.innerWidth < 1024) { // lg breakpoint
      setShowDetailOnMobile(true);
    }
  };
  
  // Go back to list view on mobile
  const handleBackToList = () => {
    setShowDetailOnMobile(false);
  };
  
  // Select first snippet when filtered list changes
  useEffect(() => {
    if (filteredSnippets.length > 0 && !selectedSnippetId) {
      setSelectedSnippetId(filteredSnippets[0].id);
    } else if (filteredSnippets.length === 0) {
      setSelectedSnippetId(undefined);
    } else if (selectedSnippetId && !filteredSnippets.some(s => s.id === selectedSnippetId)) {
      setSelectedSnippetId(filteredSnippets[0]?.id);
    }
  }, [filteredSnippets, selectedSnippetId, setSelectedSnippetId]);
  
  // If showing detail view on mobile
  if (showDetailOnMobile && selectedSnippetId) {
    return (
      <div className="w-full h-full flex flex-col lg:hidden">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="flex items-center gap-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to List
          </Button>
        </div>
        <div className="flex-1">
          <SimplifiedSnippetDetail />
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-3 border-b">
        <h2 className="font-semibold mb-2">{getViewTitle()}</h2>
        <div className="relative">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            className="pl-8 pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-2.5"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-pulse">Loading snippets...</div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Error: {error}
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No snippets found
          </div>
        ) : (
          <ul className="divide-y">
            {filteredSnippets.map((snippet) => {
              // Get category name
              const categoryName = snippet.categoryId 
                ? categories.find(c => c.id === snippet.categoryId)?.name 
                : null;
              
              // Format date (client-side only)
              const updatedAt = formattedDates[snippet.id] || new Date(snippet.updatedAt).toLocaleDateString();
              
              return (
                <li key={snippet.id}>
                  <Button
                    variant={selectedSnippetId === snippet.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start p-3 h-auto rounded-none"
                    onClick={() => handleSnippetSelect(snippet.id)}
                  >
                    <div className="text-left w-full">
                      <div className="font-medium truncate">{snippet.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <span className="capitalize">{snippet.language}</span>
                        {categoryName && (
                          <>
                            <span>•</span>
                            <span>{categoryName}</span>
                          </>
                        )}
                        <span>•</span>
                        <span suppressHydrationWarning>{updatedAt}</span>
                      </div>
                      {snippet.description && (
                        <div className="text-sm mt-1 text-muted-foreground line-clamp-2">
                          {snippet.description}
                        </div>
                      )}
                      {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {snippet.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {snippet.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{snippet.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t text-xs text-muted-foreground">
        {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}