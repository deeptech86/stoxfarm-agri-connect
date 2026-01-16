import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockListings, mockTransactions, produceList, mockUsers, mockSatelliteCenters, markSellerPaid } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';
import AdminUserManagement from '@/components/AdminUserManagement';
import SatelliteCenterManagement from '@/components/SatelliteCenterManagement';
import { useToast } from '@/hooks/use-toast';
import { Banknote } from 'lucide-react';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [filterProduce, setFilterProduce] = useState('all');
  const [, forceUpdate] = useState(0);

  const handlePaySeller = (transactionId: string, sellerName: string, amount: number) => {
    markSellerPaid(transactionId);
    forceUpdate(n => n + 1);
    toast({
      title: 'Seller Paid',
      description: `₹${amount.toFixed(2)} has been paid to ${sellerName}.`,
    });
  };
  
  const activeListings = mockListings.filter(l => {
    const isExpired = new Date() > new Date(l.expiresAt);
    return l.status === 'active' && !isExpired;
  });
  
  const expiredListings = mockListings.filter(l => {
    const isExpired = new Date() > new Date(l.expiresAt);
    return isExpired || l.status === 'expired';
  });
  
  const filteredActive = filterProduce === 'all'
    ? activeListings
    : activeListings.filter(l => l.produceName === filterProduce);
  
  const filteredExpired = filterProduce === 'all'
    ? expiredListings
    : expiredListings.filter(l => l.produceName === filterProduce);

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
            <CardTitle className="text-2xl">{mockTransactions.length}</CardTitle>
            <CardDescription>Total Transactions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{mockListings.length}</CardTitle>
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
                {produceList.map(p => (
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
                  {mockTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockTransactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{t.sellerName}</TableCell>
                        <TableCell>{t.buyerName}</TableCell>
                        <TableCell>{t.produceName}</TableCell>
                        <TableCell>{t.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={t.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                            {t.paymentStatus === 'completed' ? 'Payment Completed' : 'Pending Payment'}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{t.buyerPaidAmount?.toFixed(2) || t.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>₹{t.sellerPayoutAmount?.toFixed(2) || t.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {t.sellerPaid ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Paid
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={t.paymentStatus !== 'completed'}
                              onClick={() => handlePaySeller(t.id, t.sellerName, t.sellerPayoutAmount || t.totalAmount)}
                            >
                              <Banknote className="h-4 w-4 mr-1" />
                              Pay Seller
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
          <p className="text-muted-foreground">Create, modify, or delete users ({mockUsers.length} total)</p>
        </div>
        <AdminUserManagement />
      </div>

      {/* Satellite Center Management Section */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Satellite Center Management</h2>
          <p className="text-muted-foreground">Manage regional collection and distribution centers ({mockSatelliteCenters.length} total)</p>
        </div>
        <SatelliteCenterManagement />
      </div>
  </div>
  );
};

export default AdminDashboard;
