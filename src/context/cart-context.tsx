import React, { createContext, useContext, useState } from 'react';
import { MenuItem } from '@/lib/firebase';

interface SelectedCustomization {
  customizationId: string;
  selectedOptions: {
    id: string;
    name: string;
    price: number;
    isVeg: boolean;
  }[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image: string;
  isVeg: boolean;
  customizations?: SelectedCustomization[];
  specialInstructions?: string;
  spiceLevel?: number;
  uniqueId: string; // Unique identifier for cart items
  totalPrice: number; // Total price including customizations
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string, customizations?: SelectedCustomization[], specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getRestaurantItems: (restaurantId: string) => CartItem[];
  canAddToCart: (restaurantId: string) => { allowed: boolean; message: string };
  getRestaurantSubtotal: (restaurantId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const getItemCustomizationPrice = (customizations?: SelectedCustomization[]) => {
    if (!customizations) return 0;
    return customizations.reduce((total, customization) => {
      return total + customization.selectedOptions.reduce((optionTotal, option) => {
        return optionTotal + option.price;
      }, 0);
    }, 0);
  };

  const getItemIdentifier = (item: MenuItem, customizations?: SelectedCustomization[], specialInstructions?: string) => {
    const customizationString = customizations
      ? customizations
          .map(c => `${c.customizationId}:${c.selectedOptions.map(o => o.id).join(',')}`)
          .sort()
          .join('|')
      : '';
    return `${item.id}|${customizationString}|${specialInstructions || ''}`;
  };

  const canAddToCart = (restaurantId: string) => {
    if (items.length === 0) return { allowed: true, message: '' };
    return { allowed: true, message: '' };
  };

  const addItem = (item: MenuItem, restaurantId: string, restaurantName: string, customizations?: SelectedCustomization[], specialInstructions?: string, isDineIn?: boolean) => {
    const cartCheck = canAddToCart(restaurantId, isDineIn || false);
    if (!cartCheck.allowed) {
      throw new Error(cartCheck.message);
    }
    
    // Update isDineIn state if it's different
    if (isDineIn !== undefined && isDineIn !== isDineIn) {
      setIsDineIn(isDineIn);
    }

    const itemIdentifier = getItemIdentifier(item, customizations, specialInstructions);
    const customizationPrice = getItemCustomizationPrice(customizations);
    const totalPrice = item.price + customizationPrice;

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.uniqueId === itemIdentifier
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        return prevItems.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1, totalPrice: cartItem.totalPrice + (totalPrice / cartItem.quantity) }
            : cartItem
        );
      }

      // Add new item
      return [...prevItems, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurantId,
        restaurantName,
        image: item.image,
        isVeg: item.isVeg,
        customizations,
        specialInstructions,
        spiceLevel: item.spiceLevel,
        uniqueId: itemIdentifier,
        totalPrice: totalPrice
      }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.uniqueId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 0) return;

    setItems(prevItems =>
      quantity === 0
        ? prevItems.filter(item => item.uniqueId !== itemId)
        : prevItems.map(item =>
            item.uniqueId === itemId 
              ? { 
                  ...item, 
                  quantity, 
                  totalPrice: (item.price + getItemCustomizationPrice(item.customizations)) * quantity 
                } 
              : item
          )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getRestaurantItems = (restaurantId: string) => {
    return items.filter(item => item.restaurantId === restaurantId);
  };

  const getRestaurantSubtotal = (restaurantId: string) => {
    return items
      .filter(item => item.restaurantId === restaurantId)
      .reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getRestaurantItems,
        canAddToCart,
        getRestaurantSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}