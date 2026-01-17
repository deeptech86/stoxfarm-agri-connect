import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockTransactions, updateTransaction } from '@/lib/mockData';
import { CreditCard, Lock, ArrowLeft, CheckCircle, Building2 } from 'lucide-react';

interface PaymentState {
  bidId: string;
  listingId: string;
  produceName: string;
  sellerName: string;
  sellerId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentData = location.state as PaymentState | null;

  // Form state for card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!paymentData) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast({
        title: 'Invalid Card Number',
        description: 'Please enter a valid 16-digit card number.',
        variant: 'destructive',
      });
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      toast({
        title: 'Invalid Expiry Date',
        description: 'Please enter a valid expiry date (MM/YY).',
        variant: 'destructive',
      });
      return;
    }

    if (!cvv || cvv.length < 3) {
      toast({
        title: 'Invalid CVV',
        description: 'Please enter a valid CVV.',
        variant: 'destructive',
      });
      return;
    }

    if (!cardName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter the name on card.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and update the transaction payment status
    const transaction = mockTransactions.find(
      t => t.buyerId === user?.id &&
           t.produceName === paymentData.produceName &&
           t.paymentStatus === 'pending'
    );

    if (transaction) {
      updateTransaction(transaction.id, { paymentStatus: 'completed' });
    }

    setIsProcessing(false);
    setPaymentSuccess(true);

    toast({
      title: 'Payment Successful',
      description: `Payment of ₹${paymentData.totalAmount.toFixed(2)} completed successfully.`,
    });
  };

  if (paymentSuccess) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment of ₹{paymentData.totalAmount.toFixed(2)} has been processed successfully.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left mb-6">
                <p className="text-sm"><strong>Order:</strong> {paymentData.produceName}</p>
                <p className="text-sm"><strong>Quantity:</strong> {paymentData.quantity} kg</p>
                <p className="text-sm"><strong>Seller:</strong> {paymentData.sellerName}</p>
                <p className="text-sm"><strong>Transaction ID:</strong> TXN{Date.now()}</p>
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-semibold">{paymentData.produceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{paymentData.sellerName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{paymentData.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="font-medium">₹{paymentData.pricePerUnit}/kg</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{paymentData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Includes GST and Platform Fee
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Enter your card information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handlePayment}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        disabled={isProcessing}
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Your payment information is encrypted and secure. We do not store your card details.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay ₹{paymentData.totalAmount.toFixed(2)}
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Powered by StoxxFarm Secure Payments</span>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
