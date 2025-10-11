import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { SearchFilters as SearchFiltersType } from '@/pages/Search';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

const CUISINES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Continental',
  'Fast Food',
  'Desserts',
  'Beverages',
];

export const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
  const handleCuisineToggle = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter((c) => c !== cuisine)
      : [...filters.cuisine, cuisine];
    onFiltersChange({ ...filters, cuisine: newCuisines });
  };

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({ ...filters, minRating: value[0] });
  };

  const handleDeliveryTimeChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxDeliveryTime: value[0] });
  };

  const handleVegOnlyToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, vegOnly: checked });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      cuisine: [],
      minRating: 0,
      maxDeliveryTime: 60,
      vegOnly: false,
      priceRange: [0, 1000],
    });
  };

  const hasActiveFilters =
    filters.cuisine.length > 0 ||
    filters.minRating > 0 ||
    filters.maxDeliveryTime < 60 ||
    filters.vegOnly ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cuisine Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Cuisine</Label>
          <div className="space-y-2">
            {CUISINES.map((cuisine) => (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine}
                  checked={filters.cuisine.includes(cuisine)}
                  onCheckedChange={() => handleCuisineToggle(cuisine)}
                />
                <label
                  htmlFor={cuisine}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {cuisine}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Veg Only Filter */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vegOnly"
              checked={filters.vegOnly}
              onCheckedChange={handleVegOnlyToggle}
            />
            <label
              htmlFor="vegOnly"
              className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Vegetarian Only
            </label>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Minimum Rating: {filters.minRating.toFixed(1)}⭐
          </Label>
          <Slider
            value={[filters.minRating]}
            onValueChange={handleRatingChange}
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Delivery Time Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Max Delivery Time: {filters.maxDeliveryTime} min
          </Label>
          <Slider
            value={[filters.maxDeliveryTime]}
            onValueChange={handleDeliveryTimeChange}
            min={15}
            max={60}
            step={5}
            className="w-full"
          />
        </div>

        {/* Price Range Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            min={0}
            max={1000}
            step={50}
            className="w-full"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <Label className="text-base font-semibold mb-3 block">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.cuisine.map((cuisine) => (
                <Badge key={cuisine} variant="secondary" className="gap-1">
                  {cuisine}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCuisineToggle(cuisine)}
                  />
                </Badge>
              ))}
              {filters.vegOnly && (
                <Badge variant="secondary" className="gap-1">
                  Veg Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleVegOnlyToggle(false)}
                  />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {filters.minRating}⭐+
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRatingChange([0])}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};