import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';
import { Category, QueryCategoryParams } from '../types/category';

export function useCategories(params?: QueryCategoryParams) {
  const query = useQuery({
    queryKey: ['categories-list', params],
    queryFn: () => categoriesApi.getCategories({ limit: 500, ...params }),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const rawCategories: Category[] = query.data?.data || [];
  
  // Filter out any soft-deleted categories
  const allCategories = rawCategories.filter((cat) => !cat.isDeleted && !cat.deletedAt);

  // Derived Root Parent Categories (parentId is null or 'null' or undefined)
  const rootCategories = allCategories.filter((cat) => {
    if (params?.status && cat.status === false) return false;
    const pId = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
    return !pId || pId === 'null' || pId === 'undefined';
  });

  // Helper function to get sub-categories for a parent ID
  const getSubCategories = (parentCatId: string): Category[] => {
    return allCategories.filter((cat) => {
      if (params?.status && cat.status === false) return false;
      const pId = typeof cat.parentId === 'object' && cat.parentId ? (cat.parentId as any)._id : cat.parentId;
      return String(pId) === String(parentCatId);
    });
  };

  return {
    ...query,
    allCategories,
    rootCategories,
    getSubCategories,
  };
}

export default useCategories;
