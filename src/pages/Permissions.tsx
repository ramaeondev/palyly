 import { useState, useEffect } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Badge } from '@/components/ui/badge';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Save, Shield, Info } from 'lucide-react';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
 } from '@/components/ui/tooltip';
 
 type AppRole = 'super_admin' | 'admin' | 'user' | 'preparer' | 'approver_l1' | 'approver_l2';
 
 interface RolePermission {
   id: string;
   firm_id: string;
   role: AppRole;
   resource: string;
   can_view: boolean;
   can_create: boolean;
   can_edit: boolean;
   can_delete: boolean;
   can_approve: boolean;
   can_publish: boolean;
 }
 
 const ROLES: { value: AppRole; label: string; description: string }[] = [
   { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
   { value: 'admin', label: 'Admin', description: 'Administrative access' },
   { value: 'preparer', label: 'Preparer', description: 'Can create and edit payroll' },
   { value: 'approver_l1', label: 'Approver L1', description: 'First level approval' },
   { value: 'approver_l2', label: 'Approver L2', description: 'Final approval and publish' },
   { value: 'user', label: 'User', description: 'Basic access' },
 ];
 
 const RESOURCES = [
   { value: 'firm', label: 'Firm Settings' },
   { value: 'clients', label: 'Clients' },
   { value: 'employees', label: 'Employees' },
   { value: 'payslips', label: 'Payslips' },
   { value: 'payroll', label: 'Payroll Runs' },
   { value: 'users', label: 'Users' },
 ];
 
 const PERMISSIONS = [
   { key: 'can_view', label: 'View' },
   { key: 'can_create', label: 'Create' },
   { key: 'can_edit', label: 'Edit' },
   { key: 'can_delete', label: 'Delete' },
   { key: 'can_approve', label: 'Approve' },
   { key: 'can_publish', label: 'Publish' },
 ];
 
 export default function PermissionsPage() {
   const { firm, hasRole } = useAuth();
   const { toast } = useToast();
   const [permissions, setPermissions] = useState<RolePermission[]>([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [selectedRole, setSelectedRole] = useState<AppRole>('preparer');
   const [hasChanges, setHasChanges] = useState(false);
 
   useEffect(() => {
     if (firm?.id) {
       fetchPermissions();
     }
   }, [firm?.id]);
 
   const fetchPermissions = async () => {
     try {
       const { data, error } = await supabase
         .from('role_permissions')
         .select('*')
         .eq('firm_id', firm!.id);
 
       if (error) throw error;
 
       // If no permissions exist, create defaults
       if (!data || data.length === 0) {
         await createDefaultPermissions();
       } else {
         setPermissions(data as RolePermission[]);
       }
     } catch (error) {
       console.error('Error fetching permissions:', error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to fetch permissions',
       });
     } finally {
       setLoading(false);
     }
   };
 
  const createDefaultPermissions = async () => {
    const defaults: Array<{
      firm_id: string;
      role: AppRole;
      resource: string;
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
      can_approve: boolean;
      can_publish: boolean;
    }> = [];
    
    ROLES.forEach(role => {
      RESOURCES.forEach(resource => {
        const isSuperAdmin = role.value === 'super_admin';
        const isAdmin = role.value === 'admin';
        const isPreparer = role.value === 'preparer';
        const isApproverL1 = role.value === 'approver_l1';
        const isApproverL2 = role.value === 'approver_l2';
        
        defaults.push({
          firm_id: firm!.id,
          role: role.value,
          resource: resource.value,
          can_view: isSuperAdmin || isAdmin || isPreparer || isApproverL1 || isApproverL2 || 
                    ['clients', 'employees'].includes(resource.value),
          can_create: isSuperAdmin || isAdmin || (isPreparer && ['employees', 'payslips', 'payroll'].includes(resource.value)),
          can_edit: isSuperAdmin || isAdmin || (isPreparer && ['employees', 'payslips', 'payroll'].includes(resource.value)),
          can_delete: isSuperAdmin || (isAdmin && resource.value !== 'firm'),
          can_approve: isSuperAdmin || isAdmin || ((isApproverL1 || isApproverL2) && resource.value === 'payroll'),
          can_publish: isSuperAdmin || isAdmin || (isApproverL2 && resource.value === 'payroll'),
        });
      });
    });

    try {
      // Cast to any to avoid type mismatch with new enum values not yet in types.ts
      const { data, error } = await supabase
        .from('role_permissions')
        .insert(defaults as any)
        .select();

      if (error) throw error;
      setPermissions(data as RolePermission[]);
    } catch (error) {
      console.error('Error creating default permissions:', error);
    }
  };
 
   const handlePermissionChange = (
     role: AppRole,
     resource: string,
     permission: string,
     value: boolean
   ) => {
     // Don't allow modifying super_admin permissions
     if (role === 'super_admin') {
       toast({
         title: 'Cannot modify',
         description: 'Super Admin permissions cannot be changed',
       });
       return;
     }
 
     setPermissions(prev => 
       prev.map(p => {
         if (p.role === role && p.resource === resource) {
           return { ...p, [permission]: value };
         }
         return p;
       })
     );
     setHasChanges(true);
   };
 
   const handleSave = async () => {
     setSaving(true);
     
     try {
       // Update each permission that changed
       const updates = permissions.filter(p => p.role !== 'super_admin');
       
       for (const perm of updates) {
         const { error } = await supabase
           .from('role_permissions')
           .update({
             can_view: perm.can_view,
             can_create: perm.can_create,
             can_edit: perm.can_edit,
             can_delete: perm.can_delete,
             can_approve: perm.can_approve,
             can_publish: perm.can_publish,
           })
           .eq('id', perm.id);
 
         if (error) throw error;
       }
 
       toast({
         title: 'Saved',
         description: 'Permissions have been updated',
       });
       setHasChanges(false);
     } catch (error) {
       console.error('Error saving permissions:', error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'Failed to save permissions',
       });
     } finally {
       setSaving(false);
     }
   };
 
   const getPermissionsForRole = (role: AppRole) => {
     return permissions.filter(p => p.role === role);
   };
 
   const rolePermissions = getPermissionsForRole(selectedRole);
 
   if (!hasRole('super_admin')) {
     return (
       <DashboardLayout title="Permissions" description="Access denied">
         <Card>
           <CardContent className="py-12 text-center">
             <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
             <p className="text-muted-foreground">
               Only Super Admins can manage permissions
             </p>
           </CardContent>
         </Card>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout title="Permissions Matrix" description="Configure role-based access control">
       <div className="space-y-6">
         {/* Role Selection */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Shield className="h-5 w-5" />
               Role Permissions
             </CardTitle>
             <CardDescription>
               Select a role to view and modify its permissions
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {ROLES.map(role => (
                 <Button
                   key={role.value}
                   variant={selectedRole === role.value ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setSelectedRole(role.value)}
                   className="gap-2"
                 >
                   {role.label}
                   {role.value === 'super_admin' && (
                     <Badge variant="secondary" className="text-xs">Locked</Badge>
                   )}
                 </Button>
               ))}
             </div>
             <p className="text-sm text-muted-foreground mt-4">
               {ROLES.find(r => r.value === selectedRole)?.description}
             </p>
           </CardContent>
         </Card>
 
         {/* Permissions Matrix */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <div>
               <CardTitle>
                 {ROLES.find(r => r.value === selectedRole)?.label} Permissions
               </CardTitle>
               <CardDescription>
                 Configure what this role can do with each resource
               </CardDescription>
             </div>
             {hasChanges && (
               <Button onClick={handleSave} disabled={saving}>
                 {saving ? (
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
             )}
           </CardHeader>
           <CardContent>
             {loading ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin" />
               </div>
             ) : (
               <div className="rounded-lg border overflow-hidden">
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead className="w-[200px]">Resource</TableHead>
                       {PERMISSIONS.map(perm => (
                         <TableHead key={perm.key} className="text-center w-[100px]">
                           <Tooltip>
                             <TooltipTrigger className="flex items-center gap-1 justify-center">
                               {perm.label}
                               <Info className="h-3 w-3 text-muted-foreground" />
                             </TooltipTrigger>
                             <TooltipContent>
                               <p>Allow {perm.label.toLowerCase()} operations</p>
                             </TooltipContent>
                           </Tooltip>
                         </TableHead>
                       ))}
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {RESOURCES.map(resource => {
                       const perm = rolePermissions.find(p => p.resource === resource.value);
                       if (!perm) return null;
                       
                       return (
                         <TableRow key={resource.value}>
                           <TableCell className="font-medium">{resource.label}</TableCell>
                           {PERMISSIONS.map(permission => (
                             <TableCell key={permission.key} className="text-center">
                               <Checkbox
                                 checked={perm[permission.key as keyof RolePermission] as boolean}
                                 onCheckedChange={(checked) => 
                                   handlePermissionChange(
                                     selectedRole,
                                     resource.value,
                                     permission.key,
                                     checked as boolean
                                   )
                                 }
                                 disabled={selectedRole === 'super_admin'}
                               />
                             </TableCell>
                           ))}
                         </TableRow>
                       );
                     })}
                   </TableBody>
                 </Table>
               </div>
             )}
 
             {selectedRole === 'super_admin' && (
               <div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-start gap-2">
                 <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-muted-foreground">
                   Super Admin permissions are locked and cannot be modified. This role always has full access to all resources.
                 </p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }