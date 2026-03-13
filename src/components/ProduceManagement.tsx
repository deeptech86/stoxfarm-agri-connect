import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProduce, useCreateProduce, useUpdateProduce, useDeleteProduce, useProduceCategories, useActivateProduce } from '@/hooks/useProduce';
import { useSatelliteCenters } from '@/hooks/useSatelliteCenters';
import { ProduceResponse, CreateProduceRequest, UpdateProduceRequest } from '@/services/produce.service';
import { Plus, Pencil, Trash2, Search, Loader2, Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProduceManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState<ProduceResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produceToDelete, setProduceToDelete] = useState<ProduceResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProduceRequest>({
    name: '',
    category: '',
    unit: 'kg',
    mandi_rate: '0',
    satellite_center_id: '',
    description: '',
    image_url: '',
  });

  // Fetch produce from API (toggle between active only and all)
  const { data: produceData, isLoading, refetch } = useProduce(1, 100, categoryFilter === 'all' ? undefined : categoryFilter, !showInactive);
  const { data: categories } = useProduceCategories();
  const { data: centersData } = useSatelliteCenters(1, 100, undefined, undefined, true);
  const createProduceMutation = useCreateProduce();
  const updateProduceMutation = useUpdateProduce();
  const deleteProduceMutation = useDeleteProduce();
  const activateProduceMutation = useActivateProduce();

  const satelliteCenters = (centersData?.items || []).filter(
    (center): center is (typeof centersData.items)[number] => Boolean(center && center.id)
  );

  const produceList = (produceData?.items || []).filter(
    (produce): produce is ProduceResponse => Boolean(produce && produce.id && produce.name)
  );

  // Filter produce by search query
  const filteredProduce = produceList.filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (produce: ProduceResponse) => {
    setSelectedProduce(produce);
    setFormData({
      name: produce.name,
      category: produce.category || '',
      unit: produce.unit,
      mandi_rate: produce.mandi_rate || '0',
      satellite_center_id: produce.satellite_center_id || '',
      description: produce.description || '',
      image_url: produce.image_url || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (produce: ProduceResponse) => {
    setProduceToDelete(produce);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (produceToDelete) {
      try {
        await deleteProduceMutation.mutateAsync({ id: produceToDelete.id });
        toast({
          title: 'Produce deleted',
          description: `${produceToDelete.name} has been removed.`,
        });
        setDeleteDialogOpen(false);
        setProduceToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete produce.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRestore = async (produce: ProduceResponse) => {
    try {
      await activateProduceMutation.mutateAsync(produce.id);
      toast({
        title: 'Produce restored',
        description: `${produce.name} has been restored and is now active.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore produce.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNew = () => {
    setSelectedProduce(null);
    setFormData({
      name: '',
      category: '',
      unit: 'kg',
      mandi_rate: '0',
      satellite_center_id: '',
      description: '',
      image_url: '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduce) {
        // Update existing produce
        const updateData: UpdateProduceRequest = {
          name: formData.name,
          category: formData.category || undefined,
          unit: formData.unit,
          mandi_rate: formData.mandi_rate || '0',
          satellite_center_id: formData.satellite_center_id || undefined,
          description: formData.description || undefined,
          image_url: formData.image_url || undefined,
        };
        await updateProduceMutation.mutateAsync({ id: selectedProduce.id, data: updateData });
        toast({
          title: 'Produce updated',
          description: `${formData.name} has been updated.`,
        });
      } else {
        // Create new produce
        const createData = {
          ...formData,
          satellite_center_id: formData.satellite_center_id || undefined,
        };
        await createProduceMutation.mutateAsync(createData);
        toast({
          title: 'Produce created',
          description: `${formData.name} has been added.`,
        });
      }
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedProduce ? 'update' : 'create'} produce.`,
        variant: 'destructive',
      });
    }
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
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <div>
              <CardTitle>Produce Management</CardTitle>
              <CardDescription>Create, edit, or delete produce items</CardDescription>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Produce
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
              Show Inactive
            </Label>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Satellite Center</TableHead>
                <TableHead>Mandi Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProduce.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No produce found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProduce.map(produce => (
                  <TableRow key={produce.id} className={!produce.is_active ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">{produce.name}</TableCell>
                    <TableCell>{produce.category || '-'}</TableCell>
                    <TableCell>{produce.unit}</TableCell>
                    <TableCell>{produce.satellite_center_name || 'All Centers'}</TableCell>
                    <TableCell>₹{parseFloat(produce.mandi_rate || '0').toFixed(2)}/{produce.unit}</TableCell>
                    <TableCell>
                      <Badge variant={produce.is_active ? 'default' : 'secondary'}>
                        {produce.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!produce.is_active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(produce)}
                            title="Restore produce"
                            disabled={activateProduceMutation.isPending}
                            className="text-green-600 hover:text-green-600"
                          >
                            {activateProduceMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(produce)}
                              title="Edit produce"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(produce)}
                              title="Delete produce"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredProduce.length} of {produceData?.total || 0} produce items
        </div>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedProduce ? 'Edit Produce' : 'Add New Produce'}</DialogTitle>
            <DialogDescription>
              {selectedProduce ? 'Update the produce details below.' : 'Fill in the details to add a new produce item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tomato"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Vegetables"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="quintal">quintal</SelectItem>
                    <SelectItem value="ton">ton</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="satellite_center">Satellite Center</Label>
                <Select
                  value={formData.satellite_center_id || ''}
                  onValueChange={(v) => setFormData({ ...formData, satellite_center_id: v === 'all' ? '' : v })}
                >
                  <SelectTrigger id="satellite_center">
                    <SelectValue placeholder="All Centers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Centers</SelectItem>
                    {satelliteCenters.map(center => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave as "All Centers" for global produce, or select a center for center-specific rates.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mandi_rate">Mandi Rate (₹/{formData.unit})</Label>
                <Input
                  id="mandi_rate"
                  type="number"
                  step="0.01"
                  value={formData.mandi_rate || '0'}
                  onChange={(e) => setFormData({ ...formData, mandi_rate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || createProduceMutation.isPending || updateProduceMutation.isPending}
            >
              {(createProduceMutation.isPending || updateProduceMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {selectedProduce ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {produceToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProduceManagement;
