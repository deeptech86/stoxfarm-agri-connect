import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { mockSatelliteCenters, deleteSatelliteCenter } from '@/lib/mockData';
import { SatelliteCenter } from '@/types/satellite';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SatelliteCenterFormDialog from './SatelliteCenterFormDialog';

const SatelliteCenterManagement = () => {
  const { toast } = useToast();
  const [, forceUpdate] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<SatelliteCenter | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<SatelliteCenter | null>(null);

  const refreshCenters = () => {
    forceUpdate(n => n + 1);
  };

  const filteredCenters = mockSatelliteCenters.filter(center => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.officePhone.includes(searchQuery);

    return matchesSearch;
  });

  const handleEdit = (center: SatelliteCenter) => {
    setSelectedCenter(center);
    setIsFormOpen(true);
  };

  const handleDelete = (center: SatelliteCenter) => {
    setCenterToDelete(center);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (centerToDelete) {
      deleteSatelliteCenter(centerToDelete.id);
      toast({
        title: 'Center deleted',
        description: `${centerToDelete.name} has been removed from the platform.`,
      });
      refreshCenters();
      setDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  const handleCreateNew = () => {
    setSelectedCenter(null);
    setIsFormOpen(true);
  };

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
                    <TableCell className="font-mono text-sm">{center.id}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={center.address}>
                      {center.address}
                    </TableCell>
                    <TableCell>{center.officePhone}</TableCell>
                    <TableCell>{center.platformFee}%</TableCell>
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
          Showing {filteredCenters.length} of {mockSatelliteCenters.length} centers
        </div>
      </CardContent>

      <SatelliteCenterFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        center={selectedCenter}
        onSave={refreshCenters}
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
