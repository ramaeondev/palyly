import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Loader2,
  Star,
  Eye,
} from 'lucide-react';

interface PayslipTemplate {
  id: string;
  firm_id: string;
  name: string;
  header: string;
  body: string;
  footer: string;
  signatory_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface TemplateFormData {
  name: string;
  header: string;
  body: string;
  footer: string;
  signatory_name: string;
  is_default: boolean;
}

const initialFormData: TemplateFormData = {
  name: '',
  header: '',
  body: '',
  footer: '',
  signatory_name: '',
  is_default: false,
};

export default function TemplatesPage() {
  const { firm, isAdmin } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('payslip_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      setTemplates((data || []) as PayslipTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: PayslipTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        header: template.header,
        body: template.body,
        footer: template.footer,
        signatory_name: template.signatory_name,
        is_default: template.is_default,
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        ...initialFormData,
        is_default: templates.length === 0, // First template is default
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Template name is required' });
      return;
    }

    setIsSaving(true);

    try {
      // If setting as default, unset current default first
      if (formData.is_default) {
        const currentDefault = templates.find(t => t.is_default && t.id !== selectedTemplate?.id);
        if (currentDefault) {
          await supabase
            .from('payslip_templates')
            .update({ is_default: false })
            .eq('id', currentDefault.id);
        }
      }

      if (selectedTemplate) {
        const { error } = await supabase
          .from('payslip_templates')
          .update({
            name: formData.name,
            header: formData.header,
            body: formData.body,
            footer: formData.footer,
            signatory_name: formData.signatory_name,
            is_default: formData.is_default,
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Template updated successfully' });
      } else {
        const { error } = await supabase.from('payslip_templates').insert({
          firm_id: firm?.id,
          name: formData.name,
          header: formData.header,
          body: formData.body,
          footer: formData.footer,
          signatory_name: formData.signatory_name,
          is_default: formData.is_default,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Template created successfully' });
      }

      setIsDialogOpen(false);
      fetchTemplates();
    } catch (error: unknown) {
      console.error('Error saving template:', error);
      const message = error instanceof Error ? error.message : 'Failed to save template';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('payslip_templates')
        .delete()
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Template deleted successfully' });
      setIsDeleteDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete template' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (template: PayslipTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <DashboardLayout title="Templates" description="Manage payslip templates for your clients">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''} configured
          </p>
          {isAdmin() && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          )}
        </div>

        {/* Templates List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first payslip template to get started
              </p>
              {isAdmin() && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className={template.is_default ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Badge variant="default" className="text-xs gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.signatory_name ? `Signatory: ${template.signatory_name}` : 'No signatory set'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.header && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Header</p>
                      <p className="text-sm line-clamp-2">{template.header}</p>
                    </div>
                  )}
                  {template.body && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
                      <p className="text-sm line-clamp-2">{template.body}</p>
                    </div>
                  )}
                  {template.footer && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Footer</p>
                      <p className="text-sm line-clamp-2">{template.footer}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(template)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    {isAdmin() && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(template)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {!template.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>
              Configure the header, body, footer, and signatory for this payslip template
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Payslip"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="header">Header</Label>
                <Textarea
                  id="header"
                  value={formData.header}
                  onChange={(e) => setFormData(prev => ({ ...prev, header: e.target.value }))}
                  placeholder="Content displayed at the top of the payslip (e.g., company tagline, payslip title)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Displayed prominently at the top of every payslip
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Additional content or disclaimers shown in the payslip body"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Supplementary text rendered within the payslip body
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Footer</Label>
                <Textarea
                  id="footer"
                  value={formData.footer}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer: e.target.value }))}
                  placeholder="Footer text (e.g., 'This is a system-generated payslip')"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Displayed at the bottom of the payslip
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="signatory_name">Authorized Signatory Name</Label>
                <Input
                  id="signatory_name"
                  value={formData.signatory_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, signatory_name: e.target.value }))}
                  placeholder="e.g., Jane Smith, HR Manager"
                />
                <p className="text-xs text-muted-foreground">
                  Rendered in a signature-style font on the payslip. This can also be configured per client.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Set as Default Template</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    The default template is used when no specific template is assigned to a client
                  </p>
                </div>
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                  disabled={selectedTemplate?.is_default && templates.length > 1}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                selectedTemplate ? 'Update Template' : 'Create Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
              Clients assigned to this template will fall back to the default template.
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
                'Delete Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="border rounded-lg p-6 space-y-6 bg-card">
              {/* Header */}
              {selectedTemplate.header && (
                <div className="text-center border-b pb-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.header}</p>
                </div>
              )}

              {/* Body placeholder */}
              <div className="space-y-3">
                {selectedTemplate.body ? (
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplate.body}</p>
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    [ Payslip salary details will appear here ]
                  </div>
                )}
              </div>

              {/* Signatory */}
              {selectedTemplate.signatory_name && (
                <div className="text-right pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Authorized Signatory</p>
                  <p
                    className="text-lg italic"
                    style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
                  >
                    {selectedTemplate.signatory_name}
                  </p>
                </div>
              )}

              {/* Footer */}
              {selectedTemplate.footer && (
                <div className="text-center border-t pt-4">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {selectedTemplate.footer}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
