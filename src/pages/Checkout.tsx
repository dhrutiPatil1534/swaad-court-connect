import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { createOrder } from '@/lib/firebase';
import { ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { getTotalPrice, items, clearCart } = useCart();
  const { user } = useAuth();
  
  const totalAmount = getTotalPrice();
  const taxes = (totalAmount * 0.05).toFixed(2); // 5% tax
  const finalAmount = (parseFloat(totalAmount.toString()) + parseFloat(taxes)).toFixed(2);

  const initializeRazorpay = async () => {
    const options = {
      key: 'rzp_test_R6PClkhg7vdR36',
      amount: Math.round(parseFloat(finalAmount) * 100), // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Swaad Court',
      description: 'Food Order Payment',
      handler: async function (response: any) {
        // Handle successful payment
        if (response.razorpay_payment_id) {
          try {
            // Create order in Firestore
            const orderData = {
              userId: user?.uid || '',
              restaurantId: items[0]?.restaurantId || 'swaad_court_main',
              restaurantName: items[0]?.restaurantName || 'Swaad Court',
              restaurantImage: items[0]?.restaurantImage || '',
              items: items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.totalPrice,
                image: item.image,
                category: item.category || 'Food'
              })),
              pricing: {
                subtotal: totalAmount,
                taxes: parseFloat(taxes),
                deliveryFee: 0,
                discount: 0,
                totalAmount: parseFloat(finalAmount)
              },
              payment: {
                method: 'Razorpay',
                status: 'Completed',
                transactionId: response.razorpay_payment_id,
                paidAt: new Date().toISOString()
              },
              dineIn: {
                tableNumber: '12', // Default table number
                seatingArea: 'Main Hall',
                guestCount: 1
              },
              notes: '',
              source: 'mobile_app'
            };

            const orderId = await createOrder(orderData);
            console.log('Order created successfully:', orderId);

            // Clear cart and redirect to success page
            clearCart();
            navigate('/order-success', { 
              state: { 
                paymentId: response.razorpay_payment_id,
                orderId: orderId,
                amount: finalAmount
              }
            });
          } catch (error) {
            console.error('Error creating order:', error);
            // Still redirect to success page even if order creation fails
            clearCart();
            navigate('/order-success', { 
              state: { 
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: finalAmount
              }
            });
          }
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#f97316'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.uniqueId} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{item.totalPrice.toFixed(2)}</p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees (5%)</span>
                    <span>₹{taxes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={initializeRazorpay}
                >
                  Pay ₹{finalAmount}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By proceeding with the payment, you agree to our terms and conditions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}