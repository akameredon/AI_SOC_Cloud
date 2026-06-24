import { Link, useLocation } from "wouter";
import { 
  Activity, 
  AlertTriangle, 
  Bell, 
  Camera, 
  LayoutDashboard, 
  Map, 
  Settings2,
  ShieldAlert,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveStream } from "@/hooks/useLiveStream";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cameras", href: "/cameras", icon: Camera },
  { name: "Events", href: "/events", icon: Activity },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Incidents", href: "/incidents", icon: ShieldAlert },
  { name: "Zones", href: "/zones", icon: Map },
  { name: "Rules Engine", href: "/alert-rules", icon: Settings2 },
];

function LiveClock() {
  const [time, setTime] = useState(() => new Date().toISOString().split("T")[1].split(".")[0]);
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toISOString().split("T")[1].split(".")[0]);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-foreground">{time} UTC</span>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  useLiveStream();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-sidebar border-r border-sidebar-border z-20 shadow-2xl relative">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-primary tracking-widest uppercase">
            <AlertTriangle className="h-5 w-5" />
            <span>AI-SOC Cloud</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer group font-mono",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary font-mono text-xs font-bold">OP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-sidebar-foreground">Operator 01</span>
              <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                SECURE CONN
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
             
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-mono font-semibold text-foreground tracking-wider uppercase">
              {navigation.find(n => n.href === location)?.name || "System"}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5 text-green-400 border border-green-400/30 bg-green-400/5 px-2 py-1 rounded">
              <Radio className="h-3 w-3 animate-pulse" />
              <span className="tracking-wider">LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span>SYS.TIME:</span>
              <LiveClock />
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
