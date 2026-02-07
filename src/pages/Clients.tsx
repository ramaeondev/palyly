import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, Building2, Users, Loader2, Mail, Upload } from 'lucide-react';
import { InviteDialog } from '@/components/InviteDialog';
import { CustomFieldsEditor, type CustomField } from '@/components/CustomFieldsEditor';
import { ImageUpload } from '@/components/ImageUpload';
import { BulkImport } from '@/components/BulkImport';
import type { Json } from '@/integrations/supabase/types';

interface PayslipTemplate {
  id: string;
  name: string;
  is_default: boolean;
}

interface Client {
  id: string;
  firm_id: string;
  name: string;
  business_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  contact_person: string | null;
  is_active: boolean;
  created_at: string;
  custom_fields: Json;
  assigned_template_id: string | null;
  selected_template_id: string | null;
  employees_count?: number;
}

interface ClientFormData {
  name: string;
  business_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  contact_person: string;
  logo_url: string;
  custom_fields: CustomField[];
  assigned_template_id: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const initialFormData: ClientFormData = {
  name: '',
  business_type: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  phone: '',
  email: '',
  contact_person: '',
  logo_url: '',
  custom_fields: [],
  assigned_template_id: '',
};

export default function Clients() {
  const { firm, isAdmin } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteClient, setInviteClient] = useState<Client | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);

  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;

      // Fetch employee counts for each client
      const clientsWithCounts = await Promise.all(
        (data || []).map(async (client) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          return { ...client, employees_count: count || 0 };
        })
      );

      setClients(clientsWithCounts);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch clients',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase
        .from('payslip_templates')
        .select('id, name, is_default')
        .order('is_default', { ascending: false })
        .order('name');
      setTemplates((data || []) as PayslipTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const parseCustomFields = (json: Json): CustomField[] => {
    if (!json || !Array.isArray(json)) return [];
    return json.map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      return {
        id: String(obj.id || crypto.randomUUID()),
        name: String(obj.name || ''),
        value: String(obj.value || ''),
      };
    });
  };

  const handleOpenDialog = (client?: Client) => {
    setFormErrors({});
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        business_type: client.business_type || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        country: client.country || '',
        postal_code: client.postal_code || '',
        phone: client.phone || '',
        email: client.email || '',
        contact_person: client.contact_person || '',
        logo_url: client.logo_url || '',
        custom_fields: parseCustomFields(client.custom_fields),
        assigned_template_id: client.assigned_template_id || '',
      });
    } else {
      setSelectedClient(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
      });
      return;
    }

    setIsSaving(true);

    try {
      const clientData = {
        name: formData.name,
        business_type: formData.business_type || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        postal_code: formData.postal_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        contact_person: formData.contact_person || null,
        logo_url: formData.logo_url || null,
        custom_fields: formData.custom_fields as unknown as Json,
        assigned_template_id: formData.assigned_template_id || null,
      };

      if (selectedClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', selectedClient.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
      } else {
        const { error } = await supabase.from('clients').insert({
          ...clientData,
          firm_id: firm?.id,
        });

        if (error) {
          if (error.code === '23505') {
            setFormErrors({ email: 'A client with this email already exists' });
            throw new Error('A client with this email already exists');
          }
          throw error;
        }

        toast({
          title: 'Success',
          description: 'Client created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchClients();
    } catch (error: unknown) {
      console.error('Error saving client:', error);
      if (error instanceof Error && error.message.includes('email')) {
        // Error already set
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save client',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete client. Make sure all employees are removed first.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkImport = async (data: Record<string, string>[]): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = [];
    let success = 0;

    for (const row of data) {
      try {
        const { error } = await supabase.from('clients').insert({
          firm_id: firm?.id,
          name: row.name,
          business_type: row.business_type || null,
          address: row.address || null,
          city: row.city || null,
          state: row.state || null,
          country: row.country || null,
          postal_code: row.postal_code || null,
          phone: row.phone || null,
          email: row.email || null,
          contact_person: row.contact_person || null,
        });

        if (error) {
          if (error.code === '23505') {
            errors.push(`${row.name}: Duplicate email`);
          } else {
            errors.push(`${row.name}: ${error.message}`);
          }
        } else {
          success++;
        }
      } catch (e) {
        errors.push(`${row.name}: Unknown error`);
      }
    }

    await fetchClients();
    return { success, errors };
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.business_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Clients" description="Manage your firm's clients">
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAdmin() && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/clients/new', '_blank', 'width=900,height=800')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add (New Window)
              </Button>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
                    </p>
                    {isAdmin() && !searchQuery && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => handleOpenDialog()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first client
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.logo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {client.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          to={`/clients/${client.id}/employees`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {client.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{client.business_type || '-'}</TableCell>
                    <TableCell>{client.contact_person || '-'}</TableCell>
                    <TableCell>
                      {(() => {
                        const tplId = client.selected_template_id || client.assigned_template_id;
                        const tpl = templates.find(t => t.id === tplId);
                        return tpl ? tpl.name : (
                          <span className="text-muted-foreground text-xs">Default</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {client.employees_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.is_active ? 'default' : 'secondary'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/clients/${client.id}/employees`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                        {isAdmin() && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setInviteClient(client);
                                setIsInviteDialogOpen(true);
                              }}
                              title="Send Portal Invite"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/clients/${client.id}/edit`, '_blank', 'width=900,height=800')}
                              title="Edit in new window"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedClient(client);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription>
              {selectedClient
                ? 'Update the client information below'
                : 'Enter the details for the new client'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-6 py-4">
              {/* Logo Upload */}
              <ImageUpload
                bucket="client-logos"
                folder={selectedClient?.id || 'new'}
                currentUrl={formData.logo_url}
                onUpload={(url) => setFormData({ ...formData, logo_url: url || '' })}
                label="Client Logo"
              />

              <Separator />

              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Client Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ABC Corporation"
                      className={formErrors.name ? 'border-destructive' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-destructive">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Input
                      id="business_type"
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                      placeholder="IT Services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@abc.com"
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-destructive">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="USA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Template Assignment */}
              <div className="space-y-2">
                <Label>Payslip Template</Label>
                <Select
                  value={formData.assigned_template_id || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, assigned_template_id: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Use default template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default template</SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}{t.is_default ? ' (Default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assign a template for this client's payslips. Leave unset to use the default.
                </p>
              </div>

              <Separator />

              {/* Custom Fields */}
              <CustomFieldsEditor
                fields={formData.custom_fields}
                onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : selectedClient ? (
                'Update Client'
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedClient?.name}"? This action
              cannot be undone. All associated employees and payslips will also be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog - uses stored email */}
      {inviteClient && (
        <InviteDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          inviteType="client"
          targetId={inviteClient.id}
          targetName={inviteClient.name}
          prefillEmail={inviteClient.email || undefined}
        />
      )}

      {/* Bulk Import Dialog */}
      <BulkImport
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        entityType="client"
        requiredFields={['name', 'email']}
        optionalFields={['business_type', 'contact_person', 'phone', 'address', 'city', 'state', 'country', 'postal_code']}
        onImport={handleBulkImport}
      />
    </DashboardLayout>
  );
}
