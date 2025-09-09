import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Clock,
  DollarSign,
  ChefHat,
  Eye,
  Plus,
  Store,
  Users,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  getVendorOrdersRealtime,
  getVendorProfile,
  getVendorStats,
  getVendorAnalytics,
  updateOrderStatus,
  createSampleVendorData
} from '@/lib/firebase';

// Import dashboard components
import OrdersManagement from '@/components/vendor/OrdersManagement';
import SalesAnalytics from '@/components/vendor/SalesAnalytics';
import MenuManagement from '@/components/vendor/MenuManagement';
import BillingTransactions from '@/components/vendor/BillingTransactions';
import VendorSettings from '@/components/vendor/VendorSettings';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalMenuItems: number;
  avgOrderValue: number;
  totalRevenue: number;
  completionRate: number;
}

interface VendorProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  cuisine: string[];
  logo?: string;
  rating: number;
  isOpen: boolean;
}

// Dashboard Overview Component
const DashboardOverview = ({ 
  stats, 
  recentOrders, 
  vendorProfile, 
  onTabChange 
}: {
  stats: DashboardStats;
  recentOrders: any[];
  vendorProfile: VendorProfile | null;
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="space-y-6">
      {/* Restaurant Status Banner */}
      {vendorProfile && (
        <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{vendorProfile.businessName}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{vendorProfile.rating.toFixed(1)}</span>
                    </div>
                    <Badge 
                      variant={vendorProfile.isOpen ? "secondary" : "destructive"}
                      className="bg-white/20 text-white border-white/30"
                    >
                      {vendorProfile.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                    <span className="text-sm opacity-90">
                      {vendorProfile.cuisine.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Today's Orders</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.todayOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Today's Revenue</p>
                  <p className="text-3xl font-bold text-green-900">₹{stats.todayRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
              onClick={() => onTabChange('menu')}
            >
              <Plus className="w-6 h-6 text-orange-500" />
              <span className="text-sm">Add Menu Item</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => onTabChange('analytics')}
            >
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-200"
              onClick={() => onTabChange('orders')}
            >
              <Eye className="w-6 h-6 text-green-500" />
              <span className="text-sm">Manage Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
              onClick={() => onTabChange('settings')}
            >
              <Settings className="w-6 h-6 text-purple-500" />
              <span className="text-sm">Restaurant Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customerName || 'Customer'}</p>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} items • ₹{order.totalAmount || 0}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'pending' ? 'destructive' : 'secondary'
                    }
                  >
                    {order.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalMenuItems: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
    completionRate: 0
  });
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Check if user is vendor
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/login');
      return;
    }
    loadVendorData();
  }, [user, navigate]);

  const loadVendorData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Load vendor profile and stats
      const [profile, stats] = await Promise.all([
        getVendorProfile(user.uid),
        getVendorStats(user.uid)
      ]);

      if (profile) {
        setVendorProfile(profile);
      }

      // If no data found, create sample data for testing
      if (stats.totalOrders === 0) {
        console.log('No orders found, creating sample data...');
        await createSampleVendorData(user.uid);
        // Reload stats after creating sample data
        const updatedStats = await getVendorStats(user.uid);
        setDashboardStats(prev => ({
          ...prev,
          ...updatedStats
        }));
      } else {
        setDashboardStats(prev => ({
          ...prev,
          ...stats
        }));
      }

      // Set up real-time orders listener
      const unsubscribe = getVendorOrdersRealtime(user.uid, (orders) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });

        const pendingOrders = orders.filter(order => 
          ['pending', 'accepted', 'preparing'].includes(order.status)
        );

        const completedToday = todayOrders.filter(order => 
          order.status === 'completed'
        );

        const todayRevenue = completedToday.reduce((sum, order) => 
          sum + (order.totalAmount || 0), 0
        );

        setDashboardStats(prev => ({
          ...prev,
          todayOrders: todayOrders.length,
          todayRevenue,
          pendingOrders: pendingOrders.length,
          completedOrders: completedToday.length
        }));

        setRecentOrders(orders.slice(0, 5));
      });

      return () => unsubscribe && unsubscribe();
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {vendorProfile?.businessName || 'Vendor Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="text-xs">3</Badge>
            </Button>
            
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={vendorProfile?.logo} />
                <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                  {vendorProfile?.businessName?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Modern Tabs */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Modern Tab Navigation */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-transparent gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
                {dashboardStats.pendingOrders > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {dashboardStats.pendingOrders}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="menu"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Menu
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-500 data-[state=active]:text-white rounded-xl font-medium transition-all duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview 
              stats={dashboardStats} 
              recentOrders={recentOrders}
              vendorProfile={vendorProfile}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTransactions />
          </TabsContent>

          <TabsContent value="settings">
            <VendorSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
