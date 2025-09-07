import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Users, 
  Store, 
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipients: 'all' | 'customers' | 'vendors';
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  readCount: number;
  totalRecipients: number;
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  type: 'support' | 'complaint' | 'inquiry' | 'feedback';
  status: 'unread' | 'read' | 'replied' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export default function NotificationsCommunication() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipients: 'all' as const,
    scheduledAt: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with Firebase queries
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'System Maintenance Notice',
          message: 'Scheduled maintenance will occur on Sunday from 2 AM to 4 AM.',
          type: 'warning',
          recipients: 'all',
          status: 'sent',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          readCount: 1234,
          totalRecipients: 1500
        },
        {
          id: '2',
          title: 'New Restaurant Added',
          message: 'Welcome our new partner restaurant "Spice Garden" to the platform!',
          type: 'success',
          recipients: 'customers',
          status: 'sent',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          readCount: 856,
          totalRecipients: 2100
        },
        {
          id: '3',
          title: 'Holiday Special Offers',
          message: 'Get ready for amazing discounts this festive season!',
          type: 'info',
          recipients: 'all',
          status: 'scheduled',
          createdAt: new Date(),
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          readCount: 0,
          totalRecipients: 3500
        }
      ];

      const mockMessages: Message[] = [
        {
          id: '1',
          from: 'john.doe@email.com',
          to: 'support@swaadcourtconnect.com',
          subject: 'Order delivery issue',
          content: 'My order #ORD-2024-001 was not delivered on time. Please help.',
          type: 'complaint',
          status: 'unread',
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          from: 'restaurant@pizzapalace.com',
          to: 'support@swaadcourtconnect.com',
          subject: 'Payment settlement query',
          content: 'When will the payment for last week\'s orders be settled?',
          type: 'inquiry',
          status: 'replied',
          priority: 'medium',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: '3',
          from: 'customer@email.com',
          to: 'support@swaadcourtconnect.com',
          subject: 'Great service!',
          content: 'I wanted to thank you for the excellent service. The food was amazing!',
          type: 'feedback',
          status: 'read',
          priority: 'low',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ];

      setNotifications(mockNotifications);
      setMessages(mockMessages);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock sending - replace with Firebase function
      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        status: newNotification.scheduledAt ? 'scheduled' : 'sent',
        createdAt: new Date(),
        sentAt: newNotification.scheduledAt ? undefined : new Date(),
        scheduledAt: newNotification.scheduledAt ? new Date(newNotification.scheduledAt) : undefined,
        readCount: 0,
        totalRecipients: newNotification.recipients === 'all' ? 3500 : 
                        newNotification.recipients === 'customers' ? 2100 : 1400
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        scheduledAt: ''
      });
      setIsCreateDialogOpen(false);
      toast.success(newNotification.scheduledAt ? 'Notification scheduled successfully' : 'Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' as const, updatedAt: new Date() } : msg
      )
    );
    toast.success('Message marked as read');
  };

  const replyToMessage = (messageId: string) => {
    toast.success('Reply sent successfully');
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied' as const, updatedAt: new Date() } : msg
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || notification.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || message.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-3xl font-bold">Notifications & Communication</h1>
          <p className="text-muted-foreground">Manage platform communications and user messages</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>Send a notification to users on the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <Select value={newNotification.recipients} onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, recipients: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="vendors">Vendors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Schedule (Optional)</label>
                <Input
                  type="datetime-local"
                  value={newNotification.scheduledAt}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={sendNotification} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {newNotification.scheduledAt ? 'Schedule' : 'Send Now'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search notifications and messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(notification.status)}
                      <div>
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <CardDescription>
                          To: {notification.recipients} • {notification.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(notification.type)}>{notification.type}</Badge>
                      <Badge variant="outline">{notification.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {notification.status === 'sent' && (
                        <>Read by {notification.readCount} of {notification.totalRecipients} recipients</>
                      )}
                      {notification.status === 'scheduled' && (
                        <>Scheduled for {notification.scheduledAt?.toLocaleString()}</>
                      )}
                    </span>
                    <div className="flex gap-2">
                      {notification.recipients === 'all' && <Users className="h-3 w-3" />}
                      {notification.recipients === 'vendors' && <Store className="h-3 w-3" />}
                      {notification.recipients === 'customers' && <Users className="h-3 w-3" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <CardDescription>
                        From: {message.from} • {message.createdAt.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(message.priority)}>{message.priority}</Badge>
                      <Badge variant="outline">{message.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{message.content}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{message.type}</Badge>
                    <div className="flex gap-2">
                      {message.status === 'unread' && (
                        <Button size="sm" variant="outline" onClick={() => markMessageAsRead(message.id)}>
                          Mark as Read
                        </Button>
                      )}
                      <Button size="sm" onClick={() => replyToMessage(message.id)}>
                        <Mail className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
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
