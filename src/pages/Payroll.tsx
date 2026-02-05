 import { useState, useEffect } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useToast } from '@/hooks/use-toast';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { 
   Loader2, 
   Plus, 
   Play, 
   CheckCircle2, 
   XCircle, 
   Clock, 
   FileText,
   ArrowRight,
   Calendar,
   Users
 } from 'lucide-react';
 import { format } from 'date-fns';
 
 type PayrollStatus = 'draft' | 'review' | 'approved' | 'published';
 
 interface Client {
   id: string;
   name: string;
 }
 
 interface PayrollRun {
   id: string;
   client_id: string;
   pay_period: string;
   pay_date: string;
   status: PayrollStatus;
   created_at: string;
   reviewed_at: string | null;
   approved_at: string | null;
   published_at: string | null;
   notes: string | null;
   clients?: Client;
 }
 
 const STATUS_CONFIG: Record<PayrollStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Clock }> = {
   draft: { label: 'Draft', variant: 'secondary', icon: Clock },
   review: { label: 'In Review', variant: 'outline', icon: FileText },
   approved: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
   published: { label: 'Published', variant: 'default', icon: CheckCircle2 },
 };
 
 const WORKFLOW_STEPS: PayrollStatus[] = ['draft', 'review', 'approved', 'published'];
 
 export default function PayrollPage() {
   const { firm, hasRole, user } = useAuth();
   const { toast } = useToast();
   const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
   const [clients, setClients] = useState<Client[]>([]);
   const [loading, setLoading] = useState(true);
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
   const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);
   const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   
   // Create form state
   const [newPayroll, setNewPayroll] = useState({
     client_id: '',
     pay_period: '',
     pay_date: '',
   });
   
   // Transition form state
   const [transitionNotes, setTransitionNotes] = useState('');
 
   useEffect(() => {
     fetchData();
   }, []);
 
   const fetchData = async () => {
     try {
       const [clientsResult, payrollResult] = await Promise.all([
         supabase.from('clients').select('id, name').order('name'),
         supabase.from('payroll_runs').select('*, clients(id, name)').order('created_at', { ascending: false }),
       ]);
 
       if (clientsResult.data) setClients(clientsResult.data);
       if (payrollResult.data) setPayrollRuns(payrollResult.data as PayrollRun[]);
     } catch (error) {
       console.error('Error fetching data:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const handleCreatePayroll = async () => {
     if (!newPayroll.client_id || !newPayroll.pay_period || !newPayroll.pay_date) {
       toast({
         variant: 'destructive',
         title: 'Validation Error',
         description: 'Please fill in all required fields',
       });
       return;
     }
 
     setIsSubmitting(true);
     
     try {
       const { error } = await supabase.from('payroll_runs').insert({
         client_id: newPayroll.client_id,
         pay_period: newPayroll.pay_period,
         pay_date: newPayroll.pay_date,
         status: 'draft',
         created_by: user?.id,
       });
 
       if (error) throw error;
 
       toast({
         title: 'Success',
         description: 'Payroll run created successfully',
       });
       
       setIsCreateDialogOpen(false);
       setNewPayroll({ client_id: '', pay_period: '', pay_date: '' });
       fetchData();
     } catch (error: unknown) {
       const message = error instanceof Error ? error.message : 'Failed to create payroll run';
       toast({
         variant: 'destructive',
         title: 'Error',
         description: message.includes('duplicate') ? 'A payroll run for this period already exists' : message,
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const getNextStatus = (currentStatus: PayrollStatus): PayrollStatus | null => {
     const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);
     if (currentIndex < WORKFLOW_STEPS.length - 1) {
       return WORKFLOW_STEPS[currentIndex + 1];
     }
     return null;
   };
 
   const canTransition = (run: PayrollRun): boolean => {
     const nextStatus = getNextStatus(run.status);
     if (!nextStatus) return false;
 
     // Check role-based permissions
     if (run.status === 'draft') {
       // Preparers, admins, super_admins can move to review
       return hasRole('super_admin') || hasRole('admin') || hasRole('preparer');
     }
     if (run.status === 'review') {
       // Approver L1, admins, super_admins can approve
       return hasRole('super_admin') || hasRole('admin') || hasRole('approver_l1') || hasRole('approver_l2');
     }
     if (run.status === 'approved') {
       // Approver L2, admins, super_admins can publish
       return hasRole('super_admin') || hasRole('admin') || hasRole('approver_l2');
     }
     return false;
   };
 
   const handleTransition = async () => {
     if (!selectedRun) return;
 
     const nextStatus = getNextStatus(selectedRun.status);
     if (!nextStatus) return;
 
     setIsSubmitting(true);
 
     try {
       // Update payroll run status
       const updateData: Record<string, unknown> = {
         status: nextStatus,
       };
 
       if (nextStatus === 'review') {
         updateData.reviewed_by = user?.id;
         updateData.reviewed_at = new Date().toISOString();
       } else if (nextStatus === 'approved') {
         updateData.approved_by = user?.id;
         updateData.approved_at = new Date().toISOString();
       } else if (nextStatus === 'published') {
         updateData.published_by = user?.id;
         updateData.published_at = new Date().toISOString();
       }
 
       const { error: updateError } = await supabase
         .from('payroll_runs')
         .update(updateData)
         .eq('id', selectedRun.id);
 
       if (updateError) throw updateError;
 
       // Log workflow history
       const { error: historyError } = await supabase
         .from('payroll_workflow_history')
         .insert({
           payroll_run_id: selectedRun.id,
           from_status: selectedRun.status,
           to_status: nextStatus,
           changed_by: user?.id,
           notes: transitionNotes || null,
         });
 
       if (historyError) console.error('Error logging history:', historyError);
 
       toast({
         title: 'Status Updated',
         description: `Payroll moved to ${STATUS_CONFIG[nextStatus].label}`,
       });
 
       setIsTransitionDialogOpen(false);
       setSelectedRun(null);
       setTransitionNotes('');
       fetchData();
     } catch (error) {
       console.error('Error transitioning payroll:', error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to update payroll status',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const openTransitionDialog = (run: PayrollRun) => {
     setSelectedRun(run);
     setIsTransitionDialogOpen(true);
   };
 
   const getStatusBadge = (status: PayrollStatus) => {
     const config = STATUS_CONFIG[status];
     const Icon = config.icon;
     return (
       <Badge variant={config.variant} className="gap-1">
         <Icon className="h-3 w-3" />
         {config.label}
       </Badge>
     );
   };
 
   return (
     <DashboardLayout title="Payroll Runs" description="Manage payroll workflow and approvals">
       <div className="space-y-6">
         {/* Workflow Overview */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Play className="h-5 w-5" />
               Payroll Workflow
             </CardTitle>
             <CardDescription>
               Payroll runs go through a multi-step approval process
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex items-center justify-between max-w-2xl">
               {WORKFLOW_STEPS.map((step, index) => (
                 <div key={step} className="flex items-center">
                   <div className="flex flex-col items-center">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                       index === 0 ? 'bg-muted' : 
                       index === WORKFLOW_STEPS.length - 1 ? 'bg-primary text-primary-foreground' : 
                       'bg-muted'
                     }`}>
                       {index + 1}
                     </div>
                     <span className="text-xs mt-1 text-muted-foreground">
                       {STATUS_CONFIG[step].label}
                     </span>
                   </div>
                   {index < WORKFLOW_STEPS.length - 1 && (
                     <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                   )}
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Actions Bar */}
         <div className="flex justify-between items-center">
           <div className="flex gap-2">
             {(hasRole('super_admin') || hasRole('admin') || hasRole('preparer')) && (
               <Button onClick={() => setIsCreateDialogOpen(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 New Payroll Run
               </Button>
             )}
           </div>
         </div>
 
         {/* Payroll Runs Table */}
         <Card>
           <CardHeader>
             <CardTitle>All Payroll Runs</CardTitle>
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin" />
               </div>
             ) : payrollRuns.length === 0 ? (
               <div className="text-center py-12">
                 <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                 <h3 className="text-lg font-semibold mb-2">No Payroll Runs</h3>
                 <p className="text-muted-foreground mb-4">
                   Create your first payroll run to get started
                 </p>
                 {(hasRole('super_admin') || hasRole('admin') || hasRole('preparer')) && (
                   <Button onClick={() => setIsCreateDialogOpen(true)}>
                     <Plus className="h-4 w-4 mr-2" />
                     Create Payroll Run
                   </Button>
                 )}
               </div>
             ) : (
               <div className="rounded-lg border">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Client</TableHead>
                       <TableHead>Pay Period</TableHead>
                       <TableHead>Pay Date</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Created</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {payrollRuns.map((run) => (
                       <TableRow key={run.id}>
                         <TableCell className="font-medium">
                           {run.clients?.name || 'Unknown'}
                         </TableCell>
                         <TableCell>{run.pay_period}</TableCell>
                         <TableCell>
                           {format(new Date(run.pay_date), 'MMM d, yyyy')}
                         </TableCell>
                         <TableCell>{getStatusBadge(run.status)}</TableCell>
                         <TableCell className="text-muted-foreground">
                           {format(new Date(run.created_at), 'MMM d, yyyy')}
                         </TableCell>
                         <TableCell className="text-right">
                           {canTransition(run) && (
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => openTransitionDialog(run)}
                             >
                               <ArrowRight className="h-4 w-4 mr-1" />
                               Move to {STATUS_CONFIG[getNextStatus(run.status)!].label}
                             </Button>
                           )}
                           {run.status === 'published' && (
                             <Badge variant="outline" className="text-xs">
                               <CheckCircle2 className="h-3 w-3 mr-1" />
                               Complete
                             </Badge>
                           )}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       {/* Create Payroll Dialog */}
       <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Create Payroll Run</DialogTitle>
             <DialogDescription>
               Start a new payroll run for a client
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="client">Client *</Label>
               <Select
                 value={newPayroll.client_id}
                 onValueChange={(value) => setNewPayroll(prev => ({ ...prev, client_id: value }))}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select a client" />
                 </SelectTrigger>
                 <SelectContent>
                   {clients.map(client => (
                     <SelectItem key={client.id} value={client.id}>
                       {client.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="pay_period">Pay Period *</Label>
               <Input
                 id="pay_period"
                 placeholder="e.g., January 2026"
                 value={newPayroll.pay_period}
                 onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_period: e.target.value }))}
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="pay_date">Pay Date *</Label>
               <Input
                 id="pay_date"
                 type="date"
                 value={newPayroll.pay_date}
                 onChange={(e) => setNewPayroll(prev => ({ ...prev, pay_date: e.target.value }))}
               />
             </div>
           </div>
 
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
               Cancel
             </Button>
             <Button onClick={handleCreatePayroll} disabled={isSubmitting}>
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creating...
                 </>
               ) : (
                 'Create Payroll Run'
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Transition Dialog */}
       <Dialog open={isTransitionDialogOpen} onOpenChange={setIsTransitionDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Update Payroll Status</DialogTitle>
             <DialogDescription>
               Move this payroll run to the next stage
             </DialogDescription>
           </DialogHeader>
           
           {selectedRun && (
             <div className="py-4">
               <div className="flex items-center gap-4 mb-4">
                 <div className="flex-1">
                   <p className="text-sm text-muted-foreground">Current Status</p>
                   {getStatusBadge(selectedRun.status)}
                 </div>
                 <ArrowRight className="h-5 w-5 text-muted-foreground" />
                 <div className="flex-1">
                   <p className="text-sm text-muted-foreground">New Status</p>
                   {getStatusBadge(getNextStatus(selectedRun.status)!)}
                 </div>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="notes">Notes (optional)</Label>
                 <Textarea
                   id="notes"
                   placeholder="Add any notes about this transition..."
                   value={transitionNotes}
                   onChange={(e) => setTransitionNotes(e.target.value)}
                 />
               </div>
             </div>
           )}
 
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsTransitionDialogOpen(false)}>
               Cancel
             </Button>
             <Button onClick={handleTransition} disabled={isSubmitting}>
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Updating...
                 </>
               ) : (
                 'Confirm Transition'
               )}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </DashboardLayout>
   );
 }