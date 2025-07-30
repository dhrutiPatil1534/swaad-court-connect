import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Clock, 
  MapPin,
  TrendingUp,
  Utensils,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VegNonVegIndicator, VegNonVegToggle } from '@/components/common/VegNonVegToggle';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import heroImage from '@/assets/hero-food-court.jpg';
import foodCategories from '@/assets/food-categories.jpg';
import { cn } from '@/lib/utils';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  cuisine: string[];
  isVeg: boolean;
  isPopular?: boolean;
  distance: string;
  offers?: string;
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  restaurantName: string;
  isVeg: boolean;
  isTrending?: boolean;
  description: string;
}

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    rating: 4.2,
    deliveryTime: '15-20 min',
    cuisine: ['Burgers', 'Fast Food'],
    isVeg: false,
    isPopular: true,
    distance: '0.2 km',
    offers: '20% OFF'
  },
  {
    id: '2',
    name: 'Pizza Hut',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    rating: 4.5,
    deliveryTime: '25-30 min',
    cuisine: ['Pizza', 'Italian'],
    isVeg: false,
    isPopular: true,
    distance: '0.3 km',
    offers: 'Buy 1 Get 1'
  },
  {
    id: '3',
    name: 'Fassos',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    rating: 4.0,
    deliveryTime: '20-25 min',
    cuisine: ['Wraps', 'Indian'],
    isVeg: false,
    distance: '0.1 km'
  },
  {
    id: '4',
    name: 'Dominos',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    rating: 4.3,
    deliveryTime: '30-35 min',
    cuisine: ['Pizza', 'Fast Food'],
    isVeg: false,
    distance: '0.4 km',
    offers: '30% OFF'
  }
];

const mockTrendingItems: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Whopper',
    price: 299,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    rating: 4.5,
    restaurantName: 'Burger King',
    isVeg: false,
    isTrending: true,
    description: 'Flame-grilled beef patty with fresh vegetables'
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    price: 399,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    rating: 4.3,
    restaurantName: 'Pizza Hut',
    isVeg: true,
    isTrending: true,
    description: 'Classic pizza with tomato sauce and mozzarella'
  },
  {
    id: '3',
    name: 'Chicken Kathi Roll',
    price: 179,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    rating: 4.4,
    restaurantName: 'Fassos',
    isVeg: false,
    isTrending: true,
    description: 'Spicy chicken wrapped in soft paratha'
  }
];

export default function Home() {
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredRestaurants = isVegOnly 
    ? mockRestaurants.filter(r => r.isVeg)
    : mockRestaurants;

  const filteredTrendingItems = isVegOnly
    ? mockTrendingItems.filter(item => item.isVeg)
    : mockTrendingItems;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading delicious food..." type="cooking" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm animate-page-enter">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Food Court" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 text-glow animate-fade-in animation-delay-200">
              Savor Every
              <span className="bg-gradient-primary bg-clip-text text-transparent block animate-fade-in animation-delay-400">
                Bite
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-medium animate-fade-in animation-delay-600">
              Order from multiple restaurants in one place. 
              <br className="hidden md:block" />
              Unified cart, single payment, endless flavor!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-800">
              <Button 
                variant="food" 
                size="lg" 
                className="group"
                asChild
              >
                <Link to="/restaurants">
                  <Utensils className="mr-2 h-5 w-5 group-hover:animate-food-bounce" />
                  Explore Food Court
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                asChild
              >
                <Link to="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search Restaurants
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating food icons */}
        <div className="absolute top-20 right-10 w-12 h-12 bg-accent/20 rounded-full animate-float hidden md:block" />
        <div className="absolute bottom-40 left-10 w-8 h-8 bg-secondary/20 rounded-full animate-float animation-delay-300 hidden md:block" />
        <div className="absolute top-40 left-1/3 w-6 h-6 bg-primary/20 rounded-full animate-float animation-delay-600 hidden md:block" />
      </section>

      {/* Controls Section */}
      <section className="py-6 border-b bg-background/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <VegNonVegToggle 
              isVeg={isVegOnly} 
              onToggle={setIsVegOnly}
              className=""
            />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Mall Food Court</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Trending Items */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary animate-food-pulse" />
              <h2 className="text-2xl font-heading font-bold">Trending Now</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/trending">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrendingItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="group dish-hover cursor-pointer border-0 shadow-food"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <VegNonVegIndicator isVeg={item.isVeg} />
                      {item.isTrending && (
                        <Badge variant="destructive" className="animate-food-pulse">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-black">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">₹{item.price}</span>
                        <p className="text-xs text-muted-foreground">{item.restaurantName}</p>
                      </div>
                      <Button variant="food" size="sm" className="ripple-effect">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-secondary animate-food-pulse" />
              <h2 className="text-2xl font-heading font-bold">Popular Restaurants</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/restaurants">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <Card 
                key={restaurant.id} 
                className="group dish-hover cursor-pointer border-0 shadow-warm"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {restaurant.offers && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="destructive" className="animate-food-pulse">
                          {restaurant.offers}
                        </Badge>
                      </div>
                    )}
                    {restaurant.isPopular && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          <Award className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {restaurant.cuisine.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full ripple-effect"
                      asChild
                    >
                      <Link to={`/restaurant/${restaurant.id}`}>
                        View Menu
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Food Categories */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">
            Explore by Categories
          </h2>
          
          <div className="relative overflow-hidden rounded-2xl">
            <img 
              src={foodCategories} 
              alt="Food Categories" 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {['Burgers', 'Pizza', 'Indian', 'Chinese', 'Desserts', 'Beverages'].map((category, index) => (
                  <Button
                    key={category}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                    asChild
                  >
                    <Link to={`/restaurants?category=${category.toLowerCase()}`}>
                      {category}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}