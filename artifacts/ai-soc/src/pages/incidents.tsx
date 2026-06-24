import { useListIncidents, useCreateIncident, getListIncidentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, Plus, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Incidents() {
  const { data: incidents, isLoading } = useListIncidents();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createIncident = useCreateIncident();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", severity: "medium" as any });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createIncident.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListIncidentsQueryKey() });
        setIsAddOpen(false);
        setFormData({ title: "", description: "", severity: "medium" });
        toast({ title: "Incident filed" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">INCIDENT REPORTS</h2>
          <p className="text-muted-foreground font-mono text-sm">Aggregated event analyses and investigations</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Plus className="mr-2 h-4 w-4" /> FILE INCIDENT
            </Button>
          </DialogTrigger>
          <DialogContent className="font-mono border-destructive/30">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider text-destructive flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Open New Investigation
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Incident Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={formData.severity} onValueChange={v => setFormData({...formData, severity: v as any})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">LOW</SelectItem>
                    <SelectItem value="medium">MEDIUM</SelectItem>
                    <SelectItem value="high">HIGH</SelectItem>
                    <SelectItem value="critical">CRITICAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description / Analyst Notes</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background min-h-[100px]" />
              </div>
              <Button type="submit" variant="destructive" className="w-full uppercase" disabled={createIncident.isPending}>
                Create Record
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
                <TableHead className="font-mono uppercase text-xs w-[120px]">Case ID</TableHead>
                <TableHead className="font-mono uppercase text-xs">Title</TableHead>
                <TableHead className="font-mono uppercase text-xs w-[100px]">Severity</TableHead>
                <TableHead className="font-mono uppercase text-xs w-[100px]">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">ACCESSING RECORDS...</TableCell></TableRow>
              ) : incidents?.map((incident) => (
                <TableRow key={incident.id} className={incident.severity === 'critical' ? 'bg-destructive/5' : ''}>
                  <TableCell className="text-muted-foreground font-bold text-xs">
                    CASE-{incident.id.toString().padStart(4, '0')}
                  </TableCell>
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider font-bold ${
                      incident.severity === 'critical' ? 'border-destructive text-destructive bg-destructive/10' :
                      incident.severity === 'high' ? 'border-chart-2 text-chart-2 bg-chart-2/10' :
                      incident.severity === 'medium' ? 'border-primary text-primary bg-primary/10' :
                      'border-muted text-muted-foreground bg-muted/10'
                    }`}>
                      {incident.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] uppercase text-muted-foreground border-b border-muted-foreground/30 pb-0.5">
                      {incident.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 hover:bg-primary/10 hover:text-primary">
                      <FolderOpen className="w-4 h-4 mr-2" /> OPEN
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {incidents?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">NO INCIDENTS ON RECORD</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
