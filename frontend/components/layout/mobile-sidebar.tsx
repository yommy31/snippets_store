"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  FolderIcon, 
  TagIcon, 
  StarIcon, 
  TrashIcon,
  CodeIcon,
  XIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    categories,
    tags,
    currentView,
    currentViewId,
    setCurrentView,
    setEditorMode,
    setSelectedSnippetId
  } = useAppStore();
  
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  
  // Create a new snippet
  const handleNewSnippet = () => {
    // Clear selected snippet and set editor mode to create
    setSelectedSnippetId(undefined);
    setEditorMode('create');
    // Switch to all snippets view
    setCurrentView('all');
    // Close the sidebar
    onClose();
  };
  
  // Handle navigation
  const handleNavigation = (view: 'all' | 'favorites' | 'recycleBin', id?: string) => {
    setCurrentView(view, id);
    onClose();
  };
  
  // Handle category selection
  const handleCategorySelect = (id: string) => {
    setCurrentView('category', id);
    onClose();
  };
  
  // Handle tag selection
  const handleTagSelect = (id: string) => {
    setCurrentView('tag', id);
    onClose();
  };
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-sidebar')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="mobile-sidebar fixed left-0 top-0 h-full w-64 bg-background border-r shadow-lg p-2 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          className="w-full justify-start mb-4" 
          onClick={handleNewSnippet}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {/* All Snippets */}
            <li>
              <Button
                variant={currentView === 'all' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavigation('all')}
              >
                <CodeIcon className="h-4 w-4 mr-2" />
                All Snippets
              </Button>
            </li>
            
            {/* Favorites */}
            <li>
              <Button
                variant={currentView === 'favorites' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavigation('favorites')}
              >
                <StarIcon className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </li>
            
            {/* Recycle Bin */}
            <li>
              <Button
                variant={currentView === 'recycleBin' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavigation('recycleBin')}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Recycle Bin
              </Button>
            </li>
          </ul>
          
          <Separator className="my-4" />
          
          {/* Categories Section */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between px-2 py-1 cursor-pointer"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            >
              <h2 className="font-semibold text-sm">Categories</h2>
              <span>{categoriesExpanded ? '−' : '+'}</span>
            </div>
            
            {categoriesExpanded && (
              <ul className="space-y-1 mt-1">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Button
                      variant={currentView === 'category' && currentViewId === category.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start pl-4 text-sm"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  </li>
                ))}
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-4 text-sm text-muted-foreground"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </li>
              </ul>
            )}
          </div>
          
          {/* Tags Section */}
          <div>
            <div 
              className="flex items-center justify-between px-2 py-1 cursor-pointer"
              onClick={() => setTagsExpanded(!tagsExpanded)}
            >
              <h2 className="font-semibold text-sm">Tags</h2>
              <span>{tagsExpanded ? '−' : '+'}</span>
            </div>
            
            {tagsExpanded && (
              <ul className="space-y-1 mt-1">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <Button
                      variant={currentView === 'tag' && currentViewId === tag.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start pl-4 text-sm"
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      <TagIcon className="h-4 w-4 mr-2" />
                      {tag.name}
                    </Button>
                  </li>
                ))}
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-4 text-sm text-muted-foreground"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </li>
              </ul>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}