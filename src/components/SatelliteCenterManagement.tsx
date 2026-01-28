import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSatelliteCenters, useDeleteSatelliteCenter, useSearchSatelliteCenters } from '@/hooks/useSatelliteCenters';
import { SatelliteCenterResponse } from '@/services/satellite-center.service';
import { Plus, Pencil, Trash2, Search, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SatelliteCenterFormDialog from './SatelliteCenterFormDialog';

const SatelliteCenterManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<SatelliteCenterResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<SatelliteCenterResponse | null>(null);

  // Fetch centers from API (active only by default)
  const { data: centersData, isLoading, refetch } = useSatelliteCenters(1, 100, undefined, undefined, true);
  const { data: searchData, isLoading: isSearching } = useSearchSatelliteCenters(searchQuery);
  const deleteCenterMutation = useDeleteSatelliteCenter();

  const centers = centersData?.items || [];
  const searchResults = searchData || [];

  // Use search results if there's a query, otherwise use all centers
  const filteredCenters = searchQuery ? searchResults : centers;

  const handleEdit = (center: SatelliteCenterResponse) => {
    setSelectedCenter(center);
    setIsFormOpen(true);
  };

  const handleDelete = (center: SatelliteCenterResponse) => {
    setCenterToDelete(center);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (centerToDelete) {
      try {
        await deleteCenterMutation.mutateAsync({ id: centerToDelete.id });
        toast({
          title: 'Center deleted',
          description: `${centerToDelete.name} has been removed from the platform.`,
        });
        setDeleteDialogOpen(false);
        setCenterToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete satellite center.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedCenter(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Satellite Center Management</CardTitle>
              <CardDescription>Create, edit, or delete satellite centers on the platform</CardDescription>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Center
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, address, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center Name</TableHead>
                <TableHead>Center ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Office Phone</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCenters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No satellite centers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCenters.map(center => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell className="font-mono text-sm">{center.id.slice(0, 8)}...</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={center.address}>
                      {center.address}
                    </TableCell>
                    <TableCell>{center.office_phone}</TableCell>
                    <TableCell>{center.platform_fee}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(center)}
                          title="Edit center"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(center)}
                          title="Delete center"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredCenters.length} of {centersData?.total || 0} centers
        </div>
      </CardContent>

      <SatelliteCenterFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        center={selectedCenter}
        onSave={() => refetch()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {centerToDelete?.name} from the platform.
              Users assigned to this center will need to be reassigned.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SatelliteCenterManagement;
