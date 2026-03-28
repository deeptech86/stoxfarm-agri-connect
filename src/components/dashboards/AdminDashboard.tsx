import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActiveListings, useProduceList } from '@/hooks/useListings';
import { useAllTransactions, useMarkSellerPaid } from '@/hooks/useTransactions';
import { useUsers } from '@/hooks/useUsers';
import ListingCard from '@/components/ListingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';
import AdminUserManagement from '@/components/AdminUserManagement';
import SatelliteCenterManagement from '@/components/SatelliteCenterManagement';
import ProduceManagement from '@/components/ProduceManagement';
import ListingManagement from '@/components/ListingManagement';
import { useToast } from '@/hooks/use-toast';
import { Banknote, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminDashboard = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [filterProduce, setFilterProduce] = useState('all');

  // Fetch data
  const { data: produceList } = useProduceList();
  const { data: listingsData, isLoading: listingsLoading } = useActiveListings(1, 100);
  const { data: transactionsData, isLoading: transactionsLoading } = useAllTransactions(1, 100);
  const { data: usersData } = useUsers(1, 100, undefined, true);
  const markSellerPaidMutation = useMarkSellerPaid();

  const allListings = listingsData?.items || [];
  const transactions = transactionsData?.items || [];
  const users = usersData?.items || [];

  const activeListings = allListings.filter(l => l.status === 'active');
  const expiredListings = allListings.filter(l => l.status === 'expired' || l.status === 'cancelled');

  const filteredActive = filterProduce === 'all'
    ? activeListings
    : activeListings.filter(l => l.produce_name === filterProduce);

  const filteredExpired = filterProduce === 'all'
    ? expiredListings
    : expiredListings.filter(l => l.produce_name === filterProduce);

  const handlePaySeller = async (transactionId: string, sellerName: string, amount: number) => {
    try {
      await markSellerPaidMutation.mutateAsync({ transactionId });
      toast({
        title: t('common.success'),
        description: `₹${amount.toFixed(2)} ${t('payment.paidToSeller')} ${sellerName}.`,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.error'),
        variant: 'destructive',
      });
    }
  };

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">{t('admin.manageListings')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeListings.length}</CardTitle>
            <CardDescription>{t('seller.activeListings')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{expiredListings.length}</CardTitle>
            <CardDescription>{t('seller.expiredListings')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{transactions.length}</CardTitle>
            <CardDescription>{t('admin.totalTransactions')}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{allListings.length}</CardTitle>
            <CardDescription>{t('admin.allListings')}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('common.filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="filter-produce">{t('produce.category')}</Label>
            <Select value={filterProduce} onValueChange={setFilterProduce}>
              <SelectTrigger id="filter-produce">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {produceList?.filter(p => p.is_active).map(p => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="active">{t('common.active')} ({filteredActive.length})</TabsTrigger>
          <TabsTrigger value="expired">{t('listing.expired')} ({filteredExpired.length})</TabsTrigger>
          <TabsTrigger value="transactions">{t('admin.totalTransactions')}</TabsTrigger>
          <TabsTrigger value="tracking">{t('common.status')}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActive.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions={false} userRole="admin" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExpired.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions={false} userRole="admin" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.allTransactions')}</CardTitle>
              <CardDescription>{t('common.completed')}</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('seller.dashboard')}</TableHead>
                      <TableHead>{t('buyer.dashboard')}</TableHead>
                      <TableHead>{t('produce.title')}</TableHead>
                      <TableHead>{t('common.quantity')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('payment.awaitingPayout')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          {t('common.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.seller_name}</TableCell>
                          <TableCell>{tx.buyer_name}</TableCell>
                          <TableCell>{tx.produce_name}</TableCell>
                          <TableCell>{tx.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={tx.payment_status === 'completed' ? 'default' : 'secondary'}>
                              {tx.payment_status === 'completed' ? t('common.completed') : t('common.pending')}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{tx.buyer_total_amount.toFixed(2)}</TableCell>
                          <TableCell>₹{tx.seller_payout_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {tx.seller_paid ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {t('payment.paidToSeller')}
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={tx.payment_status !== 'completed' || markSellerPaidMutation.isPending}
                                onClick={() => handlePaySeller(tx.id, tx.seller_name, tx.seller_payout_amount)}
                              >
                                {markSellerPaidMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Banknote className="h-4 w-4 mr-1" />
                                )}
                                {t('payment.markAsPaid')}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <DeliveryTrackingList filterByRole="admin" />
        </TabsContent>
      </Tabs>

      {/* User Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('admin.manageUsers')}</h2>
          <p className="text-muted-foreground">{t('common.total')}: {users.length}</p>
        </div>
        <AdminUserManagement />
      </div>

      {/* Satellite Center Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('admin.manageCenters')}</h2>
          <p className="text-muted-foreground">{t('admin.manageCenters')}</p>
        </div>
        <SatelliteCenterManagement />
      </div>

      {/* Produce Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('admin.manageProduce')}</h2>
          <p className="text-muted-foreground">{t('produce.description')}</p>
        </div>
        <ProduceManagement />
      </div>

      {/* Listing Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('admin.totalListings')}</h2>
          <p className="text-muted-foreground">{t('admin.manageListings')}</p>
        </div>
        <ListingManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
