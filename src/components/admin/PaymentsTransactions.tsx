import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAllTransactionsForAdmin, getAllPayoutRequestsForAdmin } from '@/lib/firebase';

interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'payment' | 'refund' | 'payout' | 'commission';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cash';
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  createdAt: Date;
  completedAt?: Date;
  transactionId: string;
  gatewayResponse?: string;
  failureReason?: string;
  commission?: number;
  platformFee?: number;
}

interface PayoutRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: Date;
  processedAt?: Date;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  notes?: string;
}

export default function PaymentsTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'analytics'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, typeFilter, statusFilter, dateFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('PaymentsTransactions: Loading data from Firebase...');
      
      // Load transactions and payout requests in parallel
      const [transactionsData, payoutRequestsData] = await Promise.all([
        getAllTransactionsForAdmin(),
        getAllPayoutRequestsForAdmin()
      ]);
      
      console.log('PaymentsTransactions: Loaded', transactionsData.length, 'transactions');
      console.log('PaymentsTransactions: Loaded', payoutRequestsData.length, 'payout requests');
      
      setTransactions(transactionsData);
      setPayoutRequests(payoutRequestsData);
      
      if (transactionsData.length === 0 && payoutRequestsData.length === 0) {
        toast.info('No payment data found in the system');
      } else {
        toast.success(`Loaded ${transactionsData.length} transactions and ${payoutRequestsData.length} payout requests`);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment data from Firebase');
      setTransactions([]);
      setPayoutRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (dateFilter === 'today') {
      filtered = filtered.filter(txn => txn.createdAt >= today);
    } else if (dateFilter === 'yesterday') {
      filtered = filtered.filter(txn => txn.createdAt >= yesterday && txn.createdAt < today);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(txn => txn.createdAt >= weekAgo);
    }

    if (searchQuery) {
      filtered = filtered.filter(txn =>
        txn.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: <Badge className="bg-green-100 text-green-800">Completed</Badge>,
      pending: <Badge variant="secondary">Pending</Badge>,
      failed: <Badge variant="destructive">Failed</Badge>,
      processing: <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      payment: <ArrowDownLeft className="w-4 h-4 text-green-600" />,
      refund: <ArrowUpRight className="w-4 h-4 text-red-600" />,
      payout: <Wallet className="w-4 h-4 text-blue-600" />,
      commission: <DollarSign className="w-4 h-4 text-purple-600" />
    };
    return icons[type as keyof typeof icons] || <DollarSign className="w-4 h-4" />;
  };

  const calculateStats = () => {
    const totalRevenue = filteredTransactions
      .filter(txn => txn.type === 'payment' && txn.status === 'completed')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const totalRefunds = filteredTransactions
      .filter(txn => txn.type === 'refund' && txn.status === 'completed')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const totalCommission = filteredTransactions
      .filter(txn => txn.type === 'payment' && txn.status === 'completed')
      .reduce((sum, txn) => sum + (txn.commission || 0), 0);
    
    const pendingPayouts = payoutRequests
      .filter(payout => payout.status === 'pending')
      .reduce((sum, payout) => sum + payout.amount, 0);

    return { totalRevenue, totalRefunds, totalCommission, pendingPayouts };
  };

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject') => {
    try {
      setPayoutRequests(prev => prev.map(payout =>
        payout.id === payoutId
          ? { ...payout, status: action === 'approve' ? 'approved' : 'rejected', processedAt: new Date() }
          : payout
      ));
      toast.success(`Payout ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} payout`);
    }
  };

  const stats = calculateStats();

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
          <h2 className="text-2xl font-bold text-gray-900">Payments & Transactions</h2>
          <p className="text-gray-600">Monitor financial transactions and payouts</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">₹{stats.totalRefunds}</div>
            <div className="text-sm text-gray-600">Total Refunds</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">₹{stats.totalCommission}</div>
            <div className="text-sm text-gray-600">Commission Earned</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">₹{stats.pendingPayouts}</div>
            <div className="text-sm text-gray-600">Pending Payouts</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'transactions'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'payouts'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Payout Requests
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'analytics'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
              <SelectItem value="payout">Payouts</SelectItem>
              <SelectItem value="commission">Commission</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(transaction.type)}
                          <div>
                            <h3 className="font-semibold text-lg">{transaction.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {transaction.createdAt.toLocaleDateString()} • {transaction.createdAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="hidden md:block">
                          <div className="text-sm text-gray-500">Customer</div>
                          <div className="font-medium">{transaction.customerName}</div>
                        </div>

                        <div className="hidden md:block">
                          <div className="text-sm text-gray-500">Restaurant</div>
                          <div className="font-medium">{transaction.restaurantName}</div>
                        </div>

                        <div className="hidden md:block">
                          <div className="text-sm text-gray-500">Method</div>
                          <div className="font-medium uppercase">{transaction.paymentMethod}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            transaction.type === 'refund' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'refund' ? '-' : '+'}₹{transaction.amount}
                          </div>
                          <div className="text-sm text-gray-600">{transaction.transactionId}</div>
                        </div>

                        <div>{getStatusBadge(transaction.status)}</div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTransactions.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-4">
          {payoutRequests.map((payout, index) => (
            <motion.div
              key={payout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Wallet className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">{payout.restaurantName}</h3>
                        <p className="text-sm text-gray-600">
                          Requested on {payout.requestedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">₹{payout.amount}</div>
                        <div className="text-sm text-gray-600">{payout.bankDetails.accountNumber}</div>
                      </div>

                      <div>{getStatusBadge(payout.status)}</div>

                      {payout.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePayoutAction(payout.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handlePayoutAction(payout.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {payoutRequests.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payout requests found</h3>
                <p className="text-gray-600">No restaurants have requested payouts yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['card', 'upi', 'wallet', 'cash'].map(method => {
                  const methodTransactions = filteredTransactions.filter(t => t.paymentMethod === method && t.type === 'payment');
                  const count = methodTransactions.length;
                  const amount = methodTransactions.reduce((sum, t) => sum + t.amount, 0);
                  return (
                    <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{method}</div>
                      <div className="text-xs text-green-600">₹{amount}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Status Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Transaction Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['completed', 'pending', 'failed', 'processing'].map(status => {
                  const statusTransactions = filteredTransactions.filter(t => t.status === status);
                  const count = statusTransactions.length;
                  const amount = statusTransactions.reduce((sum, t) => sum + t.amount, 0);
                  return (
                    <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{status}</div>
                      <div className="text-xs text-blue-600">₹{amount}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Restaurants */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Top Performing Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const restaurantStats = filteredTransactions
                    .filter(t => t.type === 'payment' && t.status === 'completed')
                    .reduce((acc, t) => {
                      if (!acc[t.restaurantId]) {
                        acc[t.restaurantId] = {
                          name: t.restaurantName,
                          revenue: 0,
                          transactions: 0
                        };
                      }
                      acc[t.restaurantId].revenue += t.amount;
                      acc[t.restaurantId].transactions += 1;
                      return acc;
                    }, {} as Record<string, { name: string; revenue: number; transactions: number }>);

                  return Object.values(restaurantStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((restaurant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-600">{restaurant.transactions} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">₹{restaurant.revenue}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Transaction ID</span>
                  <p className="font-semibold">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Order Number</span>
                  <p className="font-semibold">{selectedTransaction.orderNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <p className="font-semibold capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Amount</span>
                  <p className="font-semibold text-green-600">₹{selectedTransaction.amount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <p className="font-semibold uppercase">{selectedTransaction.paymentMethod}</p>
                </div>
              </div>

              {selectedTransaction.commission && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Commission Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">Commission: </span>
                      <span className="font-medium">₹{selectedTransaction.commission}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">Platform Fee: </span>
                      <span className="font-medium">₹{selectedTransaction.platformFee}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
