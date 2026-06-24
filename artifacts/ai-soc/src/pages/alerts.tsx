import { useListAlerts, useUpdateAlert, getListAlertsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckSquare, XCircle, Mail, MessageSquare, Smartphone, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Alerts() {
  const { data: alerts, isLoading } = useListAlerts();
  const queryClient = useQueryClient();
  const updateAlert = useUpdateAlert();

  const handleUpdateStatus = (id: number, status: 'acknowledged' | 'dismissed') => {
    updateAlert.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
      }
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <Smartphone className="w-3 h-3" />;
      case 'whatsapp': return <MessageSquare className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">SYSTEM ALERTS</h2>
          <p className="text-muted-foreground font-mono text-sm">Active notifications and dispatches</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono uppercase text-xs">Dispatch Time</TableHead>
                <TableHead className="font-mono uppercase text-xs">Channel</TableHead>
                <TableHead className="font-mono uppercase text-xs">Message</TableHead>
                <TableHead className="font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">FETCHING ALERTS...</TableCell></TableRow>
              ) : alerts?.map((alert) => (
                <TableRow key={alert.id} className={alert.status === 'pending' || alert.status === 'sent' ? 'bg-primary/5' : ''}>
                  <TableCell className="text-muted-foreground text-xs">
                    {alert.sentAt ? new Date(alert.sentAt).toLocaleTimeString() : new Date(alert.createdAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-1 rounded inline-flex bg-background">
                      {getChannelIcon(alert.channel)}
                      {alert.channel.replace('_', ' ')}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider ${
                      alert.status === 'pending' ? 'border-primary text-primary bg-primary/10 animate-pulse' :
                      alert.status === 'sent' ? 'border-chart-2 text-chart-2 bg-chart-2/10' :
                      alert.status === 'acknowledged' ? 'border-chart-4 text-chart-4 bg-chart-4/10' :
                      'border-muted text-muted-foreground bg-muted/10'
                    }`}>
                      {alert.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(alert.status === 'pending' || alert.status === 'sent') && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-card hover:bg-chart-4/20 hover:text-chart-4 border-border" onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}>
                            <CheckSquare className="w-3 h-3 mr-1" /> ACK
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-card hover:bg-muted border-border" onClick={() => handleUpdateStatus(alert.id, 'dismissed')}>
                            <XCircle className="w-3 h-3 mr-1" /> DISMISS
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {alerts?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">NO ALERTS FOUND</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
