import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Info, Loader2, FileText, Download } from 'lucide-react';
import { useSellerListings, useSellerBids } from '@/hooks/useListings';
import { useUserTransactions } from '@/hooks/useTransactions';
import ListingCard from '@/components/ListingCard';
import CreateListingDialog from '@/components/CreateListingDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BidManagementDialog from '@/components/BidManagementDialog';
import { Bid, Listing } from '@/types/produce';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';
import { TransactionResponse } from '@/services/transaction.service';
import { generateSellerReceipt, downloadReceipt } from '@/services/receipt.service';
import { useToast } from '@/hooks/use-toast';

type ListingFilterStatus = 'active' | 'expired' | 'all';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('pending');
  const [listingStatusFilter, setListingStatusFilter] = useState<ListingFilterStatus>('active');

  const handleDownloadSellerReceipt = (transaction: TransactionResponse) => {
    const receiptData = {
      transaction,
      buyerDetails: {
        name: transaction.buyer_name,
      },
      sellerDetails: {
        name: transaction.seller_name,
      },
    };

    const doc = generateSellerReceipt(receiptData);
    downloadReceipt(doc, `StoxxFarm_Receipt_Seller_${transaction.transaction_number}.pdf`);

    toast({
      title: t('receipt.downloaded'),
      description: t('receipt.downloadedDesc'),
    });
  };

  // Fetch seller's listings
  const { data: listingsData, isLoading: listingsLoading } = useSellerListings();

  // Fetch seller's bids (pending bids on their listings)
  const { data: bidsData, isLoading: bidsLoading } = useSellerBids(1, 50, 'pending');

  // Fetch all seller's transactions (filter client-side for complex status logic)
  const { data: transactionsData, isLoading: transactionsLoading } = useUserTransactions(
    'seller',
    1,
    50,
    undefined
  );

  const myListings = listingsData?.items || [];
  const pendingBids = bidsData?.items || [];

  // Apply client-side filtering based on payment status
  const allTransactions = transactionsData?.items || [];
  const sellerTransactions = allTransactions.filter(transaction => {
    if (paymentStatusFilter === 'all') return true;
    if (paymentStatusFilter === 'pending') return transaction.payment_status === 'pending';
    if (paymentStatusFilter === 'awaiting_payout') return transaction.payment_status === 'completed' && !transaction.seller_paid;
    if (paymentStatusFilter === 'paid') return transaction.seller_paid === true;
    return true;
  });

  // Check if listing is actually expired based on expires_at date (with defensive handling for invalid dates)
  const isListingExpired = (listing: Listing) => {
    const expiresAt = new Date(listing.expires_at);
    return !isNaN(expiresAt.getTime()) && new Date() > expiresAt;
  };

  // Calculate counts considering actual expiration date
  const activeCount = myListings.filter(l => l.status === 'active' && !isListingExpired(l)).length;
  const expiredCount = myListings.filter(l => l.status === 'expired' || isListingExpired(l)).length;

  // Filter listings based on selected status
  const filteredListings = myListings.filter(listing => {
    const actuallyExpired = isListingExpired(listing);
    const displayStatus = actuallyExpired ? 'expired' : listing.status;

    if (listingStatusFilter === 'all') return true;
    if (listingStatusFilter === 'active') return displayStatus === 'active';
    if (listingStatusFilter === 'expired') return displayStatus === 'expired';
    return true;
  });

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('seller.myListings')}</h1>
          <p className="text-muted-foreground">{t('seller.manageListings')}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('seller.createListing')}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingBids.length}</CardTitle>
            <CardDescription>{t('seller.pendingBids')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
            <CardDescription>{t('seller.activeListings')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{expiredCount}</CardTitle>
            <CardDescription>{t('seller.expiredListings')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{myListings.length}</CardTitle>
            <CardDescription>{t('admin.totalListings')}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Seller Payments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('seller.myPayments')}</CardTitle>
              <CardDescription>{t('seller.trackPayments')}</CardDescription>
            </div>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('common.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('payment.pendingBuyer')}</SelectItem>
                <SelectItem value="awaiting_payout">{t('payment.awaitingPayout')}</SelectItem>
                <SelectItem value="paid">{t('payment.paid')}</SelectItem>
                <SelectItem value="all">{t('common.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sellerTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {paymentStatusFilter === 'all' ? '' : paymentStatusFilter === 'pending' ? 'pending buyer payment' : paymentStatusFilter === 'awaiting_payout' ? 'awaiting payout' : paymentStatusFilter === 'paid' ? 'paid' : ''} payments found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.produce')}</TableHead>
                  <TableHead>{t('common.quantity')}</TableHead>
                  <TableHead>{t('table.rate')}</TableHead>
                  <TableHead>{t('table.yourPayout')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('table.receipt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.produce_name}</TableCell>
                    <TableCell>{transaction.quantity} kg</TableCell>
                    <TableCell>₹{transaction.price_per_unit}/kg</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-green-600">
                          ₹{(transaction.seller_payout_amount || 0).toFixed(2)}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[280px] p-3">
                              <div className="space-y-2 text-sm">
                                <p className="font-semibold border-b pb-1">Payout Breakdown</p>
                                <div className="flex justify-between">
                                  <span>Base Amount:</span>
                                  <span>₹{(transaction.base_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>GST Deduction:</span>
                                  <span>-₹{(transaction.seller_gst_deduction || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                  <span>Platform Fee:</span>
                                  <span>-₹{(transaction.seller_platform_fee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-1 text-green-600">
                                  <span>Your Payout:</span>
                                  <span>₹{(transaction.seller_payout_amount || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.seller_paid ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {t('payment.paid')}
                        </Badge>
                      ) : transaction.payment_status === 'completed' ? (
                        <Badge variant="secondary">{t('payment.awaitingPayout')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('payment.pendingBuyer')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(transaction.payment_status === 'completed' || transaction.seller_paid) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSellerReceipt(transaction)}
                          className="flex items-center gap-1 text-primary hover:text-primary/80"
                        >
                          <FileText className="h-4 w-4" />
                          <Download className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pendingBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('seller.pendingBids')}</CardTitle>
            <CardDescription>{t('seller.reviewBids')}</CardDescription>
          </CardHeader>
          <CardContent>
            {bidsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.produce')}</TableHead>
                    <TableHead>{t('common.quantity')}</TableHead>
                    <TableHead>{t('table.pricePerKg')}</TableHead>
                    <TableHead>{t('common.total')}</TableHead>
                    <TableHead>{t('table.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBids.map(bid => {
                    const listing = myListings.find(l => l.id === bid.listing_id);
                    return (
                      <TableRow key={bid.id}>
                        <TableCell>{listing?.produce_name || '-'}</TableCell>
                        <TableCell>{bid.quantity} kg</TableCell>
                        <TableCell>₹{bid.price_per_unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">₹{bid.total_amount.toFixed(2)}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] p-3">
                                  <div className="space-y-2 text-sm">
                                    <p className="font-semibold border-b pb-1">Amount Breakdown</p>
                                    <div className="flex justify-between">
                                      <span>Total Amount:</span>
                                      <span>₹{bid.total_amount.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      GST and platform fees will be calculated at checkout
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBid(bid);
                              setSelectedListing(listing || null);
                            }}
                          >
                            {t('common.view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('seller.myListings')}</h2>
          <Select value={listingStatusFilter} onValueChange={(value) => setListingStatusFilter(value as ListingFilterStatus)}>
            <SelectTrigger className="w-[180px]" aria-label={t('common.filter')}>
              <SelectValue placeholder={t('common.filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('seller.activeListings')} ({activeCount})</SelectItem>
              <SelectItem value="expired">{t('seller.expiredListings')} ({expiredCount})</SelectItem>
              <SelectItem value="all">{t('admin.allListings')} ({myListings.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {myListings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>{t('seller.noListingsYet')}</p>
              <Button variant="link" onClick={() => setShowCreateDialog(true)}>
                {t('seller.createFirstListing')}
              </Button>
            </CardContent>
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card role="status" aria-live="polite">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>
                {listingStatusFilter === 'active'
                  ? t('seller.noActiveListings')
                  : listingStatusFilter === 'expired'
                  ? t('seller.noExpiredListings')
                  : t('seller.noListingsYet')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions userRole="seller" />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Tracking */}
      <DeliveryTrackingList filterByRole="seller" userId={user?.id} />

      <CreateListingDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {selectedBid && (
        <BidManagementDialog
          bid={selectedBid}
          produceName={selectedListing?.produce_name || ''}
          sellerId={user?.id || ''}
          open={!!selectedBid}
          onOpenChange={(open) => !open && setSelectedBid(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
