import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin,
  Plus,
  Minus,
  Heart,
  Share2,
  ChefHat,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VegNonVegIndicator, VegNonVegToggle } from '@/components/common/VegNonVegToggle';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  category: string;
  rating: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  spiceLevel?: number;
  preparationTime?: string;
}

interface Restaurant {
  id: string;
  name: string;
  image: string;
  coverImage: string;
  rating: number;
  deliveryTime: string;
  cuisine: string[];
  isVeg: boolean;
  distance: string;
  offers?: string;
  description: string;
  address: string;
  phone: string;
  totalRatings: number;
}

// Mock data - will be replaced with Firebase data
const mockRestaurants: Record<string, Restaurant> = {
  '1': {
    id: '1',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    rating: 4.2,
    deliveryTime: '15-20 min',
    cuisine: ['Burgers', 'Fast Food', 'American'],
    isVeg: false,
    distance: '0.2 km',
    offers: '20% OFF',
    description: 'Home of the Whopper. Flame-grilled burgers and crispy sides.',
    address: 'Food Court, Level 2, Phoenix Mall',
    phone: '+91 98765 43210',
    totalRatings: 2840
  },
  '2': {
    id: '2',
    name: 'Pizza Hut',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    rating: 4.5,
    deliveryTime: '25-30 min',
    cuisine: ['Pizza', 'Italian'],
    isVeg: false,
    distance: '0.3 km',
    offers: 'Buy 1 Get 1',
    description: 'No One OutPizzas the Hut. Fresh pizzas with authentic Italian flavors.',
    address: 'Food Court, Level 2, Phoenix Mall',
    phone: '+91 98765 43211',
    totalRatings: 3200
  },
  '3': {
    id: '3',
    name: 'Fassos',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    rating: 4.0,
    deliveryTime: '20-25 min',
    cuisine: ['Wraps', 'Indian'],
    isVeg: false,
    distance: '0.1 km',
    description: 'Wrap It Up! Delicious wraps and rolls with authentic Indian flavors.',
    address: 'Food Court, Level 2, Phoenix Mall',
    phone: '+91 98765 43212',
    totalRatings: 1850
  },
  '4': {
    id: '4',
    name: 'Dominos',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    rating: 4.3,
    deliveryTime: '30-35 min',
    cuisine: ['Pizza', 'Fast Food'],
    isVeg: false,
    distance: '0.4 km',
    offers: '30% OFF',
    description: 'Oh Yes We Did! Hand-tossed pizzas and delicious sides.',
    address: 'Food Court, Level 2, Phoenix Mall',
    phone: '+91 98765 43213',
    totalRatings: 2950
  }
};

