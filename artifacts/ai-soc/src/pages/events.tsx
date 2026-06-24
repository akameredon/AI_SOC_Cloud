import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, ShieldAlert, Target, Info } from "lucide-react";

export default function Events() {
  const { data: events, isLoading } = useListEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground">SECURITY EVENTS</h2>
          <p className="text-muted-foreground font-mono text-sm">Real-time threat detection log</p>
        </div>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono uppercase text-xs">Time (UTC)</TableHead>
                <TableHead className="font-mono uppercase text-xs">Threat Type</TableHead>
                <TableHead className="font-mono uppercase text-xs">Risk</TableHead>
                <TableHead className="font-mono uppercase text-xs">Sensor</TableHead>
                <TableHead className="font-mono uppercase text-xs">Status</TableHead>
                <TableHead className="font-mono uppercase text-xs text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-sm">
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">ANALYZING LOGS...</TableCell></TableRow>
              ) : events?.map((event) => (
                <TableRow key={event.id} className={event.riskScore >= 80 ? "bg-destructive/5" : ""}>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(event.timestamp).toISOString().replace('T', ' ').substring(0,19)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="uppercase tracking-wider">{event.eventType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.riskScore >= 80 ? "destructive" : event.riskScore >= 50 ? "default" : "secondary"} className="rounded-sm font-bold">
                      {event.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.cameraName || `CAM-${event.cameraId}`}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider ${
                      event.status === 'new' ? 'border-primary text-primary bg-primary/10' :
                      event.status === 'resolved' ? 'border-muted text-muted-foreground bg-muted/10' :
                      'border-chart-2 text-chart-2 bg-chart-2/10'
                    }`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Info className="h-5 w-5 ml-auto" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="font-mono max-w-2xl bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="uppercase tracking-wider flex items-center gap-2 text-primary">
                            <Activity className="h-5 w-5" />
                            Event Analysis: {event.eventType}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase">Sensor Info</span>
                              <div className="text-sm border border-border bg-muted/20 p-2 rounded">
                                {event.cameraName} / {event.cameraLocation || 'Unknown'}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase">Threat Score</span>
                              <div className="text-sm border border-border bg-muted/20 p-2 rounded flex items-center gap-2">
                                <span className={`font-bold ${event.riskScore >= 80 ? 'text-destructive' : 'text-primary'}`}>{event.riskScore}/100</span>
                                <span className="text-muted-foreground">({Math.round(event.confidence * 100)}% conf)</span>
                              </div>
                            </div>
                          </div>
                          
                          {event.aiExplanation && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-primary uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                AI Engine Analysis
                              </span>
                              <div className="text-sm border border-primary/30 bg-primary/5 p-4 rounded text-foreground/90 leading-relaxed">
                                {event.aiExplanation}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {events?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">NO EVENTS LOGGED</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
