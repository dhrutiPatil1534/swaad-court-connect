import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  Ban,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  getAllVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  activateVendor,
  updateVendorCommission,
  getVendorStats
} from '@/lib/firebase';

interface Vendor {
  id: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  cuisine: string[];
  logo?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  commissionRate: number;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  suspendedAt?: Date;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
  documents?: {
    businessLicense?: string;
    foodLicense?: string;
    gstCertificate?: string;
  };
  rejectionReason?: string;
  suspensionReason?: string;
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, statusFilter, searchQuery]);

  const loadVendors = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual Firebase query
      const mockVendors: Vendor[] = [
        {
          id: '1',
          businessName: 'Pizza Palace',
          email: 'owner@pizzapalace.com',
          phone: '+91 9876543210',
          address: '123 Food Street, Mumbai',
          cuisine: ['Italian', 'Continental'],
          logo: '/api/placeholder/100/100',
          status: 'pending',
          commissionRate: 10,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          stats: {
            totalOrders: 0,
            totalRevenue: 0,
            averageRating: 0,
            completionRate: 0
          },
          documents: {
            businessLicense: 'doc1.pdf',
            foodLicense: 'doc2.pdf',
            gstCertificate: 'doc3.pdf'
          }
        },
        {
          id: '2',
          businessName: 'Spice Garden',
          email: 'contact@spicegarden.com',
          phone: '+91 9876543211',
          address: '456 Curry Lane, Delhi',
          cuisine: ['Indian', 'North Indian'],
          logo: '/api/placeholder/100/100',
          status: 'approved',
          commissionRate: 12,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          stats: {
            totalOrders: 245,
            totalRevenue: 125000,
            averageRating: 4.5,
            completionRate: 92
          }
        },
        {
          id: '3',
          businessName: 'Burger Hub',
          email: 'info@burgerhub.com',
          phone: '+91 9876543212',
          address: '789 Fast Food Ave, Bangalore',
          cuisine: ['American', 'Fast Food'],
          status: 'suspended',
          commissionRate: 8,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          suspendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          suspensionReason: 'Multiple customer complaints about food quality',
          stats: {
            totalOrders: 89,
            totalRevenue: 45000,
            averageRating: 2.8,
            completionRate: 65
          }
        },
        {
          id: '4',
          businessName: 'Healthy Bites',
          email: 'hello@healthybites.com',
          phone: '+91 9876543213',
          address: '321 Green Street, Pune',
          cuisine: ['Healthy', 'Salads'],
          status: 'rejected',
          commissionRate: 0,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          rejectedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          rejectionReason: 'Incomplete documentation and invalid food license',
          stats: {
            totalOrders: 0,
            totalRevenue: 0,
            averageRating: 0,
            completionRate: 0
          }
        }
      ];
      
      setVendors(mockVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredVendors(filtered);
  };

  const handleApproveVendor = async (vendorId: string) => {
    setActionLoading(vendorId);
    try {
      await approveVendor(vendorId, commissionRate);
      setVendors(prev => prev.map(vendor =>
        vendor.id === vendorId
          ? { ...vendor, status: 'approved' as const, approvedAt: new Date(), commissionRate }
          : vendor
      ));
      toast.success('Vendor approved successfully');
      setShowApprovalDialog(false);
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(vendorId);
    try {
      await rejectVendor(vendorId, rejectionReason);
      setVendors(prev => prev.map(vendor =>
        vendor.id === vendorId
          ? { ...vendor, status: 'rejected' as const, rejectedAt: new Date(), rejectionReason }
          : vendor
      ));
      toast.success('Vendor rejected');
      setShowRejectionDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    if (!suspensionReason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }

    setActionLoading(vendorId);
    try {
      await suspendVendor(vendorId, suspensionReason);
      setVendors(prev => prev.map(vendor =>
        vendor.id === vendorId
          ? { ...vendor, status: 'suspended' as const, suspendedAt: new Date(), suspensionReason }
          : vendor
      ));
      toast.success('Vendor suspended');
      setShowSuspensionDialog(false);
      setSuspensionReason('');
    } catch (error) {
      console.error('Error suspending vendor:', error);
      toast.error('Failed to suspend vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateVendor = async (vendorId: string) => {
    setActionLoading(vendorId);
    try {
      await activateVendor(vendorId);
      setVendors(prev => prev.map(vendor =>
        vendor.id === vendorId
          ? { ...vendor, status: 'approved' as const, suspendedAt: undefined, suspensionReason: undefined }
          : vendor
      ));
      toast.success('Vendor activated successfully');
    } catch (error) {
      console.error('Error activating vendor:', error);
      toast.error('Failed to activate vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-100' },
      approved: { variant: 'default' as const, color: 'text-green-700 bg-green-100' },
      rejected: { variant: 'destructive' as const, color: 'text-red-700 bg-red-100' },
      suspended: { variant: 'destructive' as const, color: 'text-orange-700 bg-orange-100' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVendorStats = () => {
    return {
      total: vendors.length,
      pending: vendors.filter(v => v.status === 'pending').length,
      approved: vendors.filter(v => v.status === 'approved').length,
      suspended: vendors.filter(v => v.status === 'suspended').length,
      rejected: vendors.filter(v => v.status === 'rejected').length
    };
  };

  const stats = getVendorStats();

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
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600">Manage vendor applications and accounts</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadVendors} className="gap-2">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Vendors</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.suspended}</div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vendors by name, email, or cuisine..."
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
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Vendor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={vendor.logo} />
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-lg font-semibold">
                              {vendor.businessName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{vendor.businessName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(vendor.status)}
                              {getStatusBadge(vendor.status)}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {vendor.cuisine.map((c, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {vendor.email}
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {vendor.phone}
                          </div>
                        )}
                        {vendor.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {vendor.address}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          Commission: {vendor.commissionRate}%
                        </div>
                      </div>

                      {/* Performance Stats */}
                      {vendor.status === 'approved' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{vendor.stats.totalOrders}</div>
                            <div className="text-xs text-gray-600">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">₹{vendor.stats.totalRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {vendor.stats.averageRating}
                            </div>
                            <div className="text-xs text-gray-600">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{vendor.stats.completionRate}%</div>
                            <div className="text-xs text-gray-600">Completion</div>
                          </div>
                        </div>
                      )}

                      {/* Status-specific messages */}
                      {vendor.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-600">{vendor.rejectionReason}</p>
                        </div>
                      )}

                      {vendor.suspensionReason && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Ban className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">Suspension Reason</span>
                          </div>
                          <p className="text-sm text-orange-600">{vendor.suspensionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedVendor(vendor)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>

                      {vendor.status === 'pending' && (
                        <>
                          <Dialog open={showApprovalDialog && selectedVendor?.id === vendor.id} onOpenChange={setShowApprovalDialog}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setSelectedVendor(vendor)}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                                disabled={actionLoading === vendor.id}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Vendor</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="commission">Commission Rate (%)</Label>
                                  <Input
                                    id="commission"
                                    type="number"
                                    value={commissionRate}
                                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                                    min="0"
                                    max="30"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleApproveVendor(vendor.id)}
                                    disabled={actionLoading === vendor.id}
                                    className="flex-1"
                                  >
                                    Confirm Approval
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowApprovalDialog(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showRejectionDialog && selectedVendor?.id === vendor.id} onOpenChange={setShowRejectionDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                onClick={() => setSelectedVendor(vendor)}
                                className="gap-2"
                                disabled={actionLoading === vendor.id}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Vendor Application</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a detailed reason for rejection..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRejectVendor(vendor.id)}
                                    disabled={actionLoading === vendor.id || !rejectionReason.trim()}
                                    className="flex-1"
                                  >
                                    Confirm Rejection
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowRejectionDialog(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {vendor.status === 'approved' && (
                        <Dialog open={showSuspensionDialog && selectedVendor?.id === vendor.id} onOpenChange={setShowSuspensionDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              onClick={() => setSelectedVendor(vendor)}
                              className="gap-2"
                              disabled={actionLoading === vendor.id}
                            >
                              <Pause className="w-4 h-4" />
                              Suspend
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Suspend Vendor</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="suspension-reason">Suspension Reason</Label>
                                <Textarea
                                  id="suspension-reason"
                                  value={suspensionReason}
                                  onChange={(e) => setSuspensionReason(e.target.value)}
                                  placeholder="Please provide a reason for suspension..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleSuspendVendor(vendor.id)}
                                  disabled={actionLoading === vendor.id || !suspensionReason.trim()}
                                  className="flex-1"
                                >
                                  Confirm Suspension
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowSuspensionDialog(false)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {vendor.status === 'suspended' && (
                        <Button
                          onClick={() => handleActivateVendor(vendor.id)}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          disabled={actionLoading === vendor.id}
                        >
                          <Play className="w-4 h-4" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredVendors.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'No vendors registered yet.' 
                  : `No ${statusFilter} vendors found.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
