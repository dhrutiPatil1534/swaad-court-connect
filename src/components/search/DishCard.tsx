import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/types';

interface DishCardProps {
  dish: MenuItem & { restaurantName?: string; restaurantId?: string };
}

export const DishCard = ({ dish }: DishCardProps) => {
  const navigate = useNavigate();
  const { addItem, updateQuantity, items } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find(item => item.id === dish.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!dish.restaurantId) {
      toast({
        title: 'Error',
        description: 'Restaurant information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      await addItem({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        restaurantId: dish.restaurantId,
        image: dish.image,
        isVeg: dish.isVeg,
      });
      toast({
        title: 'Added to cart',
        description: `${dish.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(dish.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem && quantity > 0) {
      updateQuantity(dish.id, quantity - 1);
    }
  };

  const handleCardClick = () => {
    if (dish.restaurantId) {
      navigate(`/restaurant/${dish.restaurantId}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={handleCardClick}>
        {/* Image */}
        <div className="relative h-48 bg-muted">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {dish.isVeg && (
            <Badge className="absolute top-2 left-2 bg-green-500">
              <Leaf className="h-3 w-3 mr-1" />
              Veg
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Dish Name */}
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{dish.name}</h3>
          
          {/* Restaurant Name */}
          {dish.restaurantName && (
            <p className="text-sm text-muted-foreground mb-2">{dish.restaurantName}</p>
          )}

          {/* Description */}
          {dish.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {dish.description}
            </p>
          )}

          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">₹{dish.price}</span>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecrement}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <Button
                  size="sm"
                  onClick={handleIncrement}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isAdding || !dish.available}
              >
                {isAdding ? 'Adding...' : dish.available ? 'Add' : 'Unavailable'}
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};