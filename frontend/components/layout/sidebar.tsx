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
  ChevronRightIcon,
  ChevronDownIcon
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const {
    categories,
    tags,
    currentView,
    currentViewId,
    setCurrentView,
    sidebarExpanded,
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
  };
  
  // Toggle categories section
  const toggleCategories = () => {
    setCategoriesExpanded(!categoriesExpanded);
  };
  
  // Toggle tags section
  const toggleTags = () => {
    setTagsExpanded(!tagsExpanded);
  };
  
  return (
    <aside 
      className={`border-r bg-background h-full flex flex-col transition-all duration-300 ${
        sidebarExpanded ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-2">
        {sidebarExpanded ? (
          <Button 
            className="w-full justify-start" 
            onClick={handleNewSnippet}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Snippet
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="w-full justify-center" 
                  onClick={handleNewSnippet}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Snippet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {/* All Snippets */}
          {sidebarExpanded ? (
            <li>
              <Button
                variant={currentView === 'all' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('all')}
              >
                <CodeIcon className="h-4 w-4 mr-2" />
                All Snippets
              </Button>
            </li>
          ) : (
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentView === 'all' ? 'secondary' : 'ghost'}
                      className="w-full justify-center"
                      onClick={() => setCurrentView('all')}
                    >
                      <CodeIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>All Snippets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          )}
          
          {/* Favorites */}
          {sidebarExpanded ? (
            <li>
              <Button
                variant={currentView === 'favorites' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('favorites')}
              >
                <StarIcon className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </li>
          ) : (
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentView === 'favorites' ? 'secondary' : 'ghost'}
                      className="w-full justify-center"
                      onClick={() => setCurrentView('favorites')}
                    >
                      <StarIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Favorites</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          )}
          
          {/* Recycle Bin */}
          {sidebarExpanded ? (
            <li>
              <Button
                variant={currentView === 'recycleBin' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('recycleBin')}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Recycle Bin
              </Button>
            </li>
          ) : (
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentView === 'recycleBin' ? 'secondary' : 'ghost'}
                      className="w-full justify-center"
                      onClick={() => setCurrentView('recycleBin')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Recycle Bin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          )}
        </ul>
        
        <Separator className="my-4" />
        
        {/* Categories Section */}
        <div className="mb-4">
          {sidebarExpanded ? (
            <>
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer"
                onClick={toggleCategories}
              >
                <h2 className="font-semibold text-sm">Categories</h2>
                {categoriesExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </div>
              
              {categoriesExpanded && (
                <ul className="space-y-1 mt-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Button
                        variant={currentView === 'category' && currentViewId === category.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start pl-4 text-sm"
                        onClick={() => setCurrentView('category', category.id)}
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
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={toggleCategories}
                  >
                    <FolderIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Categories</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {/* Tags Section */}
        <div>
          {sidebarExpanded ? (
            <>
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer"
                onClick={toggleTags}
              >
                <h2 className="font-semibold text-sm">Tags</h2>
                {tagsExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </div>
              
              {tagsExpanded && (
                <ul className="space-y-1 mt-1">
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <Button
                        variant={currentView === 'tag' && currentViewId === tag.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start pl-4 text-sm"
                        onClick={() => setCurrentView('tag', tag.id)}
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
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={toggleTags}
                  >
                    <TagIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Tags</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </nav>
    </aside>
  );
}