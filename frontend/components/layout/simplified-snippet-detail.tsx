"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  EditIcon, 
  StarIcon, 
  TrashIcon, 
  RotateCcwIcon,
  ClipboardCopyIcon,
  CheckIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { getLanguageExtension, getThemeBasedOnMode } from '@/lib/codemirror';
import { useTheme } from 'next-themes';

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

export function SimplifiedSnippetDetail() {
  const {
    snippets,
    categories,
    tags,
    selectedSnippetId,
    editorMode,
    setEditorMode,
    toggleFavorite,
    deleteSnippet,
    restoreSnippet,
    currentView,
    isLoading,
    error
  } = useAppStore();
  
  const [copied, setCopied] = useState(false);
  // State for formatted dates (client-side only)
  const [formattedDates, setFormattedDates] = useState<{
    created?: string;
    updated?: string;
  }>({});
  
  // Get theme from next-themes
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
  
  // Get the selected snippet
  const selectedSnippet = snippets.find((s) => s.id === selectedSnippetId);
  
  // Get category name
  const categoryName = selectedSnippet?.categoryId 
    ? categories.find(c => c.id === selectedSnippet.categoryId)?.name 
    : null;
  
  // Format dates on client-side only
  useEffect(() => {
    if (selectedSnippet) {
      setFormattedDates({
        created: new Date(selectedSnippet.createdAt).toLocaleDateString(),
        updated: new Date(selectedSnippet.updatedAt).toLocaleDateString()
      });
    }
  }, [selectedSnippet]);
  
  // Handle edit button click
  const handleEdit = () => {
    setEditorMode('edit');
  };
  
  // Handle delete button click
  const handleDelete = async () => {
    if (selectedSnippet) {
      await deleteSnippet(selectedSnippet.id);
    }
  };
  
  // Handle restore button click
  const handleRestore = async () => {
    if (selectedSnippet) {
      await restoreSnippet(selectedSnippet.id);
    }
  };
  
  // Handle favorite button click
  const handleFavorite = async () => {
    if (selectedSnippet) {
      await toggleFavorite(selectedSnippet.id);
    }
  };
  
  // Handle copy button click
  const handleCopy = () => {
    if (selectedSnippet) {
      navigator.clipboard.writeText(selectedSnippet.code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="text-center">
          <div className="animate-pulse">Loading snippet...</div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // If no snippet is selected
  if (!selectedSnippet) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No snippet selected</h2>
          <p className="text-muted-foreground">
            {currentView === 'recycleBin' 
              ? 'Select a snippet from the recycle bin to view it'
              : 'Select a snippet from the list or create a new one'
            }
          </p>
        </div>
      </div>
    );
  }
  
  // If in edit or create mode, show a message
  if (editorMode === 'edit' || editorMode === 'create') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Editing Mode</h2>
          <p className="text-muted-foreground">
            Please use the desktop view for editing snippets
          </p>
          <Button 
            className="mt-4"
            onClick={() => setEditorMode('view')}
          >
            Back to View Mode
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 h-full flex flex-col bg-background">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{selectedSnippet.title}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={selectedSnippet.isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavorite}
          >
            <StarIcon
              className={`h-5 w-5 ${selectedSnippet.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
          </Button>
          
          {selectedSnippet.isDeleted ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Restore snippet"
              onClick={handleRestore}
            >
              <RotateCcwIcon className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit snippet"
                onClick={handleEdit}
              >
                <EditIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete snippet"
                onClick={handleDelete}
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Language</h3>
            <div className="text-sm capitalize">{selectedSnippet.language}</div>
          </div>
          
          {categoryName && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Category</h3>
              <div className="text-sm">{categoryName}</div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold mb-1">Created</h3>
            <div className="text-sm" suppressHydrationWarning>
              {formattedDates.created || "Loading..."}
            </div>
          </div>
        </div>
        
        {selectedSnippet.description && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">{selectedSnippet.description}</p>
          </div>
        )}
        
        {selectedSnippet.tags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-1">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {selectedSnippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Code</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopyIcon className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
          <div className="border rounded-md overflow-hidden">
            {typeof window !== 'undefined' && (
              <CodeMirror
                value={selectedSnippet.code}
                editable={false}
                theme={getThemeBasedOnMode(isDarkMode)}
                extensions={[getLanguageExtension(selectedSnippet.language)]}
                className="min-h-[200px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}