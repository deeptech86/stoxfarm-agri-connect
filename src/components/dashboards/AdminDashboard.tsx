import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockListings, mockTransactions, produceList, mockUsers } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';
import AdminUserManagement from '@/components/AdminUserManagement';

const AdminDashboard = () => {
  const [filterProduce, setFilterProduce] = useState('all');
  
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
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                        <TableCell>₹{t.totalAmount}</TableCell>
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
  </div>
  );
};

export default AdminDashboard;
