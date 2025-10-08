import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { mockListings, produceList, mockBids } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CounterOfferDialog from '@/components/CounterOfferDialog';
import { Bid } from '@/types/produce';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [searchProduce, setSearchProduce] = useState('');
  const [selectedCounterBid, setSelectedCounterBid] = useState<Bid | null>(null);
  const [selectedProduceName, setSelectedProduceName] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  
  const activeListings = mockListings.filter(l => l.status === 'active');
  const filteredListings = searchProduce 
    ? activeListings.filter(l => l.produceName.toLowerCase().includes(searchProduce.toLowerCase()))
    : activeListings;
  
  // Get my bids
  const myBids = mockBids.filter(b => b.buyerId === user?.id);
  const pendingBids = myBids.filter(b => b.status === 'pending');
  const counterBids = myBids.filter(b => b.status === 'counter');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <p className="text-muted-foreground">Find and bid on fresh produce</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Produce</CardTitle>
          <CardDescription>Find listings by produce type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produce">Select Produce</Label>
              <Select value={searchProduce} onValueChange={setSearchProduce}>
                <SelectTrigger id="produce">
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
          </div>
        </CardContent>
      </Card>

      {counterBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Counter Offers</CardTitle>
            <CardDescription>Sellers have proposed different prices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Your Bid</TableHead>
                  <TableHead>Counter Offer</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counterBids.map(bid => {
                  const listing = mockListings.find(l => l.id === bid.listingId);
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>{listing?.produceName}</TableCell>
                      <TableCell>{bid.quantity} kg</TableCell>
                      <TableCell>₹{bid.pricePerUnit}/kg</TableCell>
                      <TableCell className="font-semibold text-primary">₹{bid.counterPrice}/kg</TableCell>
                      <TableCell>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedCounterBid(bid);
                            setSelectedProduceName(listing?.produceName || '');
                            setSelectedSellerId(listing?.sellerId || '');
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Listings ({filteredListings.length})
        </h2>
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions userRole="buyer" />
            ))}
          </div>
        )}
      </div>

      {selectedCounterBid && (
        <CounterOfferDialog
          bid={selectedCounterBid}
          produceName={selectedProduceName}
          sellerId={selectedSellerId}
          open={!!selectedCounterBid}
          onOpenChange={(open) => !open && setSelectedCounterBid(null)}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
