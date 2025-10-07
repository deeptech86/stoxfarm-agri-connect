import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockListings, mockTransactions, produceList } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard = () => {
  const [filterProduce, setFilterProduce] = useState('');
  
  const pendingListings = mockListings.filter(l => l.status === 'pending');
  const activeListings = mockListings.filter(l => l.status === 'active');
  const rejectedListings = mockListings.filter(l => l.status === 'rejected');
  
  const filteredPending = filterProduce 
    ? pendingListings.filter(l => l.produceName === filterProduce)
    : pendingListings;
  const filteredActive = filterProduce 
    ? activeListings.filter(l => l.produceName === filterProduce)
    : activeListings;
  const filteredRejected = filterProduce 
    ? rejectedListings.filter(l => l.produceName === filterProduce)
    : rejectedListings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage listings and monitor transactions</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingListings.length}</CardTitle>
            <CardDescription>Pending Approval</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeListings.length}</CardTitle>
            <CardDescription>Active Listings</CardDescription>
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
                <SelectItem value="">All Produce</SelectItem>
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

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({filteredPending.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredActive.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filteredRejected.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPending.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions userRole="admin" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActive.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions={false} userRole="admin" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRejected.map(listing => (
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
