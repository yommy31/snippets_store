import { useState, useEffect, useReducer, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Snippet, LanguageOption } from '@/types';
import { logger } from '@/lib/logger';

// 表单状态类型
interface FormState {
  title: string;
  description: string;
  code: string;
  language: LanguageOption | string;
  categoryId: string;
  tagInput: string;
  selectedTags: string[];
}

// 表单动作类型
type FormAction = 
  | { type: 'RESET' }
  | { type: 'LOAD_SNIPPET', payload: Snippet }
  | { type: 'UPDATE_FIELD', field: keyof FormState, value: any }
  | { type: 'ADD_TAG', tag: string }
  | { type: 'REMOVE_TAG', tag: string }
  | { type: 'SET_DEFAULT_CATEGORY', categoryId: string };

// 初始表单状态
const initialFormState: FormState = {
  title: '',
  description: '',
  code: '',
  language: '',
  categoryId: '',
  tagInput: '',
  selectedTags: []
};

// 表单reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'RESET':
      return initialFormState;
      
    case 'LOAD_SNIPPET':
      return {
        title: action.payload.title,
        description: action.payload.description || '',
        code: action.payload.code,
        language: action.payload.language,
        categoryId: action.payload.categoryId || '',
        tagInput: '',
        selectedTags: action.payload.tags
      };
      
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
      
    case 'ADD_TAG':
      if (!action.tag || state.selectedTags.includes(action.tag)) {
        return state;
      }
      return {
        ...state,
        selectedTags: [...state.selectedTags, action.tag],
        tagInput: ''
      };
      
    case 'REMOVE_TAG':
      return {
        ...state,
        selectedTags: state.selectedTags.filter(t => t !== action.tag)
      };
      
    case 'SET_DEFAULT_CATEGORY':
      return {
        ...state,
        categoryId: action.categoryId
      };
      
    default:
      return state;
  }
};

export const useSnippetForm = (snippetId?: string) => {
  const {
    snippets,
    categories,
    tags,
    editorMode,
    currentView,
    currentViewId,
    createSnippet,
    updateSnippet,
    createTag,
    setEditorMode
  } = useAppStore();
  
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const selectedSnippet = snippetId ? snippets.find(s => s.id === snippetId) : undefined;
  const isEditMode = editorMode === 'edit';
  const isCreateMode = editorMode === 'create';
  const hasCategories = categories.length > 0;
  
  // 获取默认分类ID
  const getDefaultCategoryId = useCallback(() => {
    // 优先使用当前视图的分类ID
    if (currentView === 'category' && currentViewId) {
      logger.debug("使用当前视图分类ID", { id: currentViewId });
      return currentViewId;
    }
    
    // 其次使用第一个可用分类
    if (hasCategories) {
      logger.debug("使用第一个分类", { id: categories[0].id });
      return categories[0].id;
    }
    
    // 如果没有分类，返回空字符串
    logger.debug("没有可用分类");
    return '';
  }, [currentView, currentViewId, hasCategories, categories]);
  
  // 初始化表单
  useEffect(() => {
    if (isEditMode && selectedSnippet) {
      logger.debug('加载现有片段数据', { id: selectedSnippet.id });
      dispatch({ type: 'LOAD_SNIPPET', payload: selectedSnippet });
    } else if (isCreateMode) {
      logger.debug('创建模式，设置默认值');
      dispatch({ type: 'RESET' });
      
      // 设置默认分类
      const defaultCategoryId = getDefaultCategoryId();
      if (defaultCategoryId) {
        dispatch({ type: 'SET_DEFAULT_CATEGORY', categoryId: defaultCategoryId });
      }
    }
  }, [isEditMode, isCreateMode, selectedSnippet, getDefaultCategoryId]);
  
  // 更新表单字段
  const updateField = useCallback((field: keyof FormState, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);
  
  // 添加标签
  const addTag = useCallback(() => {
    const tag = formState.tagInput.trim().toLowerCase();
    if (tag) {
      dispatch({ type: 'ADD_TAG', tag });
    }
  }, [formState.tagInput]);
  
  // 移除标签
  const removeTag = useCallback((tag: string) => {
    dispatch({ type: 'REMOVE_TAG', tag });
  }, []);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // 表单验证
    if (!formState.title.trim()) {
      setFormError('Title is required');
      return;
    }
    
    if (!formState.code.trim()) {
      setFormError('Code is required');
      return;
    }
    
    if (!formState.language) {
      setFormError('Language is required');
      return;
    }
    
    if (!formState.categoryId && hasCategories) {
      setFormError('Category is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 处理标签
      await Promise.all(
        formState.selectedTags
          .filter(tag => !tags.some(t => t.name.toLowerCase() === tag.toLowerCase()))
          .map(tag => createTag(tag))
      );
      
      // 提交代码片段数据
      const snippetData = {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        code: formState.code,
        language: formState.language as LanguageOption,
        categoryId: formState.categoryId || undefined,
        tags: formState.selectedTags,
      };
      
      if (isEditMode && snippetId) {
        await updateSnippet(snippetId, snippetData);
      } else {
        await createSnippet(snippetData);
      }
      
      // 重置表单
      dispatch({ type: 'RESET' });
    } catch (error) {
      logger.error('保存代码片段出错', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save snippet');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    setEditorMode('view');
  };
  
  return {
    formState,
    isSubmitting,
    formError,
    isEditMode,
    isCreateMode,
    updateField,
    addTag,
    removeTag,
    handleSubmit,
    handleCancel
  };
};