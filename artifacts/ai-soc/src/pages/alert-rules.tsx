import { useListAlertRules, useCreateAlertRule, useDeleteAlertRule, getListAlertRulesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings2, Plus, Trash2, Cpu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AlertRules() {
  const { data: rules, isLoading } = useListAlertRules();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createRule = useCreateAlertRule();
  const deleteRule = useDeleteAlertRule();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", eventType: "any" as any, minRiskScore: 50, channels: "in_app,email", active: true });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRule.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAlertRulesQueryKey() });
        setIsAddOpen(false);
        setFormData({ name: "", eventType: "any", minRiskScore: 50, channels: "in_app,email", active: true });
        toast({ title: "Logic rule deployed" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Remove logic rule?")) {
      deleteRule.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertRulesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">LOGIC ENGINE</h2>
          <p className="text-muted-foreground font-mono text-sm">Automated dispatch and routing rules</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> ADD RULE
            </Button>
          </DialogTrigger>
          <DialogContent className="font-mono border-primary/30">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" /> Define Routing Logic
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Event</Label>
                  <Select value={formData.eventType} onValueChange={v => setFormData({...formData, eventType: v as any})}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">ANY</SelectItem>
                      <SelectItem value="intrusion">INTRUSION</SelectItem>
                      <SelectItem value="loitering">LOITERING</SelectItem>
                      <SelectItem value="tamper">TAMPER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min Risk Score</Label>
                  <Input type="number" min="0" max="100" value={formData.minRiskScore} onChange={e => setFormData({...formData, minRiskScore: parseInt(e.target.value)})} required className="bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dispatch Channels (comma separated)</Label>
                <Input value={formData.channels} onChange={e => setFormData({...formData, channels: e.target.value})} required className="bg-background" placeholder="e.g. in_app,sms,email" />
              </div>
              <Button type="submit" className="w-full uppercase" disabled={createRule.isPending}>
                Deploy Logic
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono uppercase text-xs">Rule ID</TableHead>
                <TableHead className="font-mono uppercase text-xs">Condition</TableHead>
                <TableHead className="font-mono uppercase text-xs">Action (Channels)</TableHead>
                <TableHead className="font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">READING LOGIC MATRIX...</TableCell></TableRow>
              ) : rules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-bold">{rule.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">IF {rule.eventType}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">AND</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">RISK {`>=`} {rule.minRiskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.channels.split(',').map(c => (
                        <span key={c} className="text-[10px] border border-primary/30 text-primary px-1.5 py-0.5 rounded uppercase">
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-muted'}`} />
                      {rule.active ? 'ACTIVE' : 'DISABLED'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rules?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">NO RULES CONFIGURED</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
