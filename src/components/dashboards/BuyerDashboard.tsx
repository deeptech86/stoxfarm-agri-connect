import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockListings, produceList } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Search } from 'lucide-react';

const BuyerDashboard = () => {
  const [searchProduce, setSearchProduce] = useState('');
  
  const activeListings = mockListings.filter(l => l.status === 'active');
  const filteredListings = searchProduce 
    ? activeListings.filter(l => l.produceName.toLowerCase().includes(searchProduce.toLowerCase()))
    : activeListings;

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
    </div>
  );
};

export default BuyerDashboard;
