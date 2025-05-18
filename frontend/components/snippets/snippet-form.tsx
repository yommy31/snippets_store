"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { getTagColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { LANGUAGE_OPTIONS, LanguageOption, Category } from '@/types';
import dynamic from 'next/dynamic';
import { getLanguageExtension, getThemeBasedOnMode } from '@/lib/codemirror';
import { useTheme } from 'next-themes';

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

// 辅助函数：检查一个分类是否是另一个分类的后代
function isDescendantOf(category: Category, ancestorId: string, allCategories: Category[]): boolean {
  if (category.parentId === ancestorId) return true;
  if (!category.parentId) return false;
  
  const parent = allCategories.find(c => c.id === category.parentId);
  if (!parent) return false;
  
  return isDescendantOf(parent, ancestorId, allCategories);
}

// 辅助函数：递归生成分类选择列表
const renderAllCategoryOptions = (categories: Category[]): React.ReactNode[] => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }
  
  // 构建层次结构
  const result: React.ReactNode[] = [];
  
  // 递归添加分类及其子分类
  const addCategoryWithChildren = (category: Category, level: number = 0) => {
    // 添加当前分类
    result.push(
      <SelectItem key={category.id} value={category.id}>
        {level > 0 && (
          <span className="text-muted-foreground">
            {Array(level).fill('— ').join('')}
          </span>
        )}
        {category.name}
      </SelectItem>
    );
    
    // 递归添加所有子分类
    categories
      .filter(c => c.parentId === category.id)
      .forEach(child => addCategoryWithChildren(child, level + 1));
  };
  
  // 添加所有根分类及其子分类
  categories
    .filter(c => !c.parentId)
    .forEach(category => addCategoryWithChildren(category));
  
  return result;
};

