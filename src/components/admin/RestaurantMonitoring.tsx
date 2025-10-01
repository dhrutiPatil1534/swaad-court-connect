import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  Star,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Tag,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  getAllRestaurantsForAdmin,
  getAllMenuItemsForAdmin,
  approveMenuItem,
  removeMenuItem,
  getRestaurantMenuItems
} from '@/lib/firebase';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  restaurantId: string;
  restaurantName: string;
  createdAt: Date;
  updatedAt: Date;
  reportCount: number;
  reports: Array<{
    id: string;
    reason: string;
    reportedBy: string;
    reportedAt: Date;
  }>;
  status: 'active' | 'flagged' | 'removed';
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  logo?: string;
  menuItemsCount: number;
  flaggedItemsCount: number;
  averagePrice: number;
  status: 'active' | 'suspended';
}

export default function RestaurantMonitoring() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu-items' | 'flagged'>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, searchQuery, statusFilter, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch real data from Firebase
      const [restaurantsData, menuItemsData] = await Promise.all([
        getAllRestaurantsForAdmin(),
        getAllMenuItemsForAdmin()
      ]);

      setRestaurants(restaurantsData);
      setMenuItems(menuItemsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    if (activeTab === 'flagged') {
      filtered = filtered.filter(item => item.status === 'flagged' || item.reportCount > 0);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeMenuItem(itemId);
      // Update local state
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'removed' as const, isAvailable: false } : item
      ));
      toast.success('Menu item removed successfully');
    } catch (error) {
      console.error('Error removing menu item:', error);
      toast.error('Failed to remove menu item');
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      await approveMenuItem(itemId);
      // Update local state
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, status: 'active' as const, reportCount: 0, reports: [] } : item
      ));
      toast.success('Menu item approved');
    } catch (error) {
      console.error('Error approving menu item:', error);
      toast.error('Failed to approve menu item');
    }
  };

  const handleViewRestaurantMenu = async (restaurantId: string) => {
    try {
      const restaurantMenuItems = await getRestaurantMenuItems(restaurantId);
      // Filter current menu items to show only this restaurant's items
      setFilteredItems(restaurantMenuItems);
      setActiveTab('menu-items');
      toast.success('Showing menu items for selected restaurant');
    } catch (error) {
      console.error('Error loading restaurant menu:', error);
      toast.error('Failed to load restaurant menu');
    }
  };

  const getStatusBadge = (status: string, reportCount: number = 0) => {
    if (reportCount > 0) {
      return <Badge variant="destructive" className="text-xs">Flagged ({reportCount})</Badge>;
    }
    
    const variants = {
      active: <Badge variant="default" className="text-xs">Active</Badge>,
      flagged: <Badge variant="destructive" className="text-xs">Flagged</Badge>,
      removed: <Badge variant="secondary" className="text-xs">Removed</Badge>
    };
    
    return variants[status as keyof typeof variants] || variants.active;
  };

  const renderRestaurantsTab = () => (
    <div className="space-y-4">
      {restaurants.map((restaurant, index) => (
        <motion.div
          key={restaurant.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={restaurant.logo} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-semibold">
                      {restaurant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {restaurant.cuisine.map((c, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-900">{restaurant.menuItemsCount}</div>
                    <div className="text-sm text-gray-600-bold">Menu Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{restaurant.flaggedItemsCount}</div>
                    <div className="text-sm text-gray-600-bold">Flagged</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{restaurant.averagePrice}</div>
                    <div className="text-sm text-gray-600-bold">Avg Price</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRestaurantMenu(restaurant.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Menu
                  </Button>
                  {restaurant.flaggedItemsCount > 0 && (
                    <Button variant="destructive" size="sm">
                      <Flag className="w-4 h-4 mr-2" />
                      Review Flags
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderMenuItemsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                {item.image && (
                  <div className="relative mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {item.reportCount > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          {item.reportCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                      <div className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    {getStatusBadge(item.status, item.reportCount)}
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>{item.restaurantName} • {item.category}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDetailsDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    
                    {item.status === 'flagged' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveItem(item.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurant & Menu Monitoring</h2>
          <p className="text-gray-600">Monitor restaurant content and menu items</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData} className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-black-900">{restaurants.length}</div>
            <div className="text-sm text-gray-600-bold">Total Restaurants</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <div className="text-sm text-gray-600-bold">Menu Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {menuItems.filter(item => item.reportCount > 0).length}
            </div>
            <div className="text-sm text-gray-600-bold">Flagged Items</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600-bold">Active Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'restaurants'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Restaurants
        </button>
        <button
          onClick={() => setActiveTab('menu-items')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'menu-items'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`pb-2 px-1 font-medium flex items-center gap-2 ${
            activeTab === 'flagged'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          Flagged Items
          {menuItems.filter(item => item.reportCount > 0).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {menuItems.filter(item => item.reportCount > 0).length}
            </Badge>
          )}
        </button>
      </div>

      {/* Filters */}
      {activeTab !== 'restaurants' && (
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
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'restaurants' ? renderRestaurantsTab() : renderMenuItemsTab()}

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Menu Item Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedItem.image && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedItem.name}</h3>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="font-semibold">₹{selectedItem.price}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-semibold">{selectedItem.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Restaurant</span>
                    <p className="font-semibold">{selectedItem.restaurantName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="font-semibold">{selectedItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                  </div>
                </div>
              </div>

              {selectedItem.reports.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Reports ({selectedItem.reports.length})</h4>
                  <div className="space-y-3">
                    {selectedItem.reports.map((report) => (
                      <div key={report.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 mb-1">{report.reason}</p>
                        <p className="text-xs text-red-600">
                          Reported by {report.reportedBy} on {report.reportedAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {selectedItem.status === 'flagged' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveItem(selectedItem.id);
                        setShowDetailsDialog(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Item
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleRemoveItem(selectedItem.id);
                        setShowDetailsDialog(false);
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Item
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
