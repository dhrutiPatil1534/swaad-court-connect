import React, { useState, useEffect } from 'react';
import {
  Key,
  Mail,
  Users,
  Store,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  sendVendorPasswordReset,
  sendCustomerPasswordReset,
  getPasswordResetLogs,
  getVendorInfoForPasswordReset
} from '@/lib/firebase';

interface PasswordResetLog {
  id: string;
  email: string;
  userType: 'vendor' | 'customer';
  requestedAt: Date;
  requestedBy: string;
  status: string;
}

export default function PasswordResetManager() {
  const [resetLogs, setResetLogs] = useState<PasswordResetLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetUserType, setResetUserType] = useState<'vendor' | 'customer'>('vendor');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadPasswordResetLogs();
  }, []);

  const loadPasswordResetLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await getPasswordResetLogs();
      setResetLogs(logs);
    } catch (error) {
      console.error('Error loading password reset logs:', error);
      toast.error('Failed to load password reset logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setActionLoading(true);
    try {
      if (resetUserType === 'vendor') {
        // Verify vendor exists first
        const vendorInfo = await getVendorInfoForPasswordReset(resetEmail);
        if (!vendorInfo) {
          toast.error('No vendor found with this email address');
          return;
        }
        await sendVendorPasswordReset(resetEmail);
      } else {
        await sendCustomerPasswordReset(resetEmail);
      }
      
      toast.success(`Password reset email sent to ${resetEmail}`);
      setShowResetDialog(false);
      setResetEmail('');
      
      // Refresh logs
      await loadPasswordResetLogs();
      
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = resetLogs.filter(log => {
    const matchesSearch = log.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.userType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: 'default' as const, color: 'text-green-700 bg-green-100', icon: CheckCircle },
      failed: { variant: 'destructive' as const, color: 'text-red-700 bg-red-100', icon: AlertTriangle },
      pending: { variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-100', icon: Clock }
    };

    const config = variants[status as keyof typeof variants] || variants.sent;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color} gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUserTypeBadge = (userType: string) => {
    const config = userType === 'vendor' 
      ? { color: 'text-blue-700 bg-blue-100', icon: Store }
      : { color: 'text-purple-700 bg-purple-100', icon: Users };
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`text-xs ${config.color} gap-1`}>
        <IconComponent className="w-3 h-3" />
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading password reset logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Secure Password Reset Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Send secure password reset emails to vendors and customers
          </p>
        </div>
        
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Key className="w-4 h-4" />
              Send Password Reset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Secure Password Reset Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Security Best Practice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This sends a secure password reset link via Firebase Auth. 
                      Passwords are never stored or displayed - only secure reset links are sent.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="userType">User Type</Label>
                <Select value={resetUserType} onValueChange={(value: 'vendor' | 'customer') => setResetUserType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Vendor
                      </div>
                    </SelectItem>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Customer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter user email address"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handlePasswordReset}
                  disabled={actionLoading || !resetEmail.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResetDialog(false);
                    setResetEmail('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="vendor">Vendors Only</SelectItem>
                <SelectItem value="customer">Customers Only</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={loadPasswordResetLogs}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Logs */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900">{log.email}</span>
                        {getUserTypeBadge(log.userType)}
                        {getStatusBadge(log.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {log.requestedAt.toLocaleDateString()} at {log.requestedAt.toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Requested by: {log.requestedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No password reset logs found</h3>
              <p className="text-gray-600">
                {searchQuery || typeFilter !== 'all' 
                  ? 'No password reset requests match your current filters.' 
                  : 'No password reset requests have been sent yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}