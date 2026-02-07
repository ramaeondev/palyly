import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Check, Eye } from 'lucide-react';
import { PAYSLIP_DESIGN_TEMPLATES, type PayslipDesignTemplate } from '@/lib/payslip-templates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DbTemplate {
  id: string;
  name: string;
  is_default: boolean;
  header: string;
  footer: string;
  signatory_name: string;
}

export default function TemplatesPage() {
  const { firm, isAdmin } = useAuth();
  const { toast } = useToast();
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PayslipDesignTemplate | null>(null);

  useEffect(() => {
    fetchDbTemplates();
  }, []);

  const fetchDbTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('payslip_templates')
        .select('id, name, is_default, header, footer, signatory_name')
        .order('is_default', { ascending: false });

      if (error) throw error;
      const templates = (data || []) as DbTemplate[];
      setDbTemplates(templates);
      const def = templates.find(t => t.is_default);
      if (def) setDefaultTemplateId(def.id);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure all 10 design templates exist in DB, create missing ones
  const syncTemplates = async () => {
    if (!firm?.id) return;
    setLoading(true);
    try {
      const existingNames = dbTemplates.map(t => t.name);
      const missing = PAYSLIP_DESIGN_TEMPLATES.filter(t => !existingNames.includes(t.name));

      if (missing.length > 0) {
        const isFirst = dbTemplates.length === 0;
        const inserts = missing.map((t, i) => ({
          firm_id: firm.id,
          name: t.name,
          header: t.description,
          body: `style:${t.id}`,
          footer: '',
          signatory_name: '',
          is_default: isFirst && i === 0,
        }));

        const { error } = await supabase.from('payslip_templates').insert(inserts);
        if (error) throw error;
        toast({ title: 'Templates synced', description: `${missing.length} templates added` });
        await fetchDbTemplates();
      } else {
        toast({ title: 'All templates present', description: 'All 10 design templates are available' });
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to sync templates' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    if (!isAdmin()) return;
    try {
      // Unset current default
      if (defaultTemplateId) {
        await supabase.from('payslip_templates').update({ is_default: false }).eq('id', defaultTemplateId);
      }
      // Set new default
      await supabase.from('payslip_templates').update({ is_default: true }).eq('id', templateId);
      setDefaultTemplateId(templateId);
      toast({ title: 'Default updated', description: 'Default template has been changed' });
      await fetchDbTemplates();
    } catch (error) {
      console.error('Error setting default:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update default' });
    }
  };

  // Map DB templates to design definitions
  const getDesignForDbTemplate = (dbTemplate: DbTemplate): PayslipDesignTemplate | undefined => {
    // Try to match by body field (style:id) or by name
    return PAYSLIP_DESIGN_TEMPLATES.find(d => d.name === dbTemplate.name);
  };

  return (
    <DashboardLayout title="Payslip Templates" description="Choose from 10 pre-designed payslip layouts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {dbTemplates.length} of {PAYSLIP_DESIGN_TEMPLATES.length} templates available
          </p>
          {isAdmin() && dbTemplates.length < PAYSLIP_DESIGN_TEMPLATES.length && (
            <Button onClick={syncTemplates} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Missing Templates
            </Button>
          )}
          {isAdmin() && dbTemplates.length === 0 && (
            <Button onClick={syncTemplates} disabled={loading} className="btn-gradient">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Initialize All Templates
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PAYSLIP_DESIGN_TEMPLATES.map((design) => {
              const dbMatch = dbTemplates.find(d => d.name === design.name);
              const isDefault = dbMatch?.is_default || false;
              const isAvailable = !!dbMatch;

              return (
                <Card
                  key={design.id}
                  className={`overflow-hidden transition-all hover:shadow-lg ${
                    isDefault ? 'ring-2 ring-primary' : ''
                  } ${!isAvailable ? 'opacity-50' : ''}`}
                >
                  {/* Mini Preview */}
                  <div
                    className="h-40 relative overflow-hidden"
                    style={{ backgroundColor: design.headerBg }}
                  >
                    {/* Header preview */}
                    <div className="p-4 flex items-start" style={{
                      justifyContent: design.logoPosition === 'center' ? 'center' : design.logoPosition === 'right' ? 'flex-end' : 'flex-start'
                    }}>
                      <div>
                        <div
                          className="w-10 h-10 rounded bg-white/20 mb-2"
                          style={{ margin: design.logoPosition === 'center' ? '0 auto' : undefined }}
                        />
                        <p style={{
                          color: design.headerText,
                          fontFamily: design.headerFont,
                          fontSize: '11px',
                          fontWeight: 700,
                          textAlign: design.logoPosition === 'center' ? 'center' : 'left',
                        }}>
                          Company Name
                        </p>
                        <p style={{ color: design.headerText, opacity: 0.7, fontSize: '8px', fontFamily: design.fontFamily }}>
                          SALARY SLIP
                        </p>
                      </div>
                    </div>

                    {/* Body preview lines */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: design.tableHeaderBg }} />
                          <div className="h-1.5 w-10 rounded bg-muted" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-1.5 w-20 rounded bg-muted/60" />
                          <div className="h-1.5 w-8 rounded bg-muted/60" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-1.5 w-14 rounded bg-muted/40" />
                          <div className="h-1.5 w-12 rounded bg-muted/40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{design.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{design.description}</p>
                      </div>
                      <div className="flex gap-1">
                        {isDefault && (
                          <Badge variant="default" className="text-[10px] gap-1">
                            <Star className="h-2.5 w-2.5" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{design.style}</span>
                      <span>•</span>
                      <span>Logo: {design.logoPosition}</span>
                      <span>•</span>
                      <span style={{ fontFamily: design.fontFamily, fontSize: '10px' }}>Aa</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(design)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      {isAdmin() && isAvailable && !isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(dbMatch!.id)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <PayslipTemplateFullPreview design={previewTemplate} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PayslipTemplateFullPreview({ design }: { design: PayslipDesignTemplate }) {
  return (
    <div
      className="border rounded-lg overflow-hidden shadow-sm"
      style={{ fontFamily: design.fontFamily, fontSize: '12px' }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{ backgroundColor: design.headerBg, color: design.headerText }}
      >
        <div style={{
          display: 'flex',
          justifyContent: design.logoPosition === 'center' ? 'center' : design.logoPosition === 'right' ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-lg font-bold">
            Logo
          </div>
          <div style={{ textAlign: design.logoPosition === 'center' ? 'center' : 'left' }}>
            <h2 style={{ fontFamily: design.headerFont, fontSize: '18px', fontWeight: 700 }}>
              Acme Corporation Pvt. Ltd.
            </h2>
            <p style={{ opacity: 0.8, fontSize: '11px' }}>123 Business Park, Tech City, State - 400001</p>
            <p style={{ opacity: 0.6, fontSize: '10px', marginTop: '4px' }}>PAYSLIP FOR THE MONTH OF JANUARY 2026</p>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="p-4 grid grid-cols-2 gap-3 text-xs" style={{ borderBottom: design.borderStyle }}>
        <div><span className="text-muted-foreground">Employee Name:</span> <strong>John Doe</strong></div>
        <div><span className="text-muted-foreground">Employee ID:</span> <strong>EMP001</strong></div>
        <div><span className="text-muted-foreground">Department:</span> Engineering</div>
        <div><span className="text-muted-foreground">Designation:</span> Senior Engineer</div>
        <div><span className="text-muted-foreground">Date of Joining:</span> 15 Mar 2022</div>
        <div><span className="text-muted-foreground">Pay Date:</span> 31 Jan 2026</div>
      </div>

      {/* Salary Table */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Earnings */}
          <div>
            <div
              className="px-3 py-2 rounded-t font-semibold text-xs"
              style={{ backgroundColor: design.tableHeaderBg, color: design.tableHeaderText }}
            >
              Earnings
            </div>
            <div className="space-y-0" style={{ border: design.borderStyle, borderTop: 'none' }}>
              {[
                ['Basic Salary', '₹25,000'],
                ['HRA', '₹10,000'],
                ['Conveyance', '₹3,000'],
                ['Medical', '₹2,500'],
                ['Special Allowance', '₹9,500'],
              ].map(([name, amount]) => (
                <div key={name} className="flex justify-between px-3 py-1.5 text-xs" style={{ borderBottom: design.borderStyle }}>
                  <span>{name}</span>
                  <span className="font-medium">{amount}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 font-bold text-xs" style={{ backgroundColor: design.tableHeaderBg }}>
                <span>Total Earnings</span>
                <span>₹50,000</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div
              className="px-3 py-2 rounded-t font-semibold text-xs"
              style={{ backgroundColor: design.tableHeaderBg, color: design.tableHeaderText }}
            >
              Deductions
            </div>
            <div className="space-y-0" style={{ border: design.borderStyle, borderTop: 'none' }}>
              {[
                ['Provident Fund', '₹3,000'],
                ['Professional Tax', '₹200'],
                ['Income Tax', '₹2,500'],
                ['ESI', '₹375'],
              ].map(([name, amount]) => (
                <div key={name} className="flex justify-between px-3 py-1.5 text-xs" style={{ borderBottom: design.borderStyle }}>
                  <span>{name}</span>
                  <span className="font-medium">{amount}</span>
                </div>
              ))}
              <div className="py-1.5 px-3" style={{ borderBottom: design.borderStyle }}>&nbsp;</div>
              <div className="flex justify-between px-3 py-2 font-bold text-xs" style={{ backgroundColor: design.tableHeaderBg }}>
                <span>Total Deductions</span>
                <span>₹6,075</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div
          className="mt-4 p-3 rounded font-bold text-sm flex justify-between items-center"
          style={{ backgroundColor: design.accentColor, color: design.headerText }}
        >
          <span>Net Pay</span>
          <span className="text-base">₹43,925</span>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Amount in words: Forty Three Thousand Nine Hundred Twenty Five Only
        </p>
      </div>

      {/* Footer */}
      <div className="p-4" style={{ backgroundColor: design.footerBg, borderTop: design.borderStyle }}>
        <div className="flex justify-between items-end">
          <div>
            <p style={{ color: design.footerText, fontSize: '10px' }}>
              This is a computer-generated payslip and does not require a physical signature.
            </p>
            <p style={{ color: design.footerText, fontSize: '9px', marginTop: '4px' }}>
              Acme Corporation Pvt. Ltd. | 123 Business Park, Tech City
            </p>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '16px', color: design.accentColor }}>
              Jane Smith
            </p>
            <p style={{ fontSize: '9px', color: design.footerText }}>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
