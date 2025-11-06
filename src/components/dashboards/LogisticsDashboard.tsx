import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTransactions, mockUsers } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, MapPin, Phone } from 'lucide-react';

const LogisticsDashboard = () => {
  const getSeller = (sellerId: string) => mockUsers.find(u => u.id === sellerId);
  const getBuyer = (buyerId: string) => mockUsers.find(u => u.id === buyerId);

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
                  <TableHead>Seller Details</TableHead>
                  <TableHead>Buyer Details</TableHead>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map(t => {
                  const seller = getSeller(t.sellerId);
                  const buyer = getBuyer(t.buyerId);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{t.sellerName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{seller?.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{seller?.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{t.buyerName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{buyer?.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{buyer?.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{t.produceName}</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          Ready for Pickup
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsDashboard;
