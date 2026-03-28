import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock, ArrowLeft, CheckCircle, Building2, Loader2, Download, FileText } from 'lucide-react';
import { transactionService, TransactionResponse } from '@/services/transaction.service';
import { paymentService, RazorpaySuccessResponse, RazorpayErrorResponse } from '@/services/payment.service';
import { generateBuyerReceipt, generateSellerReceipt, downloadReceipt } from '@/services/receipt.service';

interface PaymentState {
  transactionId: string;
  produceName: string;
  sellerName: string;
  sellerId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}

const Payment = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<TransactionResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentData = location.state as PaymentState | null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!paymentData) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRazorpayPayment = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const orderData = await paymentService.createOrder(paymentData.transactionId);

      // Open Razorpay checkout
      await paymentService.openCheckout(
        orderData,
        {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        },
        async (response: RazorpaySuccessResponse) => {
          // Payment successful - verify with backend
          try {
            await paymentService.verifyPayment({
              transaction_id: paymentData.transactionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Fetch transaction details for receipt
            try {
              const transaction = await transactionService.getTransaction(paymentData.transactionId);
              setCompletedTransaction(transaction);
            } catch {
              console.error('Failed to fetch transaction details for receipt');
            }

            setPaymentSuccess(true);
            toast({
              title: t('paymentPage.success'),
              description: t('paymentPage.successDesc'),
            });
          } catch (error) {
            toast({
              title: t('paymentPage.failed'),
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive',
            });
          }
          setIsProcessing(false);
        },
        (error: RazorpayErrorResponse) => {
          // Payment failed
          toast({
            title: t('paymentPage.failed'),
            description: error.description || 'Payment failed. Please try again.',
            variant: 'destructive',
          });
          setIsProcessing(false);
        },
        () => {
          // Payment dismissed
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: t('paymentPage.failed'),
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleDownloadBuyerReceipt = () => {
    if (!completedTransaction) return;

    const receiptData = {
      transaction: completedTransaction,
      buyerDetails: {
        name: completedTransaction.buyer_name,
      },
      sellerDetails: {
        name: completedTransaction.seller_name,
      },
    };

    const doc = generateBuyerReceipt(receiptData);
    downloadReceipt(doc, `StoxxFarm_Receipt_Buyer_${completedTransaction.transaction_number}.pdf`);

    toast({
      title: t('receipt.downloaded'),
      description: t('receipt.downloadedDesc'),
    });
  };

  const handleDownloadSellerReceipt = () => {
    if (!completedTransaction) return;

    const receiptData = {
      transaction: completedTransaction,
      buyerDetails: {
        name: completedTransaction.buyer_name,
      },
      sellerDetails: {
        name: completedTransaction.seller_name,
      },
    };

    const doc = generateSellerReceipt(receiptData);
    downloadReceipt(doc, `StoxxFarm_Receipt_Seller_${completedTransaction.transaction_number}.pdf`);

    toast({
      title: t('receipt.downloaded'),
      description: t('receipt.downloadedDesc'),
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
              <h2 className="text-2xl font-bold text-green-800 mb-2">{t('paymentPage.success')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('paymentPage.successDesc')}
              </p>
              <div className="bg-muted p-4 rounded-lg text-left mb-6">
                <p className="text-sm"><strong>{t('paymentPage.order')}</strong> {paymentData.produceName}</p>
                <p className="text-sm"><strong>{t('common.quantity')}:</strong> {paymentData.quantity} kg</p>
                <p className="text-sm"><strong>{t('paymentPage.seller')}:</strong> {paymentData.sellerName}</p>
                <p className="text-sm"><strong>{t('paymentPage.transactionId')}</strong> {completedTransaction?.transaction_number || `TXN${Date.now()}`}</p>
              </div>

              {/* Receipt Download Section */}
              {completedTransaction && (
                <div className="mb-6">
                  <Separator className="mb-4" />
                  <p className="text-sm text-muted-foreground mb-3">{t('paymentPage.downloadReceipts')}</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadBuyerReceipt}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {t('paymentPage.buyerReceipt')}
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSellerReceipt}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {t('paymentPage.sellerReceipt')}
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={() => navigate('/dashboard')} className="w-full">
                {t('layout.backToDashboard')}
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
          {t('layout.backToDashboard')}
        </Button>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('paymentPage.title')}</CardTitle>
                <CardDescription>{t('paymentPage.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('paymentPage.product')}</p>
                  <p className="font-semibold">{paymentData.produceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('paymentPage.seller')}</p>
                  <p className="font-medium">{paymentData.sellerName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.quantity')}</p>
                    <p className="font-medium">{paymentData.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('paymentPage.rate')}</p>
                    <p className="font-medium">₹{paymentData.pricePerUnit}/kg</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{t('paymentPage.totalAmount')}</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{paymentData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('paymentPage.gstNote')}
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
                    <CardTitle>{t('paymentPage.paymentDetails')}</CardTitle>
                    <CardDescription>Pay securely with Razorpay</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                      <p className="font-semibold">Razorpay Secure Checkout</p>
                      <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking & More</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white p-2 rounded border text-center text-xs font-medium">UPI</div>
                    <div className="bg-white p-2 rounded border text-center text-xs font-medium">Cards</div>
                    <div className="bg-white p-2 rounded border text-center text-xs font-medium">NetBanking</div>
                    <div className="bg-white p-2 rounded border text-center text-xs font-medium">Wallets</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Lock className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700">
                    {t('paymentPage.secureNote')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  onClick={handleRazorpayPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('paymentPage.processing')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {t('paymentPage.pay')} ₹{paymentData.totalAmount.toFixed(2)}
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Powered by Razorpay</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
