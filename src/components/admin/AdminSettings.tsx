import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Shield, 
  Users, 
  Key, 
  Bell,
  Database,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Percent,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
}

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  businessHours: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  commissionRate: number;
  deliveryFee: number;
  minimumOrderAmount: number;
  maxDeliveryRadius: number;
}

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Swaad Court Connect',
    siteDescription: 'Your favorite food court delivery platform',
    supportEmail: 'support@swaadcourtconnect.com',
    supportPhone: '+91 9876543210',
    address: '123 Food Street, Bangalore, Karnataka 560001',
    businessHours: '9:00 AM - 11:00 PM',
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    smsNotifications: true,
    commissionRate: 15,
    deliveryFee: 30,
    minimumOrderAmount: 100,
    maxDeliveryRadius: 10
  });
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    role: 'admin' as const,
    permissions: [] as string[]
  });

  const availablePermissions = [
    'manage_users',
    'manage_restaurants',
    'manage_orders',
    'manage_payments',
    'manage_notifications',
    'view_analytics',
    'manage_settings',
    'manage_admins'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with Firebase queries
      const mockAdminUsers: AdminUser[] = [
        {
          id: '1',
          email: 'admin@swaadcourtconnect.com',
          name: 'Platform Administrator',
          role: 'super_admin',
          permissions: availablePermissions,
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          email: 'moderator@swaadcourtconnect.com',
          name: 'Content Moderator',
          role: 'moderator',
          permissions: ['manage_users', 'manage_restaurants', 'view_analytics'],
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ];

      setAdminUsers(mockAdminUsers);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      // Mock save - replace with Firebase update
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const admin: AdminUser = {
        id: Date.now().toString(),
        ...newAdmin,
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date()
      };

      setAdminUsers(prev => [...prev, admin]);
      setNewAdmin({
        email: '',
        name: '',
        role: 'admin',
        permissions: []
      });
      setIsCreateAdminOpen(false);
      toast.success('Admin user created successfully');
    } catch (error) {
      toast.error('Failed to create admin user');
    }
  };

  const toggleAdminStatus = (adminId: string) => {
    setAdminUsers(prev => 
      prev.map(admin => 
        admin.id === adminId ? { ...admin, isActive: !admin.isActive } : admin
      )
    );
    toast.success('Admin status updated');
  };

  const deleteAdmin = (adminId: string) => {
    setAdminUsers(prev => prev.filter(admin => admin.id !== adminId));
    toast.success('Admin user deleted');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      case 'moderator': return 'outline';
      default: return 'outline';
    }
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
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Manage platform settings and admin users</p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="business">
            <DollarSign className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Basic information about your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Support Email</label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Site Description</label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Support Phone</label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Business Hours</label>
                  <Input
                    value={settings.businessHours}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Controls</CardTitle>
              <CardDescription>Control platform availability and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Temporarily disable the platform for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow New Registrations</p>
                  <p className="text-sm text-muted-foreground">Allow new users to register on the platform</p>
                </div>
                <Switch
                  checked={settings.allowRegistrations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistrations: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure business rules and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Commission Rate (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Order Amount (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.minimumOrderAmount}
                    onChange={(e) => setSettings(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Delivery Radius (km)</label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.maxDeliveryRadius}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxDeliveryRadius: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how the platform sends notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Admin Users</h3>
              <p className="text-sm text-muted-foreground">Manage admin users and their permissions</p>
            </div>
            <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Admin User</DialogTitle>
                  <DialogDescription>Add a new admin user to the platform</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Admin Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={newAdmin.role} onValueChange={(value: any) => setNewAdmin(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createAdmin} className="flex-1">Create Admin</Button>
                    <Button variant="outline" onClick={() => setIsCreateAdminOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {adminUsers.map((admin) => (
              <Card key={admin.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{admin.name}</CardTitle>
                      <CardDescription>{admin.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(admin.role)}>
                        {admin.role.replace('_', ' ')}
                      </Badge>
                      <Badge variant={admin.isActive ? "default" : "secondary"}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last login: {admin.lastLogin.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAdminStatus(admin.id)}
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        {admin.role !== 'super_admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAdmin(admin.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
