import { Product } from '@/types';
import { ProductCard } from './productCard';

interface ProductGridProps {
  products: Product[];
  userRole: string;
  userId: number;
  onBuy: (productId: number, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  isBuying: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function ProductGrid({
  products,
  userRole,
  userId,
  onBuy,
  onEdit,
  onDelete,
  isBuying,
  isUpdating,
  isDeleting
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          userRole={userRole}
          userId={userId}
          onBuy={onBuy}
          onEdit={onEdit}
          onDelete={onDelete}
          isBuying={isBuying}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}