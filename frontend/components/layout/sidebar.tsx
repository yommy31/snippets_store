"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { getTagColor } from "@/lib/utils";
import { logger } from "@/lib/logger";
import {
  PlusIcon,
  FolderIcon,
  TagIcon,
  StarIcon,
  TrashIcon,
  CodeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MoreVertical,
  PencilIcon,
  Trash2Icon,
  MoveIcon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Category, ViewType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  
  // 创建新的代码片段
  const handleNewSnippet = () => {
    console.log("触发新建代码片段，当前视图:", currentView, "当前视图ID:", currentViewId);
    
    // 清除选中的片段并设置编辑器模式为创建
    setSelectedSnippetId(undefined);
    setEditorMode('create');
    
    // 保持当前视图不变，这样就会使用当前分类
    // 如果当前已经在分类视图，则不改变视图
    if (currentView !== 'category') {
      // 只有当不在分类视图时，才将视图切换为全部，分类ID将在表单中被设为空
      console.log("不在分类视图，切换到'all'视图");
      setCurrentView('all');
    } else {
      console.log("当前在分类视图，保持不变，使用分类ID:", currentViewId);
    }
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
        sidebarExpanded ? 'w-72' : 'w-16'
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
                className="flex items-center justify-between px-2 py-1"
              >
                <div
                  className="flex items-center cursor-pointer"
                  onClick={toggleCategories}
                >
                  {categoriesExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 mr-1" />
                  )}
                  <h2 className="font-semibold text-sm">Categories</h2>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => {
                      // 创建新分类
                      const store = useAppStore.getState();
                      const newCategoryName = "New Category";
                      
                      // 先创建分类
                      store.createCategory(newCategoryName)
                        .then(() => {
                          // 创建完成后，重新获取分类列表
                          return store.fetchCategories();
                        })
                        .then(() => {
                          // 找到新创建的分类
                          const categories = store.categories;
                          const newCategory = categories.find(c => c.name === newCategoryName && !c.parentId);
                          if (newCategory) {
                            // 设置当前分类
                            store.setCurrentView('category', newCategory.id);
                            
                            // 触发重命名模式
                            setTimeout(() => {
                              // 这里需要一个全局状态来标记哪个分类需要重命名
                              // 由于我们没有这样的状态，这里只能设置当前分类
                              store.setCurrentView('category', newCategory.id);
                            }, 100);
                          }
                        });
                    }}>
                      <FolderIcon className="mr-2 h-4 w-4" />
                      <span>Add Category</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {categoriesExpanded && (
                <ul className="space-y-1 mt-1">
                  {/* 只显示根分类 */}
                  {getRootCategories(categories).map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      categories={categories}
                      currentView={currentView}
                      currentViewId={currentViewId}
                      setCurrentView={setCurrentView}
                    />
                  ))}
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
                  {tags.map((tag) => {
                    const tagColor = getTagColor(tag.name);
                    return (
                      <li key={tag.id}>
                        <Button
                          variant={currentView === 'tag' && currentViewId === tag.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start pl-4 text-sm"
                          onClick={() => setCurrentView('tag', tag.id)}
                        >
                          <div className={`h-3 w-3 rounded-full mr-2 flex-shrink-0 ${tagColor.bg}`}></div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`text-sm truncate flex-grow mr-2 ${currentView === 'tag' && currentViewId === tag.id ? '' : tagColor.text}`}>
                                  {tag.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{tag.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{tag.snippetCount}</span>
                        </Button>
                      </li>
                    );
                  })}
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

// 递归渲染分类项
interface CategoryItemProps {
  category: Category;
  categories: Category[];
  currentView: ViewType;
  currentViewId?: string;
  setCurrentView: (view: ViewType, id?: string) => void;
  level?: number;
}

function CategoryItem({
  category,
  categories,
  currentView,
  currentViewId,
  setCurrentView,
  level = 0
}: CategoryItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState(`New Sub-Category`);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 获取子分类 - 只获取直接子分类
  const childCategories = categories.filter(c => c.parentId === category.id);
  const hasChildren = childCategories.length > 0;
  
  // 当重命名模式激活时，自动聚焦输入框
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);
  
  // 当添加子分类模式激活时，自动聚焦输入框
  useEffect(() => {
    if (isAddingSubCategory && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isAddingSubCategory]);
  
  // 处理点击展开/折叠
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  // 处理点击分类
  const handleCategoryClick = () => {
    setCurrentView('category', category.id);
  };
  
  // 处理重命名确认
  const handleRenameConfirm = () => {
    if (newCategoryName && newCategoryName !== category.name) {
      useAppStore.getState().updateCategory(
        category.id,
        newCategoryName,
        category.description,
        category.parentId
      );
    }
    setIsRenaming(false);
  };
  
  // 处理添加子分类确认
  const handleAddSubCategoryConfirm = () => {
    if (newSubCategoryName) {
      useAppStore.getState().createCategory(
        newSubCategoryName,
        undefined,
        category.id
      );
    }
    setIsAddingSubCategory(false);
    setNewSubCategoryName(`New Sub-Category`);
  };
  
  // 处理移动确认
  const handleMoveConfirm = () => {
    useAppStore.getState().updateCategory(
      category.id,
      category.name,
      category.description,
      selectedTargetId
    );
    setIsMoving(false);
    setSelectedTargetId(undefined);
  };
  
  // 处理删除确认
  const handleDeleteConfirm = () => {
    useAppStore.getState().deleteCategory(category.id);
  };
  
  // 获取可移动的目标分类（排除自身及其子孙）
  const getValidMoveTargets = () => {
    return categories.filter(c =>
      c.id !== category.id &&
      !isDescendantOf(c, category.id, categories)
    );
  };
  
  // 处理添加代码片段按钮
  const handleAddSnippet = () => {
    logger.debug("从分类添加代码片段", { categoryId: category.id });
    
    // 使用一个函数来处理状态更新，确保顺序正确
    const store = useAppStore.getState();
    
    // 先设置当前视图
    store.setCurrentView('category', category.id);
    
    // 使用批量更新减少渲染次数
    store.startCreateSnippet();
  };
  
  return (
    <li>
      <div
        className={`flex items-center justify-between group ${
          currentView === 'category' && currentViewId === category.id ? 'bg-secondary' : 'hover:bg-secondary/50'
        } rounded-md transition-colors`}
      >
        {isRenaming ? (
          <div
            className="flex items-center flex-1 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 固定宽度的缩进 */}
            <div style={{ width: `${level * 12 + 16}px` }}></div>
            
            {/* 固定宽度的展开/折叠图标区域 */}
            <div className="w-5 mr-1"></div>
            
            <Input
              ref={inputRef}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameConfirm();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              onBlur={handleRenameConfirm}
              className="h-7 py-0 text-sm"
            />
          </div>
        ) : (
          <div
            className="flex items-center flex-1 py-1 cursor-pointer"
            onClick={handleCategoryClick}
          >
            {/* 固定宽度的缩进 */}
            <div style={{ width: `${level * 12 + 16}px` }}></div>
            
            {/* 固定宽度的展开/折叠图标区域 */}
            <div className="w-5 flex justify-center mr-1">
              {hasChildren ? (
                <span
                  className="cursor-pointer hover:bg-secondary/70 rounded-sm"
                  onClick={toggleExpand}
                >
                  {expanded ? (
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  )}
                </span>
              ) : (
                <span className="w-3.5">{/* 占位，保持对齐 */}</span>
              )}
            </div>
            
            <FolderIcon className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm truncate flex-grow mr-2">{category.name}</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{category.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground flex-shrink-0">{category.snippetCount}</span>
          </div>
        )}
        
        {!isRenaming && (
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={handleAddSnippet}>
                  <CodeIcon className="mr-2 h-4 w-4" />
                  <span>Add Snippet</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setNewSubCategoryName(`New Sub-Category`);
                  setIsAddingSubCategory(true);
                }}>
                  <FolderIcon className="mr-2 h-4 w-4" />
                  <span>Add Sub-Category</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  setNewCategoryName(category.name);
                  setIsRenaming(true);
                }}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <MoveIcon className="mr-2 h-4 w-4" />
                    <span>Move to</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                      <DropdownMenuItem
                        onClick={() => {
                          useAppStore.getState().updateCategory(
                            category.id,
                            category.name,
                            category.description,
                            undefined
                          );
                        }}
                      >
                        <span>Root</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <RenderCategoryTree
                        categories={categories}
                        currentCategoryId={category.id}
                        onSelect={(targetId) => {
                          useAppStore.getState().updateCategory(
                            category.id,
                            category.name,
                            category.description,
                            targetId
                          );
                        }}
                        excludeDescendants={true}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${category.name}" and all its sub-categories?`)) {
                      handleDeleteConfirm();
                    }
                  }}
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* 添加子分类对话框 */}
      {isAddingSubCategory && (
        <div className="flex items-center py-1">
          {/* 固定宽度的缩进 - 增加一级 */}
          <div style={{ width: `${(level+1) * 12 + 16}px` }}></div>
          
          {/* 固定宽度的展开/折叠图标区域 */}
          <div className="w-5 mr-1"></div>
          
          <Input
            ref={inputRef}
            value={newSubCategoryName}
            onChange={(e) => setNewSubCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubCategoryConfirm();
              if (e.key === 'Escape') setIsAddingSubCategory(false);
            }}
            onBlur={handleAddSubCategoryConfirm}
            className="h-7 py-0 text-sm"
          />
        </div>
      )}
      
      {/* 子分类列表 */}
      {hasChildren && expanded && (
        <ul className="space-y-1">
          {childCategories.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              categories={categories}
              currentView={currentView}
              currentViewId={currentViewId}
              setCurrentView={setCurrentView}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// 辅助函数：检查一个分类是否是另一个分类的后代
function isDescendantOf(category: Category, ancestorId: string, allCategories: Category[]): boolean {
  if (category.parentId === ancestorId) return true;
  if (!category.parentId) return false;
  
  const parent = allCategories.find(c => c.id === category.parentId);
  if (!parent) return false;
  
  return isDescendantOf(parent, ancestorId, allCategories);
}

// 辅助函数：获取根分类（没有父分类的分类）
function getRootCategories(categories: Category[]): Category[] {
  return categories.filter(c => !c.parentId);
}

// 辅助函数：递归渲染目录树，用于移动分类和选择分类
interface RenderCategoryTreeProps {
  categories: Category[];
  currentCategoryId?: string; // 当前分类ID，用于排除自己及子分类
  onSelect: (categoryId: string) => void;
  excludeDescendants?: boolean; // 是否排除后代
}

function RenderCategoryTree({
  categories,
  currentCategoryId,
  onSelect,
  excludeDescendants = false
}: RenderCategoryTreeProps) {
  // 获取根分类
  const rootCategories = categories.filter(c => !c.parentId);
  
  // 渲染分类及其子分类
  const renderCategory = (category: Category, level: number = 0) => {
    // 如果需要排除自身及其后代，则跳过
    if (excludeDescendants && 
        currentCategoryId && 
        (category.id === currentCategoryId || isDescendantOf(category, currentCategoryId, categories))) {
      return null;
    }

    // 获取子分类
    const childCategories = categories.filter(c => c.parentId === category.id);
    
    return (
      <div key={category.id}>
        <DropdownMenuItem onClick={() => onSelect(category.id)}>
          <div className="flex items-center truncate">
            <span className="truncate">
              {level > 0 && (
                <span className="text-muted-foreground mr-1">
                  {Array(level).fill('— ').join('')}
                </span>
              )}
              {category.name}
            </span>
          </div>
        </DropdownMenuItem>
        
        {/* 递归渲染子分类 */}
        {childCategories.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };
  
  return <>{rootCategories.map(category => renderCategory(category))}</>;
}