import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Store, 
  ShoppingCart, 
  DollarSign,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalRestaurants: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  restaurantGrowth: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

interface TopPerformer {
  id: string;
  name: string;
  value: number;
  growth: number;
}

export default function AnalyticsReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<TopPerformer[]>([]);
  const [topDishes, setTopDishes] = useState<TopPerformer[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with Firebase queries
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 125430,
        totalOrders: 1247,
        totalUsers: 3456,
        totalRestaurants: 89,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        userGrowth: 15.2,
        restaurantGrowth: 5.7
      };

      const mockChartData: ChartData[] = [
        { date: '2024-01-01', revenue: 15000, orders: 150, users: 45 },
        { date: '2024-01-02', revenue: 18000, orders: 180, users: 52 },
        { date: '2024-01-03', revenue: 22000, orders: 220, users: 38 },
        { date: '2024-01-04', revenue: 19000, orders: 190, users: 61 },
        { date: '2024-01-05', revenue: 25000, orders: 250, users: 47 },
        { date: '2024-01-06', revenue: 21000, orders: 210, users: 55 },
        { date: '2024-01-07', revenue: 23000, orders: 230, users: 43 }
      ];

      const mockTopRestaurants: TopPerformer[] = [
        { id: '1', name: 'Pizza Palace', value: 25430, growth: 18.5 },
        { id: '2', name: 'Burger Barn', value: 22100, growth: 12.3 },
        { id: '3', name: 'Spice Garden', value: 19800, growth: 15.7 },
        { id: '4', name: 'Pasta Point', value: 17650, growth: 8.9 },
        { id: '5', name: 'Taco Town', value: 16200, growth: 22.1 }
      ];

      const mockTopDishes: TopPerformer[] = [
        { id: '1', name: 'Margherita Pizza', value: 456, growth: 25.3 },
        { id: '2', name: 'Chicken Burger', value: 389, growth: 18.7 },
        { id: '3', name: 'Biryani Special', value: 334, growth: 31.2 },
        { id: '4', name: 'Pasta Alfredo', value: 298, growth: 12.8 },
        { id: '5', name: 'Fish Tacos', value: 267, growth: 19.4 }
      ];

      setAnalyticsData(mockAnalytics);
      setChartData(mockChartData);
      setTopRestaurants(mockTopRestaurants);
      setTopDishes(mockTopDishes);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = (type: string) => {
    toast.success(`${type} report exported successfully`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform performance insights and data analytics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadAnalytics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData?.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData?.revenueGrowth && analyticsData.revenueGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {analyticsData?.revenueGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData?.totalOrders || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData?.orderGrowth && analyticsData.orderGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {analyticsData?.orderGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData?.totalUsers || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData?.userGrowth && analyticsData.userGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {analyticsData?.userGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData?.totalRestaurants || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData?.restaurantGrowth && analyticsData.restaurantGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {analyticsData?.restaurantGrowth}% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <span>Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Volume</CardTitle>
                <CardDescription>Daily orders over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <span>Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and insights</CardDescription>
              </div>
              <Button onClick={() => exportReport('Revenue')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p>Detailed revenue charts and analytics would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order Analytics</CardTitle>
                <CardDescription>Order patterns and trends analysis</CardDescription>
              </div>
              <Button onClick={() => exportReport('Orders')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p>Order analytics and trend charts would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Restaurants</CardTitle>
                <CardDescription>Based on revenue in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRestaurants.map((restaurant, index) => (
                    <div key={restaurant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{restaurant.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(restaurant.value)}</p>
                        </div>
                      </div>
                      <Badge variant={restaurant.growth > 0 ? "default" : "secondary"}>
                        {restaurant.growth > 0 ? '+' : ''}{restaurant.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Dishes</CardTitle>
                <CardDescription>Most ordered items in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDishes.map((dish, index) => (
                    <div key={dish.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{dish.name}</p>
                          <p className="text-sm text-muted-foreground">{dish.value} orders</p>
                        </div>
                      </div>
                      <Badge variant={dish.growth > 0 ? "default" : "secondary"}>
                        {dish.growth > 0 ? '+' : ''}{dish.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
