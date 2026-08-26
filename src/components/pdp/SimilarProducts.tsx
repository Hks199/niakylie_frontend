import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../home/ProductCard';
import { productsApi } from '../../api/products';

interface SimilarProductsProps {
  categoryId?: string;
  currentProductId?: string;
}

export function SimilarProducts({ categoryId, currentProductId }: SimilarProductsProps) {
  const { data } = useQuery({
    queryKey: ['products', 'similar', categoryId],
    queryFn: () => productsApi.getProducts({ category: categoryId, limit: 4 }),
  });

  const products = data?.items?.filter((p) => p.id !== currentProductId && p._id !== currentProductId) || [];

  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-100">
      <h2 className="text-2xl font-extrabold text-brand-slate-dark font-display mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default SimilarProducts;
