import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchRestaurants, searchMenuItems } from '@/lib/firebase';
import { RestaurantCard } from '@/components/RestaurantCard';
import { DishCard } from '@/components/search/DishCard';
import { SearchFilters } from '@/components/search/SearchFilters';
import { FavoritesPanel } from '@/components/search/FavoritesPanel';

export interface SearchFilters {
  cuisine: string[];
  minRating: number;
  maxDeliveryTime: number;
  vegOnly: boolean;
  priceRange: [number, number];
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const [filters, setFilters] = useState<SearchFilters>({
    cuisine: [],
    minRating: 0,
    maxDeliveryTime: 60,
    vegOnly: false,
    priceRange: [0, 1000],
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  // Search restaurants
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['searchRestaurants', debouncedQuery, filters],
    queryFn: () => searchRestaurants(debouncedQuery, filters),
    enabled: activeTab === 'restaurants',
  });

  // Search dishes
  const { data: dishes = [], isLoading: isLoadingDishes } = useQuery({
    queryKey: ['searchDishes', debouncedQuery, filters],
    queryFn: () => searchMenuItems(debouncedQuery, filters),
    enabled: activeTab === 'dishes',
  });

  const isLoading = activeTab === 'restaurants' ? isLoadingRestaurants : isLoadingDishes;
  const hasResults = activeTab === 'restaurants' ? restaurants.length > 0 : dishes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
            <div className="mt-6">
              <FavoritesPanel />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'restaurants' | 'dishes')}>
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="restaurants">
                  Restaurants {restaurants.length > 0 && `(${restaurants.length})`}
                </TabsTrigger>
                <TabsTrigger value="dishes">
                  Dishes {dishes.length > 0 && `(${dishes.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Restaurants Tab */}
              <TabsContent value="restaurants" className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : hasResults ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {restaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                ) : debouncedQuery ? (
                  <div className="text-center py-12">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground">
                      Enter a restaurant name or cuisine type
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Dishes Tab */}
              <TabsContent value="dishes" className="mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : hasResults ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                ) : debouncedQuery ? (
                  <div className="text-center py-12">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No dishes found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground">
                      Enter a dish name to find your favorite food
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;