export function SnippetForm() {
  const {
    snippets,
    categories,
    tags,
    selectedSnippetId,
    editorMode,
    setEditorMode,
    createSnippet,
    updateSnippet,
    createTag,
    isLoading,
    error,
    currentView,
    currentViewId
  } = useAppStore();
  
  // 添加初始化标记和上一次的snippet ID引用，用于追踪选择状态
  const [initialized, setInitialized] = useState(false);
  const previousSnippetIdRef = useRef<string | undefined>(undefined);
  
  // 强制刷新计数器 - 用于完全重置组件状态
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  console.log("当前视图信息:", { currentView, currentViewId });
  console.log("当前编辑模式:", editorMode, "选中片段ID:", selectedSnippetId, "刷新次数:", refreshCounter);
  
  const selectedSnippet = snippets.find((s) => s.id === selectedSnippetId);
  console.log("选中片段数据:", selectedSnippet ? 
    { id: selectedSnippet.id, title: selectedSnippet.title, language: selectedSnippet.language } : 
    "无选中片段"
  );
  
  const isEditMode = editorMode === 'edit';
  const isCreateMode = editorMode === 'create';
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<LanguageOption | string>(''); // 允许字符串类型以支持特殊值
  const [categoryId, setCategoryId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // 确保有分类可供选择
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  
  // 获取默认分类ID
  const getDefaultCategoryId = useCallback((): string => {
    // 优先使用当前视图的分类ID（如果当前视图是分类视图）
    if (currentView === 'category' && currentViewId) {
      console.log("使用当前视图分类ID:", currentViewId);
      return currentViewId;
    }
    // 其次使用第一个可用分类
    if (hasCategories) {
      console.log("使用第一个分类:", categories[0].id);
      return categories[0].id;
    }
    // 如果没有分类，返回特殊标识
    console.log("没有可用分类");
    return '_none_';
  }, [categories, currentView, currentViewId, hasCategories]);
  
  // 设置分类ID，确保不为空
  const handleSetCategoryId = useCallback((id: string) => {
    // 如果id为空或特殊标识且有分类，则使用默认分类
    if ((id === '_none_' || !id) && hasCategories) {
      const defaultId = getDefaultCategoryId();
      console.log('无效分类ID，使用默认:', defaultId);
      setCategoryId(defaultId);
    } else {
      setCategoryId(id);
    }
  }, [getDefaultCategoryId, hasCategories]);
  
  // 主题设置
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
  
  // 初始化表单状态
  useEffect(() => {
    // 检查是否在相同的snippet上反复初始化
    if (selectedSnippetId && previousSnippetIdRef.current === selectedSnippetId && initialized && refreshCounter === 0) {
      console.log("跳过重复初始化，当前已有选中的snippet:", selectedSnippetId);
      return;
    }
    
    // 更新引用
    previousSnippetIdRef.current = selectedSnippetId;
    
    console.log("表单初始化触发", {
      isEditMode, 
      isCreateMode, 
      selectedSnippetId,
      selectedSnippetLanguage: selectedSnippet?.language,
      initialized,
      refreshCounter
    });
    
    if (isEditMode && selectedSnippet) {
      console.log('编辑模式，加载现有片段数据:', selectedSnippet);
      setTitle(selectedSnippet.title);
      setDescription(selectedSnippet.description || '');
      setCode(selectedSnippet.code);
      
      // 设置语言为原有值 - 确保在刷新时始终执行
      if (selectedSnippet.language) {
        console.log('设置语言 (编辑模式):', selectedSnippet.language);
        // 使用setTimeout确保在DOM更新后设置值
        setTimeout(() => {
          setLanguage(selectedSnippet.language);
          console.log('语言已设置为:', selectedSnippet.language);
        }, 10);
      } else {
        // 如果没有语言，设置为空
        console.log('没有找到语言 (编辑模式)，设置为空');
        setLanguage('');
      }
      
      // 设置分类ID（确保在编辑模式下保留原有分类）
      if (selectedSnippet.categoryId) {
        console.log('使用片段的分类ID:', selectedSnippet.categoryId);
        setCategoryId(selectedSnippet.categoryId);
      } else if (hasCategories) {
        // 如果片段没有分类，使用默认分类
        const defaultId = getDefaultCategoryId();
        console.log('片段没有分类ID，使用默认:', defaultId);
        setCategoryId(defaultId);
      }
      
      setSelectedTags(selectedSnippet.tags);
    } else if (isCreateMode) {
      console.log('创建模式，设置默认值');
      setTitle('');
      setDescription('');
      setCode('');
      
      // 创建模式下，语言初始为空
      setLanguage('');
      
      // 在创建模式下，优先使用当前分类视图的ID
      if (currentView === 'category' && currentViewId) {
        console.log('从当前视图设置分类ID:', currentViewId);
        setCategoryId(currentViewId);
      } else if (hasCategories) {
        // 不在分类视图下，使用特殊标识
        console.log('不在分类视图下，暂不设置默认分类');
        setCategoryId('_none_');
      }
      
      setSelectedTags([]);
    }
    
    // 重置刷新计数器
    if (refreshCounter > 0) {
      setRefreshCounter(0);
    }
    
    setInitialized(true);
  }, [isEditMode, isCreateMode, selectedSnippet, hasCategories, getDefaultCategoryId, currentView, currentViewId, selectedSnippetId, initialized, refreshCounter]);
  
  // 额外添加一个监听selectedSnippetId的useEffect，确保当ID变化时重新加载
  useEffect(() => {
    console.log("选中片段ID变化:", selectedSnippetId);
    if (selectedSnippetId && selectedSnippet && isEditMode) {
      console.log("ID变化后重新加载语言:", selectedSnippet.language);
      if (selectedSnippet.language) {
        setLanguage(selectedSnippet.language);
      }
    }
  }, [selectedSnippetId, selectedSnippet, isEditMode]);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('表单提交，分类ID:', categoryId, '语言:', language);
    
    // 基本验证
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!code.trim()) {
      toast.error('Code is required');
      return;
    }
    
    // 确保有语言选择 - 使用类型安全的检查
    if (!language || language === '_none_' || language === '') {
      toast.error('Language is required');
      return;
    }
    
    // 确保有分类ID
    if (!categoryId || categoryId === '_none_') {
      toast.error('Category is required');
      return;
    }
    
    // 正常提交（有分类ID的情况）
    try {
      // 处理标签
      await Promise.all(
        selectedTags
          .filter(tag => !tags.some(t => t.name.toLowerCase() === tag.toLowerCase()))
          .map(tag => createTag(tag))
      );
      
      // 提交代码片段数据
      const snippetData = {
        title: title.trim(),
        description: description.trim() || undefined,
        code,
        language: language as LanguageOption, // 确保类型兼容
        categoryId,
        tags: selectedTags,
      };
      
      console.log('提交的片段数据:', snippetData);
      
      if (isEditMode && selectedSnippet) {
        await updateSnippet(selectedSnippet.id, snippetData);
      } else {
        await createSnippet(snippetData);
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    setEditorMode('view');
  };
  
  // 处理标签输入
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    
    if (!tag) return;
    
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    
    setTagInput('');
  };
  
  // 移除标签
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">Saving snippet...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 h-full flex flex-col bg-background">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {isEditMode ? 'Edit Snippet' : 'Create Snippet'}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("强制刷新组件");
            setRefreshCounter(prev => prev + 1);
          }}
        >
          RESET
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter snippet title"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1">
                Language <span className="text-red-500">*</span>
              </label>
              <Select 
                key={`language-select-${selectedSnippetId || 'new'}-${refreshCounter}`}
                value={language || '_none_'} 
                onValueChange={(value: string) => {
                  console.log('选择语言变更:', value);
                  if (value === '_none_') {
                    setLanguage('');
                  } else {
                    setLanguage(value as LanguageOption);
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Select language</SelectItem>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              {hasCategories ? (
                <Select 
                  key={`category-select-${selectedSnippetId || 'new'}-${refreshCounter}`}
                  value={categoryId || '_none_'}
                  onValueChange={(value: string) => {
                    console.log('选择分类:', value);
                    handleSetCategoryId(value);
                  }}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Select category</SelectItem>
                    {renderAllCategoryOptions(categories)}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md bg-muted text-center">
                  No categories available. Please create a category first.
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => {
                const tagColor = getTagColor(tag);
                return (
                  <div
                    key={tag}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${tagColor.bg}`}
                  >
                    <span className={tagColor.text}>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={addTag}
                placeholder="Add tags (press Enter or comma to add)"
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={addTag}
              >
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter snippet description (支持 Markdown 语法)"
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">
              支持 <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="underline">Markdown</a> 语法（如 # 标题、**加粗**、`代码`、列表等）
            </div>
          </div>
          
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md overflow-hidden">
              {typeof window !== 'undefined' && (
                <CodeMirror
                  value={code}
                  onChange={setCode}
                  theme={getThemeBasedOnMode(isDarkMode)}
                  extensions={[getLanguageExtension(language as LanguageOption)]}
                  className="min-h-[300px]"
                />
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}