// Mock menu items for each restaurant
const mockMenuItems: Record<string, MenuItem[]> = {
  '1': [ // Burger King
    {
      id: 'bk1',
      name: 'Chicken Whopper',
      price: 299,
      description: 'Flame-grilled chicken patty with fresh lettuce, tomatoes, onions, pickles and mayo',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      isVeg: false,
      category: 'Burgers',
      rating: 4.5,
      isPopular: true,
      spiceLevel: 2,
      preparationTime: '8-10 min'
    },
    {
      id: 'bk2',
      name: 'Veggie Whopper',
      price: 249,
      description: 'Plant-based patty with fresh vegetables and signature sauces',
      image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400',
      isVeg: true,
      category: 'Burgers',
      rating: 4.3,
      isRecommended: true,
      preparationTime: '6-8 min'
    },
    {
      id: 'bk3',
      name: 'Crispy Chicken Fries',
      price: 149,
      description: 'Golden crispy chicken strips seasoned to perfection',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
      isVeg: false,
      category: 'Sides',
      rating: 4.4,
      spiceLevel: 1,
      preparationTime: '5-7 min'
    }
  ],
  '2': [ // Pizza Hut
    {
      id: 'ph1',
      name: 'Margherita Pizza',
      price: 399,
      description: 'Classic pizza with tomato sauce and mozzarella cheese',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      isVeg: true,
      category: 'Pizza',
      rating: 4.4,
      isPopular: true,
      preparationTime: '15-20 min'
    },
    {
      id: 'ph2',
      name: 'Pepperoni Pizza',
      price: 499,
      description: 'Pepperoni with mozzarella cheese and tomato sauce',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      isVeg: false,
      category: 'Pizza',
      rating: 4.6,
      spiceLevel: 1,
      preparationTime: '15-20 min'
    }
  ],
  '3': [ // Fassos
    {
      id: 'fs1',
      name: 'Chicken Kathi Roll',
      price: 179,
      description: 'Spicy chicken wrapped in soft paratha with onions and sauce',
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
      isVeg: false,
      category: 'Wraps',
      rating: 4.4,
      isPopular: true,
      spiceLevel: 3,
      preparationTime: '8-12 min'
    },
    {
      id: 'fs2',
      name: 'Paneer Kathi Roll',
      price: 159,
      description: 'Grilled paneer wrapped in soft paratha with vegetables',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      isVeg: true,
      category: 'Wraps',
      rating: 4.2,
      spiceLevel: 2,
      preparationTime: '8-12 min'
    }
  ],
  '4': [ // Dominos
    {
      id: 'dm1',
      name: 'Farmhouse Pizza',
      price: 459,
      description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      isVeg: true,
      category: 'Pizza',
      rating: 4.5,
      isRecommended: true,
      preparationTime: '20-25 min'
    },
    {
      id: 'dm2',
      name: 'Chicken Dominator',
      price: 599,
      description: 'Double pepper barbecue chicken, peri-peri chicken, chicken tikka',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      isVeg: false,
      category: 'Pizza',
      rating: 4.7,
      isPopular: true,
      spiceLevel: 3,
      preparationTime: '20-25 min'
    }
  ]
};

export default function Restaurant() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const restaurant = mockRestaurants[id!];
  const restaurantMenuItems = mockMenuItems[id!] || [];
  
  const categories = ['All', ...Array.from(new Set(restaurantMenuItems.map(item => item.category)))];
  
  const filteredItems = restaurantMenuItems.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const vegMatch = !isVegOnly || item.isVeg;
    return categoryMatch && vegMatch;
  });

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        image: item.image,
        isVeg: item.isVeg
      });
    }
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading restaurant menu..." type="cooking" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm animate-page-enter">
      {/* Header with Cover Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={restaurant.coverImage} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm" asChild>
            <Link to="/restaurants">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="border-0 shadow-warm animate-float">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="w-20 h-20 rounded-xl object-cover shadow-md"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-heading font-bold">{restaurant.name}</h1>
                  {restaurant.offers && (
                    <Badge variant="destructive" className="animate-food-pulse">
                      {restaurant.offers}
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">{restaurant.description}</p>
                
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                    <span className="text-muted-foreground">({restaurant.totalRatings})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.distance}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {restaurant.cuisine.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="sticky top-16 bg-background/80 backdrop-blur-sm border-b z-40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <VegNonVegToggle 
              isVeg={isVegOnly} 
              onToggle={setIsVegOnly}
              className="animate-float"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChefHat className="h-4 w-4" />
              <span>Fresh & Made to Order</span>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap ripple-effect"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="group dish-hover border-0 shadow-food"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <VegNonVegIndicator isVeg={item.isVeg} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.isPopular && (
                            <Badge variant="destructive" className="text-xs animate-food-pulse">
                              <Award className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {item.isRecommended && (
                            <Badge variant="secondary" className="text-xs">
                              <ChefHat className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating}</span>
                          </div>
                          {item.preparationTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{item.preparationTime}</span>
                            </div>
                          )}
                          {item.spiceLevel && (
                            <div className="flex items-center gap-1">
                              <span className="text-red-500">🌶️</span>
                              <span>Spice Level {item.spiceLevel}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">₹{item.price}</span>
                          
                          <div className="flex items-center gap-2">
                            {quantities[item.id] > 0 && (
                              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center">
                                  {quantities[item.id]}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            {quantities[item.id] > 0 ? (
                              <Button 
                                variant="food" 
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                className="ripple-effect"
                              >
                                Add to Cart
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="ripple-effect"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}