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
  Users,
  Clock,
  DollarSign,
  ChefHat,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const sidebarItems = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: 'live' },
  { id: 'menu', label: 'Menu Management', icon: ChefHat },
  { id: 'analytics', label: 'Sales & Analytics', icon: TrendingUp },
  { id: 'billing', label: 'Billing & Transactions', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalMenuItems: 0,
    avgOrderValue: 0
  });

  // Check if user is vendor
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={dashboardStats} />;
      case 'orders':
        return <OrdersManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'analytics':
        return <SalesAnalytics />;
      case 'billing':
        return <BillingTransactions />;
      case 'settings':
        return <VendorSettings />;
      default:
        return <DashboardOverview stats={dashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-orange-200 z-50 lg:translate-x-0 lg:static lg:z-auto",
          "shadow-xl lg:shadow-none"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Vendor Portal</h2>
                  <p className="text-sm text-gray-600">Restaurant Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  activeTab === item.id 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg" 
                    : "hover:bg-orange-50 text-gray-700"
                )}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto text-xs animate-pulse">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {user?.name?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name || 'Vendor'}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 text-gray-700 hover:text-red-600 hover:border-red-300"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-30">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'overview' ? 'Dashboard Overview' : sidebarItems.find(item => item.id === activeTab)?.label}
                </h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                <Badge variant="destructive" className="text-xs">3</Badge>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                View Live Site
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Today's Orders</p>
                  <p className="text-3xl font-bold">{stats.todayOrders}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.todayRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending Orders</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Menu Items</p>
                  <p className="text-3xl font-bold">{stats.totalMenuItems}</p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((order) => (
                <div key={order} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">#{order}</span>
                    </div>
                    <div>
                      <p className="font-medium">Order #00{order}</p>
                      <p className="text-sm text-gray-600">Customer Name • 2 items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{250 + order * 50}</p>
                    <Badge variant={order === 1 ? "default" : "secondary"} className="text-xs">
                      {order === 1 ? "Pending" : "Completed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500">
              <Plus className="w-4 h-4" />
              Add New Menu Item
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Settings className="w-4 h-4" />
              Restaurant Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
