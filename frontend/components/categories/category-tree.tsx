import { Category } from "@/types";
import { memo } from "react";
import { logger } from "@/lib/logger";

interface CategoryTreeProps {
  categories: Category[];
  currentCategoryId?: string;
  onSelect: (categoryId: string) => void;
  excludeDescendants?: boolean;
}

// 辅助函数：检查一个分类是否是另一个分类的后代
function isDescendantOf(category: Category, ancestorId: string, allCategories: Category[]): boolean {
  if (category.parentId === ancestorId) return true;
  if (!category.parentId) return false;
  
  const parent = allCategories.find(c => c.id === category.parentId);
  if (!parent) return false;
  
  return isDescendantOf(parent, ancestorId, allCategories);
}

// 使用memo优化递归组件性能
const CategoryItem = memo(({ 
  category, 
  level, 
  onSelect,
  isExcluded
}: {
  category: Category;
  level: number;
  onSelect: (id: string) => void;
  isExcluded: boolean;
}) => {
  if (isExcluded) return null;
  
  return (
    <div className="dropdown-menu-item" onClick={() => onSelect(category.id)}>
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
    </div>
  );
});

export const CategoryTree = ({
  categories,
  currentCategoryId,
  onSelect,
  excludeDescendants = false
}: CategoryTreeProps) => {
  // 获取根分类
  const rootCategories = categories.filter(c => !c.parentId);
  
  // 渲染分类及其子分类
  const renderCategory = (category: Category, level: number = 0) => {
    // 检查是否应该排除
    const isExcluded: boolean = !!(excludeDescendants &&
      currentCategoryId &&
      (category.id === currentCategoryId || isDescendantOf(category, currentCategoryId, categories)));
    
    // 获取子分类
    const childCategories = categories.filter(c => c.parentId === category.id);
    
    return (
      <div key={category.id}>
        <CategoryItem 
          category={category}
          level={level}
          onSelect={onSelect}
          isExcluded={isExcluded}
        />
        
        {/* 递归渲染子分类 */}
        {!isExcluded && childCategories.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };
  
  return <>{rootCategories.map(category => renderCategory(category))}</>;
};