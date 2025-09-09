import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Banknote,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import {
  getVendorTransactions,
  getVendorPaymentSummary
} from '@/lib/firebase';

interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'cash' | 'wallet';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
  timestamp: Date;
  commission: number;
  netAmount: number;
  description: string;
}

interface PaymentSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  lastPayoutDate: Date;
  nextPayoutDate: Date;
}

interface PayoutRequest {
  id: string;
  amount: number;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankAccount: string;
  expectedDate: Date;
}

export default function BillingTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    lastPayoutDate: new Date(),
    nextPayoutDate: new Date()
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadBillingData();
    }
  }, [dateRange, statusFilter, user]);

  const loadBillingData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const [transactionsData, summaryData] = await Promise.all([
        getVendorTransactions(user.uid, dateRange, statusFilter),
        getVendorPaymentSummary(user.uid)
      ]);
      
      const transactionData = transactionsData.map((order: any) => ({
        id: order.id,
        orderId: order.id,
        customerName: order.customerName || 'Unknown Customer',
        amount: order.pricing?.totalAmount || 0,
        paymentMethod: order.payment?.method || 'unknown',
        status: (order.payment?.status === 'Completed' ? 'completed' : 
                order.payment?.status === 'Pending' ? 'pending' : 
                order.payment?.status === 'Failed' ? 'failed' : 
                order.payment?.status === 'Refunded' ? 'refunded' : 'pending') as 'completed' | 'pending' | 'failed' | 'refunded',
        transactionId: order.payment?.transactionId || '',
        timestamp: order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || Date.now()),
        commission: (order.pricing?.totalAmount || 0) * 0.05,
        netAmount: (order.pricing?.totalAmount || 0) * 0.95,
        description: `Order payment for ${order.items?.length || 0} items`
      }));
      
      setTransactions(transactionData);
      setPaymentSummary({
        totalEarnings: summaryData.totalEarnings || 0,
        pendingPayouts: summaryData.pendingPayouts || 0,
        completedPayouts: summaryData.completedPayouts || 0,
        lastPayoutDate: summaryData.lastPayoutDate,
        nextPayoutDate: summaryData.nextPayoutDate
      });
      
      // Mock payout requests for now - can be implemented later
      const mockPayoutRequests: PayoutRequest[] = [
        {
          id: '1',
          amount: 15000,
          requestDate: new Date('2024-01-10'),
          status: 'completed',
          bankAccount: '****1234',
          expectedDate: new Date('2024-01-12')
        },
        {
          id: '2',
          amount: 8500,
          requestDate: new Date('2024-01-08'),
          status: 'processing',
          bankAccount: '****1234',
          expectedDate: new Date('2024-01-16')
        }
      ];
      setPayoutRequests(mockPayoutRequests);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Banknote className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const handleRequestPayout = async () => {
    if (payoutAmount <= 0 || payoutAmount > paymentSummary.totalEarnings) {
      toast.error('Invalid payout amount');
      return;
    }

    const newPayout: PayoutRequest = {
      id: Date.now().toString(),
      amount: payoutAmount,
      requestDate: new Date(),
      status: 'pending',
      bankAccount: '****1234',
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    };

    setPayoutRequests(prev => [newPayout, ...prev]);
    setPayoutAmount(0);
    setIsPayoutDialogOpen(false);
    toast.success('Payout request submitted successfully');
  };

  const exportTransactions = () => {
    // Implementation for exporting transaction data
    toast.success('Transaction report exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Loading billing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Transactions</h2>
          <p className="text-gray-600">Track payments, transactions, and manage payouts</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportTransactions} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          
          <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Banknote className="w-4 h-4" />
                Request Payout
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Payment Summary Cards */}
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
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₹{paymentSummary.totalEarnings.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+12.5%</span>
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
                  <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
                  <p className="text-2xl font-bold text-orange-600">₹{paymentSummary.pendingPayouts.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Processing</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Completed Payouts</p>
                  <p className="text-2xl font-bold text-purple-600">{paymentSummary.completedPayouts}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CreditCard className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-purple-600">This month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm text-gray-600 mb-1">Last Payout Date</p>
                  <p className="text-2xl font-bold text-blue-600">{paymentSummary.lastPayoutDate.toLocaleDateString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">Last payout</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
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
          </div>

          {/* Transactions Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{transaction.transactionId}</p>
                          <p className="text-sm text-gray-500">{transaction.orderId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.customerName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">₹{transaction.amount}</p>
                          <p className="text-sm text-gray-500">Net: ₹{transaction.netAmount}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{transaction.timestamp.toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">{transaction.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutRequests.map((payout, index) => (
                  <motion.div
                    key={payout.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">₹{payout.amount.toLocaleString()}</h4>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Requested: {payout.requestDate.toLocaleDateString()}</p>
                        <p>Bank Account: {payout.bankAccount}</p>
                        {payout.status === 'processing' && (
                          <p>Expected: {payout.expectedDate.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusIcon(payout.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gross Revenue</span>
                    <span className="font-bold">₹{paymentSummary.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span>Platform Commission (5%)</span>
                    <span className="font-bold">-₹{(paymentSummary.totalEarnings * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-orange-600">
                    <span>Refunds</span>
                    <span className="font-bold">-₹{0}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center text-green-600 font-bold text-lg">
                    <span>Net Earnings</span>
                    <span>₹{(paymentSummary.totalEarnings * 0.95).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      <span>UPI Payments</span>
                    </div>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span>Digital Wallets</span>
                    </div>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Cash on Delivery</span>
                    </div>
                    <span className="font-bold">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction ID</Label>
                  <p className="font-semibold">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <Label>Order ID</Label>
                  <p className="font-semibold">{selectedTransaction.orderId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="font-semibold">{selectedTransaction.customerName}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                    <span className="capitalize font-semibold">{selectedTransaction.paymentMethod}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-semibold text-lg">₹{selectedTransaction.amount}</p>
                </div>
                <div>
                  <Label>Commission</Label>
                  <p className="font-semibold text-red-600">₹{selectedTransaction.commission}</p>
                </div>
                <div>
                  <Label>Net Amount</Label>
                  <p className="font-semibold text-green-600">₹{selectedTransaction.netAmount}</p>
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedTransaction.status)}
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-gray-700">{selectedTransaction.description}</p>
              </div>
              
              <div>
                <Label>Timestamp</Label>
                <p className="font-semibold">
                  {selectedTransaction.timestamp.toLocaleDateString()} at {selectedTransaction.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payout Request Dialog */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Available Balance</Label>
              <p className="text-2xl font-bold text-green-600">₹{paymentSummary.totalEarnings.toLocaleString()}</p>
            </div>
            
            <div>
              <Label htmlFor="payoutAmount">Payout Amount (₹)</Label>
              <Input
                id="payoutAmount"
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                placeholder="Enter amount"
                max={paymentSummary.totalEarnings}
              />
            </div>
            
            <div>
              <Label>Bank Account</Label>
              <p className="text-gray-600">Funds will be transferred to your registered bank account ****1234</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleRequestPayout} className="flex-1">
                Request Payout
              </Button>
              <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
