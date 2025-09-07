import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Star,
  Clock,
  DollarSign,
  Package,
  Image as ImageIcon,
  Save,
  X,
  ChefHat,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  rating: number;
  totalOrders: number;
  ingredients: string[];
  allergens: string[];
  calories: number;
  spiceLevel: 'mild' | 'medium' | 'hot' | 'extra-hot';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    isVeg: true,
    isAvailable: true,
    preparationTime: 15,
    ingredients: [],
    allergens: [],
    calories: 0,
    spiceLevel: 'mild',
    tags: []
  });

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    // Mock data - replace with Firebase queries
    const mockCategories: Category[] = [
      { id: '1', name: 'Burgers', description: 'Delicious burgers', image: '', isActive: true, sortOrder: 1, itemCount: 8 },
      { id: '2', name: 'Pizza', description: 'Fresh pizzas', image: '', isActive: true, sortOrder: 2, itemCount: 6 },
      { id: '3', name: 'Beverages', description: 'Refreshing drinks', image: '', isActive: true, sortOrder: 3, itemCount: 12 },
      { id: '4', name: 'Desserts', description: 'Sweet treats', image: '', isActive: true, sortOrder: 4, itemCount: 5 }
    ];

    const mockMenuItems: MenuItem[] = [
      {
        id: '1',
        name: 'Classic Chicken Burger',
        description: 'Juicy chicken patty with lettuce, tomato, and special sauce',
        price: 250,
        category: 'Burgers',
        image: '/api/placeholder/300/200',
        isVeg: false,
        isAvailable: true,
        preparationTime: 15,
        rating: 4.5,
        totalOrders: 145,
        ingredients: ['Chicken', 'Lettuce', 'Tomato', 'Bun', 'Special Sauce'],
        allergens: ['Gluten', 'Eggs'],
        calories: 520,
        spiceLevel: 'mild',
        tags: ['Popular', 'Bestseller'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella and basil',
        price: 350,
        category: 'Pizza',
        image: '/api/placeholder/300/200',
        isVeg: true,
        isAvailable: true,
        preparationTime: 20,
        rating: 4.7,
        totalOrders: 98,
        ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Pizza Dough'],
        allergens: ['Gluten', 'Dairy'],
        calories: 280,
        spiceLevel: 'mild',
        tags: ['Classic', 'Vegetarian'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Mango Lassi',
        description: 'Creamy yogurt drink with fresh mango',
        price: 120,
        category: 'Beverages',
        image: '/api/placeholder/300/200',
        isVeg: true,
        isAvailable: true,
        preparationTime: 5,
        rating: 4.3,
        totalOrders: 67,
        ingredients: ['Mango', 'Yogurt', 'Sugar', 'Cardamom'],
        allergens: ['Dairy'],
        calories: 180,
        spiceLevel: 'mild',
        tags: ['Refreshing', 'Traditional'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setCategories(mockCategories);
    setMenuItems(mockMenuItems);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      description: newItem.description || '',
      price: newItem.price!,
      category: newItem.category!,
      image: newItem.image || '/api/placeholder/300/200',
      isVeg: newItem.isVeg || true,
      isAvailable: newItem.isAvailable || true,
      preparationTime: newItem.preparationTime || 15,
      rating: 0,
      totalOrders: 0,
      ingredients: newItem.ingredients || [],
      allergens: newItem.allergens || [],
      calories: newItem.calories || 0,
      spiceLevel: newItem.spiceLevel || 'mild',
      tags: newItem.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMenuItems(prev => [...prev, item]);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      isVeg: true,
      isAvailable: true,
      preparationTime: 15,
      ingredients: [],
      allergens: [],
      calories: 0,
      spiceLevel: 'mild',
      tags: []
    });
    setIsAddItemOpen(false);
    toast.success('Menu item added successfully');
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    setMenuItems(prev => prev.map(item => 
      item.id === editingItem.id 
        ? { ...editingItem, updatedAt: new Date() }
        : item
    ));
    setEditingItem(null);
    toast.success('Menu item updated successfully');
  };

  const handleDeleteItem = async (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Menu item deleted successfully');
  };

  const toggleItemAvailability = async (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isAvailable: !item.isAvailable, updatedAt: new Date() }
        : item
    ));
    toast.success('Item availability updated');
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('Please enter category name');
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name!,
      description: newCategory.description || '',
      image: newCategory.image || '',
      isActive: newCategory.isActive || true,
      sortOrder: newCategory.sortOrder || categories.length + 1,
      itemCount: 0
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({
      name: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: 0
    });
    setIsAddCategoryOpen(false);
    toast.success('Category added successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your restaurant's menu items and categories</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Package className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Menu Item
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name} ({category.itemCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              {viewMode === 'grid' ? (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={item.isVeg ? "default" : "secondary"} className="text-xs">
                        {item.isVeg ? <Leaf className="w-3 h-3 mr-1" /> : <ChefHat className="w-3 h-3 mr-1" />}
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                      {!item.isAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleItemAvailability(item.id)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{item.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {item.preparationTime} min
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="flex-1 gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => toggleItemAvailability(item.id)}
                              className="data-[state=checked]:bg-green-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.preparationTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {item.rating} ({item.totalOrders} orders)
                          </div>
                          <Badge variant={item.isVeg ? "default" : "secondary"} className="text-xs">
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {item.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                              className="gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your menu item"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prepTime">Preparation Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={newItem.preparationTime}
                  onChange={(e) => setNewItem(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                  placeholder="15"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVeg"
                  checked={newItem.isVeg}
                  onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, isVeg: checked }))}
                />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={newItem.isAvailable}
                  onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label htmlFor="isAvailable">Available</Label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddItem} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <Label htmlFor="categoryDesc">Description</Label>
              <Textarea
                id="categoryDesc"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this category"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="categoryActive"
                checked={newCategory.isActive}
                onCheckedChange={(checked) => setNewCategory(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="categoryActive">Active</Label>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddCategory} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Add Category
              </Button>
              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Item Name *</Label>
                  <Input
                    id="editName"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <Label htmlFor="editPrice">Price (₹) *</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  placeholder="Describe your menu item"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCategory">Category *</Label>
                  <Select 
                    value={editingItem.category} 
                    onValueChange={(value) => setEditingItem(prev => prev ? ({ ...prev, category: value }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editPrepTime">Preparation Time (min)</Label>
                  <Input
                    id="editPrepTime"
                    type="number"
                    value={editingItem.preparationTime}
                    onChange={(e) => setEditingItem(prev => prev ? ({ ...prev, preparationTime: Number(e.target.value) }) : null)}
                    placeholder="15"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsVeg"
                    checked={editingItem.isVeg}
                    onCheckedChange={(checked) => setEditingItem(prev => prev ? ({ ...prev, isVeg: checked }) : null)}
                  />
                  <Label htmlFor="editIsVeg">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsAvailable"
                    checked={editingItem.isAvailable}
                    onCheckedChange={(checked) => setEditingItem(prev => prev ? ({ ...prev, isAvailable: checked }) : null)}
                  />
                  <Label htmlFor="editIsAvailable">Available</Label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleUpdateItem} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
