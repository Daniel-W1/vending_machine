import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Edit, Trash2, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  userRole: string;
  userId: number;
  onBuy: (productId: number, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  isBuying: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function ProductCard({
  product,
  userRole,
  userId,
  onBuy,
  onEdit,
  onDelete,
  isBuying,
  isUpdating,
  isDeleting
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg px-4 py-2 flex flex-col items-center justify-between relative">
      <div className="text-center w-full">
        <h3 className="font-bold capitalize">{product.product_name}</h3>
        <Separator className="mb-2 w-full" />
        <p className="text-base text-gray-500 font-bold">${parseFloat(product.cost.toString()).toFixed(2)}</p>
        <p className="text-sm text-gray-400">Qty: {product.amount_available}</p>
        {product.amount_available === 0 && <Badge className="text-xs absolute top-2 -right-4 rotate-45" variant={'destructive'}>Sold Out</Badge>}
      </div>
      {userRole === 'buyer' && (
        <Button
          onClick={() => onBuy(product.id!, 1)}
          disabled={product.amount_available === 0 || isBuying}
          className="mt-2 w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy
        </Button>
      )}
      {userRole === 'seller' && userId === product.seller_id && (
        <div className="flex mt-2 space-x-1 absolute bottom-0 right-1">
          <Button
            onClick={() => onEdit(product)}
            className="p-2"
            variant="ghost"
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 size="sm" /> : <Edit className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => onDelete(product.id!)}
            className="p-2"
            variant="ghost"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 size="sm" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}