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

const AdminDashboard = () => {
  const { toast } = useToast();
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
        title: 'Seller Paid',
        description: `₹${amount.toFixed(2)} has been paid to ${sellerName}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark seller as paid.',
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage listings and monitor transactions</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeListings.length}</CardTitle>
            <CardDescription>Active Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{expiredListings.length}</CardTitle>
            <CardDescription>Expired Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{transactions.length}</CardTitle>
            <CardDescription>Total Transactions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{allListings.length}</CardTitle>
            <CardDescription>All Listings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Produce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="filter-produce">Produce Type</Label>
            <Select value={filterProduce} onValueChange={setFilterProduce}>
              <SelectTrigger id="filter-produce">
                <SelectValue placeholder="All produce" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Produce</SelectItem>
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
          <TabsTrigger value="active">Active ({filteredActive.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({filteredExpired.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
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
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All confirmed transactions</CardDescription>
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
                      <TableHead>Seller</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Produce</TableHead>
                      <TableHead>Qty (kg)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Buyer Paid (₹)</TableHead>
                      <TableHead>Seller Payout (₹)</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No transactions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map(t => (
                        <TableRow key={t.id}>
                          <TableCell>{t.seller_name}</TableCell>
                          <TableCell>{t.buyer_name}</TableCell>
                          <TableCell>{t.produce_name}</TableCell>
                          <TableCell>{t.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={t.payment_status === 'completed' ? 'default' : 'secondary'}>
                              {t.payment_status === 'completed' ? 'Payment Completed' : 'Pending Payment'}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{t.buyer_total_amount.toFixed(2)}</TableCell>
                          <TableCell>₹{t.seller_payout_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {t.seller_paid ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Paid
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={t.payment_status !== 'completed' || markSellerPaidMutation.isPending}
                                onClick={() => handlePaySeller(t.id, t.seller_name, t.seller_payout_amount)}
                              >
                                {markSellerPaidMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Banknote className="h-4 w-4 mr-1" />
                                )}
                                Pay Seller
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
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Create, modify, or delete users ({users.length} total)</p>
        </div>
        <AdminUserManagement />
      </div>

      {/* Satellite Center Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Satellite Center Management</h2>
          <p className="text-muted-foreground">Manage regional collection and distribution centers</p>
        </div>
        <SatelliteCenterManagement />
      </div>

      {/* Produce Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Produce Management</h2>
          <p className="text-muted-foreground">Create, edit, or delete produce items available for listing</p>
        </div>
        <ProduceManagement />
      </div>

      {/* Listing Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Listing Management</h2>
          <p className="text-muted-foreground">Create and manage marketplace listings on behalf of sellers</p>
        </div>
        <ListingManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;
