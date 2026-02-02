import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Send, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteType: 'client' | 'employee';
  targetId: string; // client_id for client invites, employee_id for employee invites
  targetName: string; // Display name for confirmation
}

export function InviteDialog({
  open,
  onOpenChange,
  inviteType,
  targetId,
  targetName,
}: InviteDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = uuidv4();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const inviteData: {
        invite_type: 'client' | 'employee';
        email: string;
        token: string;
        invited_by: string;
        full_name: string | null;
        client_id?: string;
        employee_id?: string;
      } = {
        invite_type: inviteType,
        email: email.trim(),
        token,
        invited_by: user.id,
        full_name: fullName.trim() || null,
      };

      if (inviteType === 'client') {
        inviteData.client_id = targetId;
      } else {
        inviteData.employee_id = targetId;
      }

      const { error } = await supabase
        .from('invitations')
        .insert(inviteData);

      if (error) {
        if (error.code === '23505') {
          throw new Error('An invitation has already been sent to this email');
        }
        throw error;
      }

      const link = `${window.location.origin}/accept-invite?token=${token}`;
      setInviteLink(link);

      toast({
        title: 'Invitation created!',
        description: 'Share the invite link with the recipient.',
      });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to create invitation',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: 'Copied!',
        description: 'Invite link copied to clipboard',
      });
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setInviteLink(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send {inviteType === 'client' ? 'Client Portal' : 'Employee Portal'} Invite
          </DialogTitle>
          <DialogDescription>
            Invite someone to access the {inviteType === 'client' ? 'client' : 'employee'} portal
            for <strong>{targetName}</strong>
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <p className="text-sm">Invitation created successfully!</p>
            </div>
            
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with the recipient. It expires in 7 days.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Create Invite
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
