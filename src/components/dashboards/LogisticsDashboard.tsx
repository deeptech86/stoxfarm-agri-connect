import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTransactions } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';

const LogisticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics Dashboard</h1>
        <p className="text-muted-foreground">Manage deliveries and shipments</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{mockTransactions.length}</CardTitle>
            <CardDescription>Total Deliveries</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Pending Pickups</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>In Transit</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirmed Deliveries</CardTitle>
          <CardDescription>Orders ready for pickup and delivery</CardDescription>
        </CardHeader>
        <CardContent>
          {mockTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No deliveries scheduled yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.sellerName}</TableCell>
                    <TableCell>{t.buyerName}</TableCell>
                    <TableCell>{t.produceName}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Ready for Pickup
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsDashboard;
