import { useListCameras, useCreateCamera, useUpdateCamera, useDeleteCamera, useTestCameraConnection, getListCamerasQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Plus, Activity, RefreshCw, Trash2, Edit2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function Cameras() {
  const { data: cameras, isLoading } = useListCameras();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createCamera = useCreateCamera();
  const updateCamera = useUpdateCamera();
  const deleteCamera = useDeleteCamera();
  const testConnection = useTestCameraConnection();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", rtspUrl: "", protocol: "rtsp" as any, aiEnabled: true });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCamera.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCamerasQueryKey() });
        setIsAddOpen(false);
        setFormData({ name: "", location: "", rtspUrl: "", protocol: "rtsp", aiEnabled: true });
        toast({ title: "Camera registered", description: "System is initializing connection." });
      }
    });
  };

  const handleTest = (id: number) => {
    testConnection.mutate({ id }, {
      onSuccess: (res) => {
        toast({
          title: res.success ? "Connection OK" : "Connection Failed",
          description: res.message,
          variant: res.success ? "default" : "destructive",
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Remove camera from system?")) {
      deleteCamera.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCamerasQueryKey() });
          toast({ title: "Camera removed" });
        }
      });
    }
  };

  const toggleAi = (id: number, current: boolean) => {
    updateCamera.mutate({ id, data: { aiEnabled: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCamerasQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">SENSORS / CAMERAS</h2>
          <p className="text-muted-foreground font-mono text-sm">Manage physical video feeds and telemetry points</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> ADD SENSOR
            </Button>
          </DialogTrigger>
          <DialogContent className="font-mono">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider">Register New Sensor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Sensor Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Feed URL (RTSP/HTTP)</Label>
                <Input value={formData.rtspUrl} onChange={e => setFormData({...formData, rtspUrl: e.target.value})} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select value={formData.protocol} onValueChange={v => setFormData({...formData, protocol: v as any})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rtsp">RTSP</SelectItem>
                    <SelectItem value="onvif">ONVIF</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full uppercase" disabled={createCamera.isPending}>
                Deploy Sensor
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
                <TableHead className="font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs">Name</TableHead>
                <TableHead className="font-mono uppercase text-xs">Location</TableHead>
                <TableHead className="font-mono uppercase text-xs">AI Engine</TableHead>
                <TableHead className="font-mono uppercase text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">SCANNING NETWORK...</TableCell></TableRow>
              ) : cameras?.map((cam) => (
                <TableRow key={cam.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : cam.status === 'offline' ? 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]' : 'bg-muted'}`} />
                      <span className="uppercase text-xs tracking-widest">{cam.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{cam.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cam.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={cam.aiEnabled} onCheckedChange={() => toggleAi(cam.id, !!cam.aiEnabled)} />
                      <span className="text-[10px] uppercase text-muted-foreground">{cam.aiEnabled ? 'ACTIVE' : 'STANDBY'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTest(cam.id)} title="Test Connection">
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cam.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {cameras?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">NO SENSORS FOUND</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
