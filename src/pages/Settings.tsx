import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Save } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

export default function Settings() {
  const { firm, hasRole, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: firm?.name || '',
    address: firm?.address || '',
    city: firm?.city || '',
    state: firm?.state || '',
    country: firm?.country || '',
    postal_code: firm?.postal_code || '',
    phone: firm?.phone || '',
    email: firm?.email || '',
    website: firm?.website || '',
    logo_url: firm?.logo_url || '',
  });

  useEffect(() => {
    if (firm) {
      setFormData({
        name: firm.name || '',
        address: firm.address || '',
        city: firm.city || '',
        state: firm.state || '',
        country: firm.country || '',
        postal_code: firm.postal_code || '',
        phone: firm.phone || '',
        email: firm.email || '',
        website: firm.website || '',
        logo_url: firm.logo_url || '',
      });
    }
  }, [firm]);

  const handleSave = async () => {
    if (!firm?.id) return;

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Firm name is required',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('firms')
        .update({
          name: formData.name,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          postal_code: formData.postal_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          logo_url: formData.logo_url || null,
        })
        .eq('id', firm.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Success',
        description: 'Firm settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating firm:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update firm settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = hasRole('super_admin');

  return (
    <DashboardLayout
      title="Firm Settings"
      description="Manage your firm's information and preferences"
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Firm Information</CardTitle>
            </div>
            <CardDescription>
              {canEdit
                ? 'Update your firm details'
                : 'View your firm details (only Super Admins can edit)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <ImageUpload
              bucket="firm-logos"
              folder={firm?.id || 'new'}
              currentUrl={formData.logo_url}
              onUpload={(url) => setFormData({ ...formData, logo_url: url || '' })}
              label="Firm Logo"
              disabled={!canEdit}
            />

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="name">Firm Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ABC Payroll Services"
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@firm.com"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://www.firm.com"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main Street, Suite 100"
                disabled={!canEdit}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="NY"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="United States"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  placeholder="10001"
                  disabled={!canEdit}
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
