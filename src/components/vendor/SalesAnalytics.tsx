import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductAnalytics {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  isVeg: boolean;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  growthRate: number;
  completionRate: number;
}

export default function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    growthRate: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    // Mock data - replace with Firebase queries
    const mockSalesData: SalesData[] = [
      { period: 'Mon', revenue: 2500, orders: 15, customers: 12 },
      { period: 'Tue', revenue: 3200, orders: 18, customers: 16 },
      { period: 'Wed', revenue: 2800, orders: 16, customers: 14 },
      { period: 'Thu', revenue: 3800, orders: 22, customers: 19 },
      { period: 'Fri', revenue: 4200, orders: 25, customers: 21 },
      { period: 'Sat', revenue: 5100, orders: 30, customers: 26 },
      { period: 'Sun', revenue: 4600, orders: 28, customers: 24 }
    ];

    const mockTopProducts: ProductAnalytics[] = [
      { id: '1', name: 'Chicken Burger', category: 'Burgers', totalSold: 45, revenue: 11250, isVeg: false },
      { id: '2', name: 'Veg Pizza', category: 'Pizza', totalSold: 38, revenue: 13300, isVeg: true },
      { id: '3', name: 'French Fries', category: 'Sides', totalSold: 52, revenue: 6240, isVeg: true },
      { id: '4', name: 'Pasta Alfredo', category: 'Pasta', totalSold: 28, revenue: 7840, isVeg: true },
      { id: '5', name: 'Chocolate Shake', category: 'Beverages', totalSold: 35, revenue: 5250, isVeg: true }
    ];

    const mockMetrics: RevenueMetrics = {
      totalRevenue: 26200,
      totalOrders: 154,
      avgOrderValue: 170,
      totalCustomers: 132,
      growthRate: 15.4,
      completionRate: 94.2
    };

    setSalesData(mockSalesData);
    setTopProducts(mockTopProducts);
    setRevenueMetrics(mockMetrics);
  };

  const exportReport = () => {
    // Implementation for exporting analytics report
    console.log('Exporting analytics report...');
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Track your restaurant's performance and growth</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{revenueMetrics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+{revenueMetrics.growthRate}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{revenueMetrics.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">{revenueMetrics.completionRate}% completed</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">₹{revenueMetrics.avgOrderValue}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600">Target: ₹200</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-orange-600">{revenueMetrics.totalCustomers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Unique customers</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between gap-2 p-4">
                {salesData.map((data, index) => (
                  <div key={data.period} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-xs font-medium text-gray-600">₹{(data.revenue / 1000).toFixed(1)}k</div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.revenue / 5100) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[20px] relative group"
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{data.revenue}
                      </div>
                    </motion.div>
                    <div className="text-sm font-medium text-gray-700">{data.period}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orders vs Revenue */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Daily Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div key={data.period} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.orders / 30) * 100}%` }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-orange-500 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-bold w-8">{data.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.map((data, index) => (
                    <div key={data.period} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.customers / 26) * 100}%` }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-purple-500 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-bold w-8">{data.customers}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Best Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          <Badge variant={product.isVeg ? "default" : "secondary"} className="text-xs">
                            {product.isVeg ? "Veg" : "Non-Veg"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Revenue Target</span>
                    <span className="text-sm text-gray-600">₹{revenueMetrics.totalRevenue.toLocaleString()} / ₹50,000</span>
                  </div>
                  <Progress value={(revenueMetrics.totalRevenue / 50000) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Order Completion Rate</span>
                    <span className="text-sm text-gray-600">{revenueMetrics.completionRate}%</span>
                  </div>
                  <Progress value={revenueMetrics.completionRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-gray-600">4.7 / 5.0</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Revenue Growth</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your revenue increased by {revenueMetrics.growthRate}% compared to last period. Keep up the great work!
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Peak Hours</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Most orders come between 7-9 PM. Consider running promotions during slower hours.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-800">Top Category</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      Burgers are your best-selling category. Consider expanding the burger menu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
