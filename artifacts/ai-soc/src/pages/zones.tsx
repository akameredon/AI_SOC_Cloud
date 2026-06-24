import { useListZones, useCreateZone, useDeleteZone, getListZonesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Map, Plus, Trash2, Crosshair } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Zones() {
  const { data: zones, isLoading } = useListZones();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", cameraId: 1, type: "monitored" as any, active: true });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createZone.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() });
        setIsAddOpen(false);
        setFormData({ name: "", cameraId: 1, type: "monitored", active: true });
        toast({ title: "Zone deployed" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Remove detection zone?")) {
      deleteZone.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListZonesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">DETECTION ZONES</h2>
          <p className="text-muted-foreground font-mono text-sm">Spatial boundary configuration</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> DEFINE ZONE
            </Button>
          </DialogTrigger>
          <DialogContent className="font-mono border-primary/30">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-primary" /> Define Spatial Boundary
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Zone Identifier</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Sensor Link (Camera ID)</Label>
                <Input type="number" value={formData.cameraId} onChange={e => setFormData({...formData, cameraId: parseInt(e.target.value)})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Security Posture</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitored">MONITORED</SelectItem>
                    <SelectItem value="restricted">RESTRICTED</SelectItem>
                    <SelectItem value="safe">SAFE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full uppercase" disabled={createZone.isPending}>
                Commit Zone
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
                <TableHead className="font-mono uppercase text-xs">Zone ID</TableHead>
                <TableHead className="font-mono uppercase text-xs">Sensor Link</TableHead>
                <TableHead className="font-mono uppercase text-xs">Posture</TableHead>
                <TableHead className="font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">READING SPATIAL DATA...</TableCell></TableRow>
              ) : zones?.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-bold">{zone.name}</TableCell>
                  <TableCell className="text-muted-foreground">CAM-{zone.cameraId}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider font-bold ${
                      zone.type === 'restricted' ? 'border-destructive text-destructive bg-destructive/10' :
                      zone.type === 'monitored' ? 'border-primary text-primary bg-primary/10' :
                      'border-chart-4 text-chart-4 bg-chart-4/10'
                    }`}>
                      {zone.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${zone.active ? 'bg-chart-4' : 'bg-muted'}`} />
                      {zone.active ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(zone.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {zones?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">NO SPATIAL ZONES DEFINED</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
