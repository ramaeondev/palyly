import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Building2 } from 'lucide-react';
import { CustomFieldsEditor, type CustomField } from '@/components/CustomFieldsEditor';
import { ImageUpload } from '@/components/ImageUpload';
import type { Json } from '@/integrations/supabase/types';

interface PayslipTemplate {
  id: string;
  name: string;
  is_default: boolean;
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

export default function ClientForm() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!clientId;
  const portalMode = searchParams.get('portal'); // 'client' for client portal

  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [firmId, setFirmId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [clientId]);

  const loadInitialData = async () => {
    try {
      // Get firm ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if firm user
      const { data: profile } = await supabase
        .from('profiles')
        .select('firm_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let resolvedFirmId: string | null = null;

      if (profile) {
        resolvedFirmId = profile.firm_id;
      } else if (portalMode === 'client') {
        // Client user - get firm id through client
        const { data: clientUser } = await supabase
          .from('client_users')
          .select('client_id, clients(firm_id)')
          .eq('user_id', session.user.id)
          .single();
        if (clientUser?.clients) {
          resolvedFirmId = (clientUser.clients as Record<string, unknown>).firm_id as string;
        }
      }

      setFirmId(resolvedFirmId);

      // Fetch templates
      if (resolvedFirmId) {
        const { data: tplData } = await supabase
          .from('payslip_templates')
          .select('id, name, is_default')
          .eq('firm_id', resolvedFirmId)
          .order('is_default', { ascending: false })
          .order('name');
        setTemplates((tplData || []) as PayslipTemplate[]);
      }

      // Load client data if editing
      if (clientId) {
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) throw error;

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
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data' });
    } finally {
      setIsLoading(false);
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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Client name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix errors' });
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

      if (isEditing) {
        const { error } = await supabase.from('clients').update(clientData).eq('id', clientId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Client updated successfully' });
      } else {
        const { error } = await supabase.from('clients').insert({
          ...clientData,
          firm_id: firmId,
        });
        if (error) {
          if (error.code === '23505') {
            setFormErrors({ email: 'A client with this email already exists' });
            throw new Error('Duplicate');
          }
          throw error;
        }
        toast({ title: 'Success', description: 'Client created successfully' });
      }

      // Close window or navigate back
      if (window.opener) {
        window.opener.postMessage({ type: 'CLIENT_SAVED' }, '*');
        window.close();
      } else {
        navigate(portalMode === 'client' ? '/client-portal' : '/clients');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Duplicate') return;
      console.error('Error saving client:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save client' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate(portalMode === 'client' ? '/client-portal' : '/clients');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">{isEditing ? 'Edit Client' : 'Add New Client'}</h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="btn-gradient">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Update' : 'Create'} Client
          </Button>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 pb-8">
            {/* Logo & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
                <CardDescription>Basic information about the client organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUpload
                  bucket="client-logos"
                  folder={clientId || 'new'}
                  currentUrl={formData.logo_url}
                  onUpload={(url) => setFormData({ ...formData, logo_url: url || '' })}
                  label="Client Logo"
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Client Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ABC Corporation"
                      className={formErrors.name ? 'border-destructive' : ''}
                    />
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Input
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                      placeholder="IT Services"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@abc.com"
                      className={formErrors.email ? 'border-destructive' : ''}
                    />
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="NY" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="USA" />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder="10001" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Payslip Template</CardTitle>
                <CardDescription>Assign a payslip template for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.assigned_template_id || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, assigned_template_id: v === 'none' ? '' : v })}
                >
                  <SelectTrigger className="max-w-md">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Leave unset to use the system default template.
                </p>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>Add any additional fields specific to this client</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomFieldsEditor
                  fields={formData.custom_fields}
                  onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
