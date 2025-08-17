import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Order {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    restaurantName: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentId: string;
  createdAt: Date;
}

export default function Orders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Order[];
    },
    enabled: !!user
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Orders</h1>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Orders</h1>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-6)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(order.createdAt, 'PPP')}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(order.status)} text-white`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.restaurantName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-medium">₹{order.totalAmount}</span>
                  </div>

                  {/* Payment Info */}
                  <div className="text-sm text-muted-foreground">
                    Payment ID: {order.paymentId}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}