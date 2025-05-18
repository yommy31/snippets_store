"use client";

import { useAppStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { getTagColor } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon, ArrowLeftIcon, LoaderIcon } from "lucide-react";
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
    editorMode,
    fetchSnippets,
    isLoading,
    error
  } = useAppStore();
  
  // State to track if detail view is shown on mobile
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  // State to store formatted dates (client-side only)
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  // State for search debouncing
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for search input focus
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
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
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch snippets when debounced search or view changes
  useEffect(() => {
    const fetchData = async () => {
      setIsSearching(true);
      
      // Prepare search parameters
      const params: any = {
        view: currentView,
        id: currentViewId
      };
      
      // Special handling for tag search with # prefix
      if (debouncedSearchQuery.startsWith('#')) {
        // Extract tag name without the # symbol
        const tagName = debouncedSearchQuery.substring(1).trim();
        if (tagName) {
          params.tag = tagName;  // Use tag parameter instead of search
        }
      } else if (debouncedSearchQuery) {
        // Normal search query
        params.search = debouncedSearchQuery;
      }
      
      await fetchSnippets(params);
      setIsSearching(false);
    };
    
    fetchData();
  }, [fetchSnippets, currentView, currentViewId, debouncedSearchQuery]);
  
  // Filter snippets based on current view and search query
  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      // Filter by view type
      if (currentView === 'favorites' && !snippet.isFavorite) return false;
      if (currentView === 'recycleBin' && !snippet.isDeleted) return false;
      if (currentView === 'category' && snippet.categoryId !== currentViewId) return false;
      if (currentView === 'tag' && !snippet.tags.includes(tags.find(t => t.id === currentViewId)?.name || '')) return false;
      if (currentView !== 'recycleBin' && snippet.isDeleted) return false;
      
      // No need for client-side search filtering - server handles it now
      // Just pass through server's filtered results
      return true;
    });
  }, [snippets, currentView, currentViewId, tags]);
  
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
    // Do not auto-select snippet if editor is in create mode
    if (editorMode === 'create') {
      return;
    }
    
    if (filteredSnippets.length > 0 && !selectedSnippetId) {
      setSelectedSnippetId(filteredSnippets[0].id);
    } else if (filteredSnippets.length === 0) {
      setSelectedSnippetId(undefined);
    } else if (selectedSnippetId && !filteredSnippets.some(s => s.id === selectedSnippetId)) {
      setSelectedSnippetId(filteredSnippets[0]?.id);
    }
  }, [filteredSnippets, selectedSnippetId, setSelectedSnippetId, editorMode]);
  
  // Highlight search text within a string
  const highlightSearchText = (text: string, query: string, maxLength = 1000) => {
    if (!query || !text) return text;
    
    // Limit text processing length for performance
    const processText = text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
    
    try {
      // Handle tag search
      const searchTerm = query.startsWith('#') ? query.substring(1) : query;
      
      // Escape regex special characters
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Use non-capturing group for performance
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      
      // More efficient method for handling highlight
      return processText.split(regex).map((part, i) => {
        // Use regex test for more efficient comparison
        if (i % 2 === 1) {
          return <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>;
        }
        return part;
      });
    } catch (e) {
      logger.error("Error highlighting search text", e);
      return processText;
    }
  };
  
  // CodePreview component for showing code snippets in search results
  const CodePreview = ({
    code,
    searchQuery,
    contextLines = 30,
    maxPreviewLength = 200
  }: {
    code: string;
    searchQuery: string;
    contextLines?: number;
    maxPreviewLength?: number;
  }) => {
    // Use useMemo to cache calculation results
    const previewContent = useMemo(() => {
      const lowerCode = code.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      const matchIndex = lowerCode.indexOf(lowerQuery);
      
      if (matchIndex === -1) return '';
      
      const startIndex = Math.max(0, matchIndex - contextLines);
      const endIndex = Math.min(code.length, matchIndex + searchQuery.length + contextLines);
      
      // Limit preview length
      let preview = code.substring(startIndex, endIndex);
      if (preview.length > maxPreviewLength) {
        preview = preview.substring(0, maxPreviewLength) + '...';
      }
      
      return preview;
    }, [code, searchQuery, contextLines, maxPreviewLength]);
    
    if (!previewContent) return null;
    
    return (
      <div className="mt-2 bg-secondary/30 p-2 rounded text-xs font-mono overflow-hidden text-ellipsis line-clamp-3 border-l-2 border-primary">
        {highlightSearchText(previewContent, searchQuery)}
      </div>
    );
  };
  
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
          <div className="flex items-center w-full rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary transition-all">
            {/* Search icon */}
            <div className="px-2">
              {isSearching ? (
                <LoaderIcon className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Context tags - always shown in category/tag view */}
            {(currentView === 'category' || currentView === 'tag') && (
              <div className="shrink-0 mx-1">
                {currentView === 'category' ? (
                  <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-xs px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300">
                    <span className="opacity-70 mr-1">in:</span>
                    <span className="font-medium">{categories.find(c => c.id === currentViewId)?.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {(() => {
                      // Use the same tag color mapping as regular tags
                      const tagName = tags.find(t => t.id === currentViewId)?.name || '';
                      const tagColor = getTagColor(tagName);
                      return (
                        <div className={`flex items-center text-xs px-2 py-0.5 rounded border ${tagColor.bg} ${tagColor.text}`}>
                          <span className="opacity-70 mr-1">#</span>
                          <span className="font-medium">{tagName}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
            
            {/* Actual input field */}
            <input
              type="text"
              className="w-full py-2 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
              placeholder="Search snippets or use #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            
            {/* Clear button */}
            {searchQuery && (
              <button 
                className="px-2 hover:text-primary transition-colors"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <XIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search status - only show when actively searching */}
        {searchQuery && (
          <div className="mt-2 text-xs text-muted-foreground">
            Search: <span className="font-medium text-foreground">{searchQuery}</span>
            {searchQuery.startsWith('#') && (
              <span className="ml-1 text-primary">searching by tag</span>
            )}
            {isSearching ? (
              <span className="ml-2">Searching...</span>
            ) : (
              <span className="ml-2">{filteredSnippets.length} results found</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading && !isSearching ? (
          <div className="p-4 text-center">
            <div className="animate-pulse">Loading snippets...</div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Error: {error}
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? `No snippets found for "${searchQuery}"` : "No snippets found"}
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
                    className="w-full justify-start p-3 h-auto rounded-none hover:bg-muted/50 transition-colors"
                    onClick={() => handleSnippetSelect(snippet.id)}
                  >
                    <div className="text-left w-full">
                      <div className="font-medium truncate">
                        {searchQuery ? highlightSearchText(snippet.title, searchQuery) : snippet.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <span className="capitalize">
                          {searchQuery ? highlightSearchText(snippet.language, searchQuery) : snippet.language}
                        </span>
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
                          {searchQuery ? highlightSearchText(snippet.description, searchQuery) : snippet.description}
                        </div>
                      )}
                      {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {snippet.tags.map((tag) => {
                            // More robust highlighting logic for tags
                            const tagText = tag.toLowerCase();
                            const searchText = searchQuery?.toLowerCase() || '';
                            const isDirectTagSearch = searchQuery?.startsWith('#');
                            const searchTagText = isDirectTagSearch ? searchText.substring(1) : searchText;
                            
                            // Highlight if tag matches search query
                            const isHighlighted = searchQuery && (
                              tagText === searchTagText || 
                              tagText.includes(searchTagText) ||
                              (isDirectTagSearch && tagText.includes(searchTagText))
                            );
                            
                            const tagColor = getTagColor(tag);
                            return (
                              <span
                                key={tag}
                                className={`px-1.5 py-0.5 rounded-md text-xs ${tagColor.bg} ${tagColor.text} ${
                                  isHighlighted ? 'ring-2 ring-primary/30 font-medium' : ''
                                }`}
                              >
                                {searchQuery ? highlightSearchText(tag, searchQuery) : tag}
                              </span>
                            );
                          })}
                          {snippet.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{snippet.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      {/* Show code preview if search query is found in code */}
                      {searchQuery && snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) && (
                        <CodePreview
                          code={snippet.code}
                          searchQuery={searchQuery}
                          contextLines={30}
                          maxPreviewLength={200}
                        />
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