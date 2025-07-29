import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  MapPin,
  Award,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VegNonVegToggle } from '@/components/common/VegNonVegToggle';

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
  },
  {
    id: '5',
    name: 'KFC',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    rating: 4.1,
    deliveryTime: '20-25 min',
    cuisine: ['Chicken', 'Fast Food'],
    isVeg: false,
    distance: '0.5 km'
  },
  {
    id: '6',
    name: 'Subway',
    image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400',
    rating: 4.0,
    deliveryTime: '15-20 min',
    cuisine: ['Sandwiches', 'Healthy'],
    isVeg: false,
    distance: '0.3 km',
    offers: '15% OFF'
  }
];

export default function Restaurants() {
  const [isVegOnly, setIsVegOnly] = useState(false);

  const filteredRestaurants = isVegOnly 
    ? mockRestaurants.filter(r => r.isVeg)
    : mockRestaurants;

  return (
    <div className="min-h-screen bg-gradient-warm animate-page-enter">
      {/* Header Section */}
      <section className="py-8 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-2 animate-fade-in">
                All Restaurants
              </h1>
              <p className="text-muted-foreground animate-fade-in animation-delay-200">
                Choose from {filteredRestaurants.length} restaurants in Mall Food Court
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <VegNonVegToggle 
                isVeg={isVegOnly} 
                onToggle={setIsVegOnly}
                className="animate-fade-in animation-delay-400"
              />
              
              <Button variant="outline" size="sm" className="animate-fade-in animation-delay-600">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <Card 
              key={restaurant.id} 
              className="group dish-hover cursor-pointer border-0 shadow-warm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <Link to={`/restaurant/${restaurant.id}`}>
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
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
                    <h3 className="font-semibold text-lg mb-3">{restaurant.name}</h3>
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
                    <div className="flex flex-wrap gap-1 mb-4">
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
                    >
                      View Menu
                    </Button>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No {isVegOnly ? 'vegetarian ' : ''}restaurants found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}