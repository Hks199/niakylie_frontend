import { Category } from '../types/category';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Dynamically builds a breadcrumb trail based on target category and/or product title.
 * Automatically resolves parent-child category hierarchies.
 */
export function buildBreadcrumbTrail(
  categoryIdentifier?: string | any,
  allCategories: Category[] = [],
  productTitle?: string,
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  if (!categoryIdentifier && !productTitle) {
    trail.push({ label: 'All Products', href: '/products' });
    return trail;
  }

  // Find target category by ID, slug, object, or name match
  let targetCat: Category | undefined = undefined;

  if (typeof categoryIdentifier === 'object' && categoryIdentifier !== null) {
    targetCat = categoryIdentifier;
  } else if (typeof categoryIdentifier === 'string' && categoryIdentifier.trim()) {
    const term = categoryIdentifier.toLowerCase().trim();
    targetCat = allCategories.find((c) => {
      const cId = (c._id || (c as any).id || '').toLowerCase();
      const cSlug = (c.slug || '').toLowerCase();
      const cName = (c.name || '').toLowerCase();
      return cId === term || cSlug === term || cName === term;
    });
  }

  if (targetCat) {
    // Trace parent category hierarchy upwards
    const categoryLineage: Category[] = [];
    let curr: Category | undefined = targetCat;
    const visitedIds = new Set<string>();

    while (curr && !visitedIds.has(curr._id || (curr as any).id)) {
      const id = curr._id || (curr as any).id;
      if (id) visitedIds.add(id);
      categoryLineage.unshift(curr);

      const rawParent: any = curr.parentId;
      const parentIdVal: string | undefined =
        typeof rawParent === 'object' && rawParent !== null
          ? rawParent._id || rawParent.id
          : rawParent;

      if (parentIdVal && parentIdVal !== 'null' && parentIdVal !== 'undefined') {
        curr = allCategories.find((c) => (c._id || (c as any).id) === String(parentIdVal));
      } else {
        curr = undefined;
      }
    }

    categoryLineage.forEach((cat) => {
      trail.push({
        label: cat.name,
        href: `/category/${cat.slug || cat._id}`,
      });
    });
  } else if (typeof categoryIdentifier === 'string' && categoryIdentifier !== 'All Ethnic Couture') {
    trail.push({
      label: categoryIdentifier,
      href: `/products?category=${encodeURIComponent(categoryIdentifier)}`,
    });
  } else if (!productTitle) {
    trail.push({ label: 'All Ethnic Couture', href: '/products' });
  }

  if (productTitle) {
    trail.push({ label: productTitle, href: '#' });
  }

  return trail;
}
