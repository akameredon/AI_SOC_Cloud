import { useGetDashboardSummary, useGetEventTimeline, useGetEventBreakdown, useGetCameraHealth } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, Camera, Clock, ShieldAlert, Video } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: timeline, isLoading: isLoadingTimeline } = useGetEventTimeline();
  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetEventBreakdown();
  const { data: cameraHealth, isLoading: isLoadingHealth } = useGetCameraHealth();

  if (isLoadingSummary || isLoadingTimeline || isLoadingBreakdown || isLoadingHealth) {
    return (
      <div className="flex items-center justify-center h-full text-primary font-mono text-sm animate-pulse">
        [ INITIALIZING TELEMETRY... ]
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground uppercase">Cameras Online</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-foreground">{summary?.onlineCameras || 0}</span>
                <span className="text-sm font-mono text-muted-foreground">/ {summary?.totalCameras || 0}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
          <div className="h-1 w-full bg-muted">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${((summary?.onlineCameras || 0) / (summary?.totalCameras || 1)) * 100}%` }} 
            />
          </div>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground uppercase">Active Alerts</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-chart-2">{summary?.activeAlerts || 0}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded bg-chart-2/10 flex items-center justify-center text-chart-2 border border-chart-2/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground uppercase">Critical Events</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-destructive">{summary?.criticalEvents || 0}</span>
                <span className="text-sm font-mono text-muted-foreground tracking-wider">TODAY</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground uppercase">Avg Risk Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-chart-4">{summary?.avgRiskScore?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded bg-chart-4/10 flex items-center justify-center text-chart-4 border border-chart-4/20">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Event Timeline (24H)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickFormatter={(val) => val.split('T')[1]?.substring(0,5) || val}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    fontFamily="monospace"
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Total Events" />
                  <Bar dataKey="critical" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} name="Critical" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="bg-card/50 border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Event Types</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="eventType"
                    stroke="none"
                  >
                    {(breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(breakdown || []).slice(0, 4).map((item, i) => (
                <div key={item.eventType} className="flex items-center gap-2 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))` }} />
                  <span className="text-muted-foreground truncate">{item.eventType.replace('_', ' ')}</span>
                  <span className="ml-auto font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Health Grid */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">System Health Matrix</CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] tracking-wider">LIVE</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(cameraHealth || []).map(camera => (
              <div 
                key={camera.id} 
                className={`p-3 border rounded bg-card/40 flex flex-col gap-2 ${
                  camera.status === 'online' ? 'border-primary/30' : 
                  camera.status === 'offline' ? 'border-destructive/50 bg-destructive/5' : 
                  'border-chart-2/50 bg-chart-2/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold truncate pr-2">{camera.name}</span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    camera.status === 'online' ? 'bg-primary' : 
                    camera.status === 'offline' ? 'bg-destructive animate-pulse' : 
                    'bg-chart-2'
                  }`} />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  {camera.location}
                </div>
                <div className="mt-auto flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">EVTS: <span className="text-foreground">{camera.eventCount}</span></span>
                  {camera.lastSeenAt && (
                    <span className="text-muted-foreground" title={camera.lastSeenAt}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(camera.lastSeenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(!cameraHealth || cameraHealth.length === 0) && (
              <div className="col-span-full py-8 text-center text-sm font-mono text-muted-foreground">
                NO SENSORS DETECTED
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
