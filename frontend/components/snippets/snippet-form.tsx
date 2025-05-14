"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LANGUAGE_OPTIONS, LanguageOption } from '@/types';
import dynamic from 'next/dynamic';
import { getLanguageExtension, getThemeBasedOnMode } from '@/lib/codemirror';
import { useTheme } from 'next-themes';

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

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
    error
  } = useAppStore();
  
  const selectedSnippet = snippets.find((s) => s.id === selectedSnippetId);
  const isEditMode = editorMode === 'edit';
  const isCreateMode = editorMode === 'create';
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<LanguageOption>('javascript');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get theme from next-themes
  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
  
  // 获取当前视图信息
  const { currentView, currentViewId } = useAppStore();
  
  // Initialize form with selected snippet data
  useEffect(() => {
    if (isEditMode && selectedSnippet) {
      setTitle(selectedSnippet.title);
      setDescription(selectedSnippet.description || '');
      setCode(selectedSnippet.code);
      setLanguage(selectedSnippet.language as LanguageOption);
      setCategoryId(selectedSnippet.categoryId);
      setSelectedTags(selectedSnippet.tags);
    } else if (isCreateMode) {
      // Default values for new snippet
      setTitle('');
      setDescription('');
      setCode('');
      setLanguage('javascript');
      
      // 如果当前视图是分类视图，则预设分类ID
      if (currentView === 'category' && currentViewId) {
        setCategoryId(currentViewId);
      } else {
        setCategoryId(undefined);
      }
      
      setSelectedTags([]);
    }
  }, [isEditMode, isCreateMode, selectedSnippet, currentView, currentViewId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!code.trim()) {
      toast.error('Code is required');
      return;
    }
    
    // 创建所有新标签
    const createTagPromises = selectedTags.map(async (tag) => {
      try {
        // 只有当标签不存在于全局标签列表中时才创建
        if (!tags.some(t => t.name.toLowerCase() === tag.toLowerCase())) {
          await createTag(tag);
        }
      } catch (error) {
        console.error(`Error creating tag ${tag}:`, error);
      }
    });
    
    // 等待所有标签创建完成
    await Promise.all(createTagPromises);
    
    const snippetData = {
      title: title.trim(),
      description: description.trim() || undefined,
      code,
      language,
      categoryId: categoryId || undefined,
      tags: selectedTags,
    };
    
    try {
      if (isEditMode && selectedSnippet) {
        await updateSnippet(selectedSnippet.id, snippetData);
      } else {
        await createSnippet(snippetData);
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setEditorMode('view');
  };
  
  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // 阻止输入框默认行为
      addTag();
    }
  };
  
  // Add tag from input (只在表单内部添加，不立即创建)
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    
    if (!tag) return;
    
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    
    setTagInput('');
  };
  
  // Remove tag
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };
  
  // Show loading state during form submission
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
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter snippet description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1">
                Language <span className="text-red-500">*</span>
              </label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value as LanguageOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
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
                Category
              </label>
              <Select 
                value={categoryId || "none"} 
                onValueChange={(value) => setCategoryId(value === "none" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <div 
                  key={tag} 
                  className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  <span>{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    &times;
                  </button>
                </div>
              ))}
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
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md overflow-hidden">
              {typeof window !== 'undefined' && (
                <CodeMirror
                  value={code}
                  onChange={setCode}
                  theme={getThemeBasedOnMode(isDarkMode)}
                  extensions={[getLanguageExtension(language)]}
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
            <Button type="submit" onClick={handleSubmit}